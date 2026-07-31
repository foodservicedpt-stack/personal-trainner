import { useMemo } from 'react'
import { format, parseISO, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrendingUp, Camera, Trash2, Scale, Ruler, Image } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { ProgressPhotoMetadata, WeightEntry, DailyCheckIn } from '../domain/models'

export default function ProgressPage() {
  const { data, addWeightEntry, addWaistEntry, addProgressPhoto, removeProgressPhoto } = useAppStore()
  const weightEntries = data.weightEntries.slice(-30)
  const waistEntries = data.waistEntries.slice(-10)
  const photos = data.progressPhotos.slice(-20)

  const lastWeight = weightEntries[weightEntries.length - 1]
  const previousWeight = weightEntries[weightEntries.length - 2]

  const weightTrend = useMemo(() => {
    if (!lastWeight || !previousWeight) return null
    const diff = lastWeight.pesoKg - previousWeight.pesoKg
    if (Math.abs(diff) < 0.1) return { label: 'Estable', color: 'text-slate-400' }
    if (diff < 0) return { label: `-${Math.abs(diff).toFixed(1)} kg`, color: 'text-lime-400' }
    return { label: `+${diff.toFixed(1)} kg`, color: 'text-orange-400' }
  }, [lastWeight, previousWeight])

  const handleAddWeight = async () => {
    const peso = prompt('Introduce tu peso en kg:')
    if (!peso || isNaN(parseFloat(peso))) return
    await addWeightEntry({
      id: `w-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      pesoKg: parseFloat(peso),
      createdAt: new Date().toISOString(),
    })
  }

  const handleAddWaist = async () => {
    const cintura = prompt('Introduce tu cintura en cm:')
    if (!cintura || isNaN(parseFloat(cintura))) return
    await addWaistEntry({
      id: `wa-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      cinturaCm: parseFloat(cintura),
      createdAt: new Date().toISOString(),
    })
  }

  const handleAddPhoto = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      await addProgressPhoto({
        id: `pp-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        fileName: file.name,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
      })
      alert('Foto guardada localmente. Recuerda que el almacenamiento es privado en tu dispositivo.')
    }
    input.click()
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Progreso</h1>
        <p className="text-sm text-slate-400 mt-1">Datos privados, solo en tu dispositivo</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleAddWeight} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-left shadow-lg shadow-slate-950/20 transition-colors hover:border-slate-700">
          <Scale className="text-slate-500 mb-2" size={20} />
          <p className="text-xs text-slate-500">Peso</p>
          <p className="text-lg font-semibold text-slate-200">{lastWeight ? `${lastWeight.pesoKg.toFixed(1)} kg` : 'Sin datos'}</p>
          {weightTrend && <p className={`text-xs ${weightTrend.color}`}>{weightTrend.label}</p>}
        </button>
        <button onClick={handleAddWaist} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-left shadow-lg shadow-slate-950/20 transition-colors hover:border-slate-700">
          <Ruler className="text-slate-500 mb-2" size={20} />
          <p className="text-xs text-slate-500">Cintura</p>
          <p className="text-lg font-semibold text-slate-200">
            {waistEntries[waistEntries.length - 1] ? `${waistEntries[waistEntries.length - 1].cinturaCm.toFixed(0)} cm` : 'Sin datos'}
          </p>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Peso - últimos 7 días</h3>
        {weightEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="text-slate-700 mb-2" size={32} />
            <p className="text-sm text-slate-500">Registra tu peso para ver la tendencia</p>
          </div>
        ) : (
          <div className="space-y-2">
            {weightEntries.slice(-7).map((entry: WeightEntry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 px-3 py-2">
                <span className="text-xs text-slate-500">{format(parseISO(entry.date), 'd MMM', { locale: es })}</span>
                <span className="text-sm font-medium text-slate-200">{entry.pesoKg.toFixed(1)} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Cumplimiento de Ladder</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">Sesiones completadas</span>
              <span className="text-slate-200 font-medium">{data.ladderSessions.length} esta semana</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-lime-500 transition-all"
                style={{ width: `${Math.min(100, (data.ladderSessions.length / 3) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-800/50 p-3">
            <p className="text-xs text-slate-500">Carrera</p>
            <p className="text-sm font-medium text-slate-200">
              {data.runSessions.filter((s: any) => {
                const d = parseISO(s.date)
                const week = startOfWeek(new Date(), { weekStartsOn: 1 })
                return d >= week
              }).reduce((a: number, s: any) => a + s.duracionMin, 0)} min esta semana
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3">
            <p className="text-xs text-slate-500">Natación</p>
            <p className="text-sm font-medium text-slate-200">
              {data.swimSessions.filter((s: any) => {
                const d = parseISO(s.date)
                const week = startOfWeek(new Date(), { weekStartsOn: 1 })
                return d >= week
              }).reduce((a: number, s: any) => a + s.duracionMin, 0)} min esta semana
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Fotos de progreso</h3>
          <button onClick={handleAddPhoto} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700">
            <Camera size={14} />
            Añadir
          </button>
        </div>
        {photos.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Añade fotos para ver tu evolución. Se guardan solo en tu dispositivo.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo: ProgressPhotoMetadata) => (
              <div key={photo.id} className="relative aspect-square rounded-xl bg-slate-800 flex items-center justify-center">
                <Image className="text-slate-600" size={24} />
                <button
                  onClick={async () => {
                    if (confirm('Eliminar esta foto?')) await removeProgressPhoto(photo.id)
                  }}
                  className="absolute top-1 right-1 rounded-full bg-slate-950/80 p-1 text-slate-400 hover:text-red-400"
                  aria-label="Eliminar foto"
                >
                  <Trash2 size={12} />
                </button>
                <span className="absolute bottom-1 left-1 text-[10px] text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded">
                  {format(parseISO(photo.date), 'd MMM', { locale: es })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Sueño y recuperación</h3>
        {data.checkIns.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Completa el check-in diario para ver tendencias.</p>
        ) : (
          <div className="space-y-2">
            {data.checkIns.slice(-5).map((ci: DailyCheckIn) => (
              <div key={ci.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 px-3 py-2">
                <span className="text-xs text-slate-500">{format(parseISO(ci.date), 'd MMM', { locale: es })}</span>
                <div className="flex gap-3 text-xs text-slate-400">
                  <span>{ci.horasSueno}h sueño</span>
                  <span>E:{ci.energia}</span>
                  <span>Dolor:{ci.dolorFatiga}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
