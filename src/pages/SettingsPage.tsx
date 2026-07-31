import { useState, useEffect } from 'react'
import { Download, Upload, Trash2, Moon, Dumbbell, Bell, Calendar, FileJson, ShieldAlert, Camera } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { UserProfile, Objective, TimePreference } from '../domain/models'

const OBJETIVOS: { value: Objective; label: string }[] = [
  { value: 'definicion-sostenible', label: 'Definición sostenible' },
  { value: 'mantener-fuerza', label: 'Mantener fuerza' },
  { value: 'mejorar-cardio', label: 'Mejorar cardio' },
]

const HORARIOS: { value: TimePreference; label: string }[] = [
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'indiferente', label: 'Indiferente' },
]

export default function SettingsPage() {
  const { data, setProfile, updateProfile, clearAll, exportData, importData } = useAppStore()
  const profile = data.profile

  const [form, setForm] = useState({
    nombre: profile?.nombre ?? '',
    pesoInicial: profile?.pesoInicial ?? 93,
    altura: profile?.altura ?? 1.75,
    objetivo: (profile?.objetivo ?? 'definicion-sostenible') as Objective,
    preferenciasCardio: profile?.preferenciasCardio ?? ['run'],
    duracionMaxSesionMin: profile?.duracionMaxSesionMin ?? 60,
    preferenciaHorario: (profile?.preferenciaHorario ?? 'indiferente') as TimePreference,
    diasPreferidosLadder: profile?.diasPreferidosLadder ?? [1, 3, 5],
    horaInicioLaboral: profile?.horaInicioLaboral ?? '08:30',
    horaFinLaboral: profile?.horaFinLaboral ?? '16:30',
    recordatoriosActivos: profile?.recordatoriosActivos ?? true,
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        nombre: profile.nombre,
        pesoInicial: profile.pesoInicial,
        altura: profile.altura,
        objetivo: profile.objetivo,
        preferenciasCardio: profile.preferenciasCardio,
        duracionMaxSesionMin: profile.duracionMaxSesionMin,
        preferenciaHorario: profile.preferenciaHorario,
        diasPreferidosLadder: profile.diasPreferidosLadder,
        horaInicioLaboral: profile.horaInicioLaboral,
        horaFinLaboral: profile.horaFinLaboral,
        recordatoriosActivos: profile.recordatoriosActivos,
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) {
      const newProfile: UserProfile = {
        id: `u-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await setProfile(newProfile)
    } else {
      await updateProfile(form)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-trainner-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      await importData(text)
      alert('Datos importados correctamente.')
    }
    input.click()
  }

  const toggleDia = (dia: number) => {
    setForm((f) => ({
      ...f,
      diasPreferidosLadder: f.diasPreferidosLadder.includes(dia)
        ? f.diasPreferidosLadder.filter((d) => d !== dia)
        : [...f.diasPreferidosLadder, dia],
    }))
  }

  const toggleCardio = (tipo: 'run' | 'swim') => {
    setForm((f) => ({
      ...f,
      preferenciasCardio: f.preferenciasCardio.includes(tipo)
        ? f.preferenciasCardio.filter((c) => c !== tipo)
        : [...f.preferenciasCardio, tipo],
    }))
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Ajustes</h1>
        <p className="text-sm text-slate-400 mt-1">Configura tu perfil y preferencias</p>
      </header>

      <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Dumbbell size={16} />
          Perfil
        </h3>

        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Peso (kg)</label>
            <input
              type="number"
              value={form.pesoInicial}
              onChange={(e) => setForm({ ...form, pesoInicial: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Altura (m)</label>
            <input
              type="number"
              step="0.01"
              value={form.altura}
              onChange={(e) => setForm({ ...form, altura: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Objetivo</label>
          <div className="grid grid-cols-1 gap-2">
            {OBJETIVOS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, objetivo: opt.value })}
                className={`rounded-xl py-2.5 text-sm font-medium transition-colors text-left px-4 ${
                  form.objetivo === opt.value ? 'bg-lime-500/15 text-lime-400 border border-lime-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Días preferidos de Ladder</label>
          <div className="flex gap-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia, i) => (
              <button
                key={i}
                onClick={() => toggleDia(i + 1)}
                className={`h-10 w-10 rounded-xl text-sm font-medium transition-colors ${
                  form.diasPreferidosLadder.includes(i + 1)
                    ? 'bg-lime-500 text-slate-950'
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                {dia}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Inicio laboral</label>
            <input
              type="time"
              value={form.horaInicioLaboral}
              onChange={(e) => setForm({ ...form, horaInicioLaboral: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Fin laboral</label>
            <input
              type="time"
              value={form.horaFinLaboral}
              onChange={(e) => setForm({ ...form, horaFinLaboral: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Preferencia de horario</label>
          <div className="grid grid-cols-3 gap-2">
            {HORARIOS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, preferenciaHorario: opt.value })}
                className={`rounded-xl py-2 text-sm font-medium transition-colors ${
                  form.preferenciaHorario === opt.value ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Preferencias de cardio</label>
          <div className="flex gap-2">
            <button
              onClick={() => toggleCardio('run')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                form.preferenciasCardio.includes('run') ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
              }`}
            >
              Carrera
            </button>
            <button
              onClick={() => toggleCardio('swim')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                form.preferenciasCardio.includes('swim') ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
              }`}
            >
              Natación
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Duración máxima por sesión (min)</label>
          <input
            type="number"
            value={form.duracionMaxSesionMin}
            onChange={(e) => setForm({ ...form, duracionMaxSesionMin: parseInt(e.target.value) || 60 })}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300 flex items-center gap-2">
            <Bell size={16} />
            Recordatorios visuales
          </span>
          <button
            onClick={() => setForm({ ...form, recordatoriosActivos: !form.recordatoriosActivos })}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              form.recordatoriosActivos ? 'bg-lime-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                form.recordatoriosActivos ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-lime-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-lime-400"
        >
          {saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <FileJson size={16} />
          Datos
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleExport} className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800">
            <Download size={16} />
            Exportar JSON
          </button>
          <button onClick={handleImport} className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800">
            <Upload size={16} />
            Importar
          </button>
        </div>
        <button
          onClick={async () => {
            if (confirm('¿Estás seguro? Se borrarán todos los datos locales.')) {
              await clearAll()
            }
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/40"
        >
          <Trash2 size={16} />
          Borrar todos los datos
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200">Próximamente</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-slate-500">
            <Moon size={14} />
            Apple Health (sueño, peso, pasos)
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} />
            Google Calendar
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-500">
            <Camera size={14} />
            Análisis de capturas Ladder
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-500">
            <Dumbbell size={14} />
            Coach conversacional opcional
          </li>
        </ul>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-900/30 bg-amber-950/10 p-4">
        <ShieldAlert className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
        <p className="text-xs text-amber-200/80 leading-relaxed">
          Esta aplicación no sustituye asesoramiento médico o profesional. Consulta a un especialista antes de modificar tu rutina de entrenamiento.
        </p>
      </div>
    </div>
  )
}
