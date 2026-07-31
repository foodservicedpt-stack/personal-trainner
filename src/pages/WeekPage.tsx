import { useState, useMemo } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, X, Move, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { findRescheduleOptions } from '../domain/ruleEngine'
import type { CalendarEvent, PlannedActivity, ActivityType } from '../domain/models'

const DAYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
const ACTIVITY_COLORS: Record<ActivityType, { bg: string; border: string; text: string; dot: string }> = {
  ladder: { bg: 'bg-lime-500/10', border: 'border-lime-500/30', text: 'text-lime-400', dot: 'bg-lime-400' },
  run: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  swim: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', dot: 'bg-sky-400' },
  recovery: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', dot: 'bg-violet-400' },
  rest: { bg: 'bg-slate-800/50', border: 'border-slate-700/50', text: 'text-slate-400', dot: 'bg-slate-500' },
  event: { bg: 'bg-slate-800/50', border: 'border-slate-700/50', text: 'text-slate-300', dot: 'bg-slate-400' },
}

const STATUS_ICON: Record<string, string> = {
  programado: '●',
  completado: '✓',
  opcional: '○',
  movido: '→',
  cancelado: '✕',
  perdido: '—',
}

export default function WeekPage() {
  const { data, setWeekPlan, addCalendarEvent } = useAppStore()
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const [showAddEvent, setShowAddEvent] = useState(false)
  const [eventDay, setEventDay] = useState(format(today, 'yyyy-MM-dd'))
  const [showReschedule, setShowReschedule] = useState<{ day: string; actividadId: string } | null>(null)
  const [newEvent, setNewEvent] = useState({ titulo: '', tipo: 'trabajo' as CalendarEvent['tipo'], duracionHoras: 1, notas: '' })

  const plan = useMemo(() => {
    const startStr = format(weekStart, 'yyyy-MM-dd')
    const endStr = format(weekEnd, 'yyyy-MM-dd')
    if (data.weekPlan && data.weekPlan.startDate === startStr) return data.weekPlan
    return {
      startDate: startStr,
      endDate: endStr,
      actividades: [] as PlannedActivity[],
      eventos: data.calendarEvents.filter((e) => e.date >= startStr && e.date <= endStr),
      updatedAt: new Date().toISOString(),
    }
  }, [data.weekPlan, data.calendarEvents, weekStart, weekEnd])

  const handleAddEvent = async () => {
    if (!newEvent.titulo.trim()) return
    const dateStr = eventDay
    const event: CalendarEvent = {
      id: `evt-${Date.now()}`,
      date: dateStr,
      titulo: newEvent.titulo,
      tipo: newEvent.tipo,
      duracionHoras: newEvent.duracionHoras,
      notas: newEvent.notas || undefined,
      createdAt: new Date().toISOString(),
    }
    await addCalendarEvent(event)
    setShowAddEvent(false)
    setNewEvent({ titulo: '', tipo: 'trabajo', duracionHoras: 1, notas: '' })
  }

  const rescheduleOptions = showReschedule
    ? findRescheduleOptions(plan, { date: showReschedule.day, actividadId: showReschedule.actividadId }, data.profile, data)
    : []

  const ladderCount = plan.actividades.filter((a: PlannedActivity) => a.type === 'ladder' && a.status !== 'cancelado' && a.status !== 'perdido').length
  const completedCount = plan.actividades.filter((a: PlannedActivity) => a.status === 'completado').length

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Semana del {format(weekStart, 'd MMM', { locale: es })}
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">Tu semana</h1>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="rounded-xl bg-lime-500 p-2.5 text-slate-950 transition-colors hover:bg-lime-400"
          aria-label="Añadir evento"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Ladder:</span>
          <span className="text-sm font-semibold text-slate-200">{completedCount}/{ladderCount}</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <p className="text-xs text-slate-500">Máximo 3 sesiones por semana</p>
      </div>

      <div className="space-y-3">
        {weekDates.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const activities = plan.actividades.filter((a: PlannedActivity) => a.date === dateStr)
          const events = plan.eventos.filter((e: CalendarEvent) => e.date === dateStr)
          const isToday = isSameDay(day, today)
          const dayActivities = [...activities, ...events.map((e) => ({
            id: e.id,
            type: 'event' as ActivityType,
            status: 'programado' as PlannedActivity['status'],
            duracionMin: e.duracionHoras * 60,
            prioridad: 'opcional' as const,
            titulo: e.titulo,
          }))]

          return (
            <div
              key={dateStr}
              className={`rounded-2xl border p-4 ${
                isToday ? 'border-lime-500/30 bg-lime-500/5' : 'border-slate-800/80 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isToday ? 'text-lime-400' : 'text-slate-500'}`}>
                    {DAYS[i].toUpperCase()}
                  </span>
                  <span className={`text-sm font-semibold ${isToday ? 'text-lime-300' : 'text-slate-200'}`}>
                    {format(day, 'd')}
                  </span>
                  {isToday && <span className="text-[10px] text-lime-500 font-medium">HOY</span>}
                </div>
                <button
                  onClick={() => { setShowAddEvent(true); setEventDay(dateStr) }}
                  className="text-slate-500 hover:text-slate-300"
                  aria-label={`Añadir evento ${DAYS[i]}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              {dayActivities.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Sin actividades planificadas</p>
              ) : (
                <div className="space-y-2">
                  {dayActivities.map((act) => {
                    const colors = ACTIVITY_COLORS[act.type] || ACTIVITY_COLORS.rest
                    return (
                      <div
                        key={act.id}
                        className={`flex items-center justify-between rounded-xl border ${colors.border} ${colors.bg} p-3`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                          <div>
                            <p className={`text-sm font-medium ${colors.text}`}>
                              {act.type === 'event' ? (act as any).titulo : act.type === 'ladder' ? 'Ladder' : act.type === 'run' ? 'Carrera' : act.type === 'swim' ? 'Natación' : 'Recuperación'}
                            </p>
                             {(act as any).horaSugerida && (
                               <p className="text-[11px] text-slate-500">{(act as any).horaSugerida}</p>
                             )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">{act.duracionMin} min</span>
                          <span className="text-[11px] text-slate-500">{STATUS_ICON[act.status] || '●'}</span>
                          {act.type === 'ladder' && act.status !== 'completado' && act.status !== 'cancelado' && (
                            <button
                              onClick={() => setShowReschedule({ day: dateStr, actividadId: act.id })}
                              className="text-slate-500 hover:text-slate-300"
                              aria-label="Reorganizar"
                            >
                              <Move size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Añadir evento</h3>
              <button onClick={() => setShowAddEvent(false)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título"
                value={newEvent.titulo}
                onChange={(e) => setNewEvent({ ...newEvent, titulo: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-lime-500/50 focus:outline-none"
              />
              <select
                value={newEvent.tipo}
                onChange={(e) => setNewEvent({ ...newEvent, tipo: e.target.value as CalendarEvent['tipo'] })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-lime-500/50 focus:outline-none"
              >
                <option value="trabajo">Trabajo extra</option>
                <option value="reunion">Reunión</option>
                <option value="social">Plan social</option>
                <option value="viaje">Viaje</option>
                <option value="indisponibilidad">Indisponibilidad</option>
                <option value="otro">Otro</option>
              </select>
              <input
                type="number"
                placeholder="Duración (horas)"
                value={newEvent.duracionHoras}
                onChange={(e) => setNewEvent({ ...newEvent, duracionHoras: parseInt(e.target.value) || 1 })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-lime-500/50 focus:outline-none"
              />
              <textarea
                placeholder="Notas (opcional)"
                value={newEvent.notas}
                onChange={(e) => setNewEvent({ ...newEvent, notas: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-lime-500/50 focus:outline-none"
              />
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.titulo.trim()}
                className="w-full rounded-xl bg-lime-500 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-lime-400 disabled:opacity-50"
              >
                Guardar evento
              </button>
            </div>
          </div>
        </div>
      )}

      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Reorganizar semana</h3>
              <button onClick={() => setShowReschedule(null)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {rescheduleOptions.length === 0 ? (
                <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-4">
                  <AlertTriangle className="text-amber-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-amber-200">No hay huecos disponibles</p>
                    <p className="text-xs text-amber-200/70 mt-1">Puedes marcar esta sesión como perdida sin culpa.</p>
                  </div>
                </div>
              ) : (
                rescheduleOptions.map((opt) => (
                  <button
                    key={opt.opcion}
                    onClick={async () => {
                      await setWeekPlan({ ...plan, actividades: opt.nuevasActividades, updatedAt: new Date().toISOString() })
                      setShowReschedule(null)
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition-colors hover:border-lime-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-500/10 text-xs font-bold text-lime-400">
                        {opt.opcion}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{opt.descripcion}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}

              <button
                onClick={() => setShowReschedule(null)}
                className="w-full rounded-xl border border-slate-800 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800"
              >
                Mantener plan, marcar como perdido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
