import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Moon, Sun, Battery, Activity, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { DailyCheckIn, AvailableTime } from '../domain/models'

const SALUDOS = [
  'Buenos días. Hoy toca avanzar sin gastar energía de más.',
  'Buenos días. Construye el hábito, no la perfección.',
  'Buenas tardes. Lo importante es que estés aquí.',
  'Buenas noches. Descansa bien, mañana hay más.',
]

const FRASES_MOTIVACION = [
  'La consistencia vence al talento cuando el talento no es constante.',
  'Un día de descanso no es un día perdido.',
  'Hoy es un buen día para ser mejor que ayer.',
  'Escucha a tu cuerpo, no a tu ego.',
]

function getSaludo(): string {
  const hour = new Date().getHours()
  const base = hour < 12 ? SALUDOS[0] : hour < 18 ? SALUDOS[2] : SALUDOS[3]
  return base
}

function getFrase(): string {
  const today = new Date().getDate()
  return FRASES_MOTIVACION[today % FRASES_MOTIVACION.length]
}

const TIME_OPTIONS: { value: AvailableTime; label: string }[] = [
  { value: '0-20', label: '0-20 min' },
  { value: '20-40', label: '20-40 min' },
  { value: '40-60', label: '40-60 min' },
  { value: '60+', label: '+60 min' },
]

const LOCATION_OPTIONS = [
  { value: 'gimnasio', label: 'Gimnasio' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'casa', label: 'Casa' },
]

export default function TodayPage() {
  const { data, todayRecommendation, addCheckIn, recalculate } = useAppStore()
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const existingCheckIn = data.checkIns.find((c) => c.date === todayStr)

  const handleCheckIn = async (patch: Partial<DailyCheckIn>) => {
    const current = existingCheckIn || {
      id: `ci-${todayStr}`,
      date: todayStr,
      horasSueno: 7,
      calidadSueno: 3,
      energia: 3,
      estres: 2,
      dolorFatiga: 3,
      tiempoDisponible: '40-60',
      ubicacionesDisponibles: ['gimnasio'],
      createdAt: new Date().toISOString(),
    }
    const updated = { ...current, ...patch }
    await addCheckIn(updated)
    recalculate()
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          {format(today, 'EEEE d \'de\' MMMM', { locale: es })}
        </p>
        <h1 className="text-2xl font-semibold text-slate-100 mt-1 leading-tight">{getSaludo()}</h1>
      </header>

      {todayRecommendation && (
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                todayRecommendation.prioridad === 'imprescindible'
                  ? 'bg-lime-500/10 text-lime-400'
                  : todayRecommendation.prioridad === 'recomendable'
                  ? 'bg-sky-500/10 text-sky-400'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {todayRecommendation.prioridad}
              </span>
              <h2 className="text-xl font-semibold text-slate-100 mt-3">{todayRecommendation.mensajePrincipal}</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{todayRecommendation.razon}</p>
            </div>
          </div>

          {todayRecommendation.horaSugerida && (
            <p className="text-xs text-slate-500 mt-3">Hora sugerida: {todayRecommendation.horaSugerida}</p>
          )}

          {todayRecommendation.alternativas.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Alternativas</p>
              <ul className="space-y-1.5">
                {todayRecommendation.alternativas.map((alt, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                    {alt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {todayRecommendation.senalesPrecaucion.length > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3">
              <AlertTriangle className="text-amber-400 mt-0.5" size={16} />
              <p className="text-xs text-amber-200/80 leading-relaxed">
                {todayRecommendation.senalesPrecaucion[0]}
              </p>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button className="flex-1 rounded-xl bg-lime-500 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-lime-400 active:scale-[0.98]">
              Completar
            </button>
            <button className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800">
              Replanificar
            </button>
            <button className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800">
              No puedo hoy
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Check-in diario</h3>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Moon size={16} />
              Horas de sueño
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={existingCheckIn?.horasSueno ?? 7}
              onChange={(e) => handleCheckIn({ horasSueno: parseFloat(e.target.value) })}
              className="w-full accent-lime-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0h</span>
              <span className="text-slate-300 font-medium">{existingCheckIn?.horasSueno ?? 7}h</span>
              <span>12h</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Sun size={16} />
              Calidad de sueño
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => handleCheckIn({ calidadSueno: v as 1|2|3|4|5 })}
                  className={`h-9 flex-1 rounded-lg text-sm font-medium transition-colors ${
                    (existingCheckIn?.calidadSueno ?? 3) >= v
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Battery size={16} />
              Energía
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => handleCheckIn({ energia: v as 1|2|3|4|5 })}
                  className={`h-9 flex-1 rounded-lg text-sm font-medium transition-colors ${
                    (existingCheckIn?.energia ?? 3) >= v
                      ? 'bg-lime-500/20 text-lime-400'
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Activity size={16} />
              Estrés
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => handleCheckIn({ estres: v as 1|2|3|4|5 })}
                  className={`h-9 flex-1 rounded-lg text-sm font-medium transition-colors ${
                    (existingCheckIn?.estres ?? 2) >= v
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <AlertTriangle size={16} />
              Dolor / fatiga
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={existingCheckIn?.dolorFatiga ?? 3}
              onChange={(e) => handleCheckIn({ dolorFatiga: parseInt(e.target.value) })}
              className="w-full accent-lime-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0</span>
              <span className="text-slate-300 font-medium">{existingCheckIn?.dolorFatiga ?? 3}/10</span>
              <span>10</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Tiempo disponible hoy</label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleCheckIn({ tiempoDisponible: opt.value })}
                  className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    (existingCheckIn?.tiempoDisponible ?? '40-60') === opt.value
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Ubicaciones disponibles</label>
            <div className="flex flex-wrap gap-2">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const current = existingCheckIn?.ubicacionesDisponibles ?? ['gimnasio']
                    const next = current.includes(opt.value as any)
                      ? current.filter((v) => v !== opt.value)
                      : [...current, opt.value]
                    handleCheckIn({ ubicacionesDisponibles: next as any })
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    (existingCheckIn?.ubicacionesDisponibles ?? ['gimnasio']).includes(opt.value as any)
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                      : 'bg-slate-800 text-slate-500 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Resumen</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-800/50 p-3">
            <p className="text-xs text-slate-500">Sesión principal</p>
            <p className="text-sm font-medium text-slate-200 mt-1">{todayRecommendation?.mensajePrincipal ?? 'Sin definir'}</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3">
            <p className="text-xs text-slate-500">Pasos objetivo</p>
            <p className="text-sm font-medium text-slate-200 mt-1">6.000 - 8.000</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 italic">"{getFrase()}"</p>
      </section>
    </div>
  )
}

