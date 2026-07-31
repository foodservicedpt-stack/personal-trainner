import type {
  AppData,
  DailyCheckIn,
  LadderSession,
  WeekPlan,
  PlannedActivity,
  CoachRecommendation,
  UserProfile,
  WorkoutSession,
} from '../domain/models'
import { startOfWeek, addDays, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function calculateRecoveryStatus(checkIns: DailyCheckIn[], sessions: WorkoutSession[]): 'descanso' | 'suave' | 'normal' | 'carga' | 'fatiga' {
  const today = new Date()
  const last7 = checkIns.filter((c) => {
    const d = parseISO(c.date)
    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  })

  if (last7.length === 0) return 'normal'

  const lastCheckIn = last7[last7.length - 1]
  const avgSueno = last7.reduce((a, c) => a + c.horasSueno, 0) / last7.length
  const avgEnergia = last7.reduce((a, c) => a + c.energia, 0) / last7.length
  const avgDolor = last7.reduce((a, c) => a + c.dolorFatiga, 0) / last7.length

  const last3Days = sessions.filter((s) => {
    const d = parseISO((s as any).date)
    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 3
  })

  if (avgSueno < 5 || avgDolor >= 7 || lastCheckIn.estres >= 4) return 'fatiga'
  if (avgEnergia <= 2 || avgSueno < 6 || avgDolor >= 5) return 'carga'
  if (last3Days.length >= 4) return 'carga'
  if (avgEnergia <= 3 || avgDolor >= 3) return 'suave'
  return 'normal'
}

export function classifyTrainingLoad(session: LadderSession): 'baja' | 'media' | 'alta' {
  if (session.cargaPiernas === 'alta' && session.tipo === 'pierna-pesada') return 'alta'
  if (session.tipo === 'pierna-pesada' || session.tipo === 'full-body') return 'media'
  if (session.rpe >= 8) return 'media'
  return 'baja'
}

function getWeekRange(date: Date): { start: string; end: string } {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = addDays(start, 6)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

function getSessionsInWeek(data: AppData, weekStart: string): WorkoutSession[] {
  const start = parseISO(weekStart)
  const end = addDays(start, 6)
  const all: WorkoutSession[] = [
    ...data.ladderSessions,
    ...data.runSessions,
    ...data.swimSessions,
    ...data.recoveryActivities,
  ]
  return all.filter((s) => {
    const d = parseISO((s as any).date)
    return d >= start && d <= end
  })
}

function getLadderCountInWeek(data: AppData, weekStart: string): number {
  return getSessionsInWeek(data, weekStart).filter((s) => 'tipo' in s).length
}

export function generateDailyMission(
  _profile: UserProfile | null,
  weekPlan: WeekPlan | null,
  checkIn: DailyCheckIn | undefined,
  history: AppData
): CoachRecommendation {
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const week = getWeekRange(today)
  const ladderCount = getLadderCountInWeek(history, week.start)
  const recovery = checkIn ? calculateRecoveryStatus([checkIn], getSessionsInWeek(history, week.start)) : 'normal'

  const plannedToday = weekPlan?.actividades.filter((a) => a.date === todayStr) || []
  const completedLadderToday = history.ladderSessions.some((s) => s.date === todayStr)

  let tipo: CoachRecommendation['tipo'] = 'rest'
  let prioridad: CoachRecommendation['prioridad'] = 'opcional'
  let mensajePrincipal = 'Día de recuperación'
  let razon = 'Priorizamos la adherencia y el descanso para mantener la constancia a largo plazo.'
  let duracionMin = 0
  let horaSugerida: string | undefined
  const alternativas: string[] = []
  const senalesPrecaucion: string[] = []

  if (recovery === 'fatiga') {
    tipo = 'rest'
    prioridad = 'imprescindible'
    mensajePrincipal = 'Recuperación activa'
    razon = 'Tu sueño, energía o dolor indican que el cuerpo necesita recuperarse. Mejor descansar hoy que forzar y lesionar.'
    duracionMin = 20
    alternativas.push('Caminata suave de 15-20 minutos', 'Movilidad suave en casa')
    senalesPrecaucion.push('No recomendamos entrenamiento intenso hasta mejorar el sueño o reducir el dolor.')
  } else if (completedLadderToday && ladderCount >= 3) {
    tipo = 'recovery'
    prioridad = 'recomendable'
    mensajePrincipal = 'Movilidad y pasos'
    razon = 'Ya has completado tus 3 sesiones Ladder de esta semana. Mantén el movimiento suave.'
    duracionMin = 30
    alternativas.push('Natación suave 20-30 minutos', 'Caminata 20 minutos')
  } else if (plannedToday.length > 0) {
    const mainActivity = plannedToday.find((a) => a.prioridad === 'imprescindible') || plannedToday[0]
    tipo = mainActivity.type
    prioridad = mainActivity.prioridad
    mensajePrincipal = getActivityLabel(tipo)
    razon = mainActivity.razon || 'Planificado para hoy.'
    duracionMin = mainActivity.duracionMin
    horaSugerida = mainActivity.horaSugerida
  } else if (recovery === 'carga') {
    tipo = 'run'
    prioridad = 'opcional'
    mensajePrincipal = 'Carrera suave'
    razon = 'La carga ha sido alta esta semana. Una carrera suave ayuda a la recuperación sin añadir estrés.'
    duracionMin = 25
    alternativas.push('Caminata 30 minutos', 'Natación suave 20 minutos')
    senalesPrecaucion.push('Si el dolor aumenta, para y descansa.')
  } else {
    if (ladderCount < 3) {
      tipo = 'ladder'
      prioridad = 'recomendable'
      mensajePrincipal = 'Sesión Ladder'
      razon = 'Tienes capacidad para completar tu sesión de fuerza. Es la prioridad de la semana.'
      duracionMin = 45
      horaSugerida = '17:30'
      alternativas.push('Carrera suave 25 minutos', 'Natación suave 30 minutos')
    } else {
      tipo = 'run'
      prioridad = 'opcional'
      mensajePrincipal = 'Carrera suave opcional'
      razon = 'Ya tienes tus 3 sesiones de fuerza. Un poco de cardio suave mejora el estado general sin sobrecargar.'
      duracionMin = 25
      alternativas.push('Natación suave 20 minutos', 'Caminata 30 minutos')
    }
  }

  if (_profile && _profile.objetivo === 'definicion-sostenible') {
    razon += ' Tu objetivo actual es definición sostenible.'
  }

  return {
    id: `rec-${todayStr}`,
    date: todayStr,
    tipo,
    prioridad,
    mensajePrincipal,
    razon,
    alternativas,
    senalesPrecaucion,
    horaSugerida,
    duracionMin,
  }
}

function getActivityLabel(tipo: CoachRecommendation['tipo']): string {
  const labels: Record<CoachRecommendation['tipo'], string> = {
    ladder: 'Sesión Ladder',
    run: 'Carrera suave',
    swim: 'Natación suave',
    recovery: 'Recuperación activa',
    rest: 'Descanso',
    event: 'Evento planificado',
  }
  return labels[tipo] || 'Entrenamiento'
}

export function findRescheduleOptions(
  weekPlan: WeekPlan,
  conflict: { date: string; actividadId: string },
  _profile: UserProfile | null,
  _history: AppData
): { opcion: number; descripcion: string; nuevasActividades: PlannedActivity[] }[] {
  const options: { opcion: number; descripcion: string; nuevasActividades: PlannedActivity[] }[] = []
  const conflictActivity = weekPlan.actividades.find((a) => a.id === conflict.actividadId)
  if (!conflictActivity) return options

  const isLadder = conflictActivity.type === 'ladder'
  const currentLadder = weekPlan.actividades.filter((a) => a.type === 'ladder' && a.status !== 'cancelado' && a.id !== conflict.actividadId)

  if (!isLadder) {
    const opt1 = {
      opcion: 1,
      descripcion: `Eliminar ${getActivityLabel(conflictActivity.type)} y mantener el resto.`,
      nuevasActividades: weekPlan.actividades.filter((a) => a.id !== conflict.actividadId).map((a) => ({ ...a, status: a.status === 'programado' ? 'movido' : a.status } as PlannedActivity)),
    }
    options.push(opt1)
    return options
  }

  if (currentLadder.length >= 3) {
    options.push({
      opcion: 1,
      descripcion: 'Ya tienes 3 sesiones Ladder esta semana. Marcar como perdida sin compensar.',
      nuevasActividades: weekPlan.actividades.filter((a) => a.id !== conflict.actividadId).map((a) => ({ ...a, status: 'perdido' as PlannedActivity['status'] } as PlannedActivity)),
    })
    return options
  }

  const otherDays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    .map((_d, i) => addDays(parseISO(weekPlan.startDate), i))
    .filter((d) => format(d, 'yyyy-MM-dd') !== conflict.date)

  const candidateDays = otherDays.slice(0, 3)
  let optIndex = 1
  for (const day of candidateDays) {
    const dayStr = format(day, 'yyyy-MM-dd')
    const existingLadder = weekPlan.actividades.find((a) => a.date === dayStr && a.type === 'ladder' && a.status !== 'cancelado')
    if (existingLadder) continue

    const newActivity: PlannedActivity = {
      ...conflictActivity,
      id: `${conflictActivity.id}-moved-${dayStr}`,
      date: dayStr,
      status: 'movido',
      razon: `Movido desde ${conflict.date}`,
    }

    options.push({
      opcion: optIndex++,
      descripcion: `Mover Ladder al ${format(day, 'EEEE d', { locale: es })} a las 10:30. Mantienes la sesión de fuerza.`,
      nuevasActividades: weekPlan.actividades
        .filter((a) => a.id !== conflict.actividadId)
        .map((a) => ({ ...a, status: a.status === 'programado' ? 'movido' : a.status } as PlannedActivity))
        .concat(newActivity),
    })

    if (options.length >= 2) break
  }

  if (options.length === 0) {
    options.push({
      opcion: 1,
      descripcion: 'No hay huecos disponibles. Marcar como perdida sin compensar.',
      nuevasActividades: weekPlan.actividades.filter((a) => a.id !== conflict.actividadId).map((a) => ({ ...a, status: 'perdido' as PlannedActivity['status'] } as PlannedActivity)),
    })
  }

  return options
}

export function calculateWeeklyProgress(data: AppData): {
  ladderCompletadas: number
  ladderPlanificadas: number
  minutosCarrera: number
  minutosNatacion: number
  promedioSueno: number
  promedioDolor: number
  promedioEnergia: number
  cumplimientoPorcentaje: number
} {
  const today = new Date()
  const week = getWeekRange(today)
  const sessions = getSessionsInWeek(data, week.start)
  const ladderPlanificadas = data.weekPlan?.actividades.filter((a) => a.type === 'ladder' && a.date >= week.start && a.date <= week.end).length || 0
  const ladderCompletadas = sessions.filter((s) => 'tipo' in s && 'completedAt' in s && s.completedAt).length
  const minutosCarrera = data.runSessions
    .filter((s) => s.date >= week.start && s.date <= week.end)
    .reduce((a, s) => a + s.duracionMin, 0)
  const minutosNatacion = data.swimSessions
    .filter((s) => s.date >= week.start && s.date <= week.end)
    .reduce((a, s) => a + s.duracionMin, 0)

  const weekCheckIns = data.checkIns.filter((c) => c.date >= week.start && c.date <= week.end)
  const promedioSueno = weekCheckIns.length ? weekCheckIns.reduce((a, c) => a + c.horasSueno, 0) / weekCheckIns.length : 0
  const promedioDolor = weekCheckIns.length ? weekCheckIns.reduce((a, c) => a + c.dolorFatiga, 0) / weekCheckIns.length : 0
  const promedioEnergia = weekCheckIns.length ? weekCheckIns.reduce((a, c) => a + c.energia, 0) / weekCheckIns.length : 0

  const cumplimientoPorcentaje = ladderPlanificadas > 0 ? Math.round((ladderCompletadas / ladderPlanificadas) * 100) : 0

  return {
    ladderCompletadas,
    ladderPlanificadas,
    minutosCarrera,
    minutosNatacion,
    promedioSueno: Math.round(promedioSueno * 10) / 10,
    promedioDolor: Math.round(promedioDolor * 10) / 10,
    promedioEnergia: Math.round(promedioEnergia * 10) / 10,
    cumplimientoPorcentaje,
  }
}
