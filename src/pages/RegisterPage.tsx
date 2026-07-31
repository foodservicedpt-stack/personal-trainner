import { useState, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { format } from 'date-fns'
import type { LadderSession, RunSession, SwimSession, RecoveryActivity, LadderType, RunIntensity, SwimType, LegLoad } from '../domain/models'

type Tab = 'ladder' | 'run' | 'swim' | 'recovery'

const LADDER_TYPES: { value: LadderType; label: string }[] = [
  { value: 'torso', label: 'Torso' },
  { value: 'pierna-pesada', label: 'Pierna pesada' },
  { value: 'pierna-moderada', label: 'Pierna moderada' },
  { value: 'full-body', label: 'Full body' },
  { value: 'hibrido', label: 'Híbrido/Conditioning' },
  { value: 'recuperacion', label: 'Recuperación' },
]

const RUN_INTENSITIES: { value: RunIntensity; label: string }[] = [
  { value: 'suave', label: 'Suave' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'intervalos', label: 'Intervalos' },
]

const SWIM_TYPES: { value: SwimType; label: string }[] = [
  { value: 'tecnica', label: 'Técnica' },
  { value: 'suave', label: 'Suave' },
  { value: 'intervalos', label: 'Intervalos' },
]

const LEG_LOADS: { value: LegLoad; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
]

export default function RegisterPage() {
  const { addLadderSession, addRunSession, addSwimSession, addRecoveryActivity } = useAppStore()
  const [tab, setTab] = useState<Tab>('ladder')
  const today = format(new Date(), 'yyyy-MM-dd')

  const [ladder, setLadder] = useState({ tipo: 'torso' as LadderType, duracionMin: 45, rpe: 7, cargaPiernas: 'media' as LegLoad, notas: '' })
  const [run, setRun] = useState({ duracionMin: 30, distanciaKm: '', intensidad: 'suave' as RunIntensity, rpe: 5, notas: '' })
  const [swim, setSwim] = useState({ duracionMin: 30, metros: '', tipo: 'suave' as SwimType, rpe: 5, notas: '' })
  const [recovery, setRecovery] = useState({ pasos: 6000, movilidadMin: 0, caminataMin: 0, descansoMin: 0, notas: '' })
  const [capture, setCapture] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSaveLadder = async () => {
    setSaving(true)
    const session: LadderSession = {
      id: `lad-${Date.now()}`,
      date: today,
      tipo: ladder.tipo,
      duracionMin: ladder.duracionMin,
      rpe: ladder.rpe,
      cargaPiernas: ladder.cargaPiernas,
      notas: ladder.notas || undefined,
      capturaDataUrl: capture || undefined,
      completedAt: new Date().toISOString(),
    }
    await addLadderSession(session)
    setSaving(false)
    alert('Sesión Ladder registrada correctamente.')
  }

  const handleSaveRun = async () => {
    setSaving(true)
    const session: RunSession = {
      id: `run-${Date.now()}`,
      date: today,
      duracionMin: run.duracionMin,
      distanciaKm: run.distanciaKm ? parseFloat(run.distanciaKm) : undefined,
      intensidad: run.intensidad,
      rpe: run.rpe,
      notas: run.notas || undefined,
      completedAt: new Date().toISOString(),
    }
    await addRunSession(session)
    setSaving(false)
    alert('Carrera registrada correctamente.')
  }

  const handleSaveSwim = async () => {
    setSaving(true)
    const session: SwimSession = {
      id: `swi-${Date.now()}`,
      date: today,
      duracionMin: swim.duracionMin,
      metros: swim.metros ? parseInt(swim.metros) : undefined,
      tipo: swim.tipo,
      rpe: swim.rpe,
      notas: swim.notas || undefined,
      completedAt: new Date().toISOString(),
    }
    await addSwimSession(session)
    setSaving(false)
    alert('Natación registrada correctamente.')
  }

  const handleSaveRecovery = async () => {
    setSaving(true)
    const activity: RecoveryActivity = {
      id: `rec-${Date.now()}`,
      date: today,
      pasos: recovery.pasos,
      movilidadMin: recovery.movilidadMin,
      caminataMin: recovery.caminataMin,
      descansoMin: recovery.descansoMin,
      notas: recovery.notas || undefined,
      completedAt: new Date().toISOString(),
    }
    await addRecoveryActivity(activity)
    setSaving(false)
    alert('Recuperación registrada correctamente.')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCapture(reader.result as string)
    reader.readAsDataURL(file)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'ladder', label: 'Ladder' },
    { key: 'run', label: 'Carrera' },
    { key: 'swim', label: 'Natación' },
    { key: 'recovery', label: 'Recuperación' },
  ]

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Registrar</h1>
        <p className="text-sm text-slate-400 mt-1">Añade tu entrenamiento de hoy</p>
      </header>

      <div className="flex rounded-xl bg-slate-900 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-lime-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ladder' && (
        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Tipo de sesión</label>
            <div className="grid grid-cols-2 gap-2">
              {LADDER_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLadder({ ...ladder, tipo: opt.value })}
                  className={`rounded-xl py-2 text-sm font-medium transition-colors ${
                    ladder.tipo === opt.value ? 'bg-lime-500/15 text-lime-400 border border-lime-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Duración (min)</label>
            <input
              type="number"
              value={ladder.duracionMin}
              onChange={(e) => setLadder({ ...ladder, duracionMin: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">RPE (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={ladder.rpe}
              onChange={(e) => setLadder({ ...ladder, rpe: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Carga de piernas</label>
            <div className="grid grid-cols-3 gap-2">
              {LEG_LOADS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLadder({ ...ladder, cargaPiernas: opt.value })}
                  className={`rounded-xl py-2 text-sm font-medium transition-colors ${
                    ladder.cargaPiernas === opt.value ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Notas (opcional)</label>
            <textarea
              value={ladder.notas}
              onChange={(e) => setLadder({ ...ladder, notas: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-lime-500/50 focus:outline-none"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Captura de Ladder (opcional)</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {capture ? (
              <div className="relative">
                <img src={capture} alt="Captura" className="w-full rounded-xl border border-slate-800" />
                <button onClick={() => setCapture(null)} className="absolute top-2 right-2 rounded-full bg-slate-950/80 p-1 text-slate-300">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-4 text-sm text-slate-500 hover:border-slate-600 hover:text-slate-400"
              >
                <Camera size={18} />
                Añadir captura
              </button>
            )}
            {capture && (
              <p className="text-xs text-slate-500 mt-2">Captura guardada. El análisis automático llegará más adelante.</p>
            )}
          </div>

          <button
            onClick={handleSaveLadder}
            disabled={saving}
            className="w-full rounded-xl bg-lime-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-lime-400 disabled:opacity-50"
          >
            Guardar sesión Ladder
          </button>
        </div>
      )}

      {tab === 'run' && (
        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Duración (min)</label>
            <input
              type="number"
              value={run.duracionMin}
              onChange={(e) => setRun({ ...run, duracionMin: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Distancia (km, opcional)</label>
            <input
              type="number"
              step="0.01"
              value={run.distanciaKm}
              onChange={(e) => setRun({ ...run, distanciaKm: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Intensidad</label>
            <div className="grid grid-cols-3 gap-2">
              {RUN_INTENSITIES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRun({ ...run, intensidad: opt.value })}
                  className={`rounded-xl py-2 text-sm font-medium transition-colors ${
                    run.intensidad === opt.value ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">RPE (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={run.rpe}
              onChange={(e) => setRun({ ...run, rpe: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Notas (opcional)</label>
            <textarea
              value={run.notas}
              onChange={(e) => setRun({ ...run, notas: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-lime-500/50 focus:outline-none"
              rows={2}
            />
          </div>
          <button onClick={handleSaveRun} disabled={saving} className="w-full rounded-xl bg-lime-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-lime-400 disabled:opacity-50">
            Guardar carrera
          </button>
        </div>
      )}

      {tab === 'swim' && (
        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Duración (min)</label>
            <input
              type="number"
              value={swim.duracionMin}
              onChange={(e) => setSwim({ ...swim, duracionMin: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Metros (opcional)</label>
            <input
              type="number"
              value={swim.metros}
              onChange={(e) => setSwim({ ...swim, metros: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {SWIM_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSwim({ ...swim, tipo: opt.value })}
                  className={`rounded-xl py-2 text-sm font-medium transition-colors ${
                    swim.tipo === opt.value ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">RPE (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={swim.rpe}
              onChange={(e) => setSwim({ ...swim, rpe: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Notas (opcional)</label>
            <textarea
              value={swim.notas}
              onChange={(e) => setSwim({ ...swim, notas: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-lime-500/50 focus:outline-none"
              rows={2}
            />
          </div>
          <button onClick={handleSaveSwim} disabled={saving} className="w-full rounded-xl bg-lime-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-lime-400 disabled:opacity-50">
            Guardar natación
          </button>
        </div>
      )}

      {tab === 'recovery' && (
        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Pasos</label>
            <input
              type="number"
              value={recovery.pasos}
              onChange={(e) => setRecovery({ ...recovery, pasos: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Movilidad (min)</label>
            <input
              type="number"
              value={recovery.movilidadMin}
              onChange={(e) => setRecovery({ ...recovery, movilidadMin: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Caminata (min)</label>
            <input
              type="number"
              value={recovery.caminataMin}
              onChange={(e) => setRecovery({ ...recovery, caminataMin: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Descanso (min)</label>
            <input
              type="number"
              value={recovery.descansoMin}
              onChange={(e) => setRecovery({ ...recovery, descansoMin: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Notas (opcional)</label>
            <textarea
              value={recovery.notas}
              onChange={(e) => setRecovery({ ...recovery, notas: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-lime-500/50 focus:outline-none"
              rows={2}
            />
          </div>
          <button onClick={handleSaveRecovery} disabled={saving} className="w-full rounded-xl bg-lime-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-lime-400 disabled:opacity-50">
            Guardar recuperación
          </button>
        </div>
      )}
    </div>
  )
}
