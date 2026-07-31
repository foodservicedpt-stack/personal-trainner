export type LadderType = 'torso' | 'pierna-pesada' | 'pierna-moderada' | 'full-body' | 'hibrido' | 'recuperacion'
export type RunIntensity = 'suave' | 'moderada' | 'intervalos'
export type SwimType = 'tecnica' | 'suave' | 'intervalos'
export type LegLoad = 'baja' | 'media' | 'alta'
export type Priority = 'imprescindible' | 'recomendable' | 'opcional'
export type ActivityType = 'ladder' | 'run' | 'swim' | 'recovery' | 'rest' | 'event'
export type ActivityStatus = 'programado' | 'completado' | 'opcional' | 'movido' | 'cancelado' | 'perdido'
export type Goal = 'definicion' | 'mantener-fuerza' | 'mejorar-cardio'
export type TimePreference = 'manana' | 'tarde' | 'indiferente'
export type AvailableTime = '0-20' | '20-40' | '40-60' | '60+'
export type AvailableLocation = 'gimnasio' | 'exterior' | 'piscina' | 'casa'
export type Objective = 'definicion-sostenible' | 'mantener-fuerza' | 'mejorar-cardio'

export interface UserProfile {
  id: string
  nombre: string
  pesoInicial: number
  altura: number
  objetivo: Objective
  preferenciasCardio: ('run' | 'swim')[]
  duracionMaxSesionMin: number
  preferenciaHorario: TimePreference
  diasPreferidosLadder: number[]
  horaInicioLaboral: string
  horaFinLaboral: string
  recordatoriosActivos: boolean
  createdAt: string
  updatedAt: string
}

export interface DailyCheckIn {
  id: string
  date: string
  horasSueno: number
  calidadSueno: 1 | 2 | 3 | 4 | 5
  energia: 1 | 2 | 3 | 4 | 5
  estres: 1 | 2 | 3 | 4 | 5
  dolorFatiga: number
  zonaDolor?: string
  tiempoDisponible: AvailableTime
  ubicacionesDisponibles: AvailableLocation[]
  createdAt: string
}

export interface LadderSession {
  id: string
  date: string
  tipo: LadderType
  duracionMin: number
  rpe: number
  cargaPiernas: LegLoad
  notas?: string
  capturaDataUrl?: string
  completedAt?: string
}

export interface RunSession {
  id: string
  date: string
  duracionMin: number
  distanciaKm?: number
  intensidad: RunIntensity
  rpe: number
  notas?: string
  completedAt?: string
}

export interface SwimSession {
  id: string
  date: string
  duracionMin: number
  metros?: number
  tipo: SwimType
  rpe: number
  notas?: string
  completedAt?: string
}

export interface RecoveryActivity {
  id: string
  date: string
  pasos?: number
  movilidadMin?: number
  caminataMin?: number
  descansoMin?: number
  notas?: string
  completedAt?: string
}

export type WorkoutSession = LadderSession | RunSession | SwimSession | RecoveryActivity

export interface PlannedActivity {
  id: string
  date: string
  type: ActivityType
  status: ActivityStatus
  horaSugerida?: string
  duracionMin: number
  prioridad: Priority
  razon?: string
  metadata?: Record<string, unknown>
}

export interface CalendarEvent {
  id: string
  date: string
  titulo: string
  tipo: 'trabajo' | 'reunion' | 'social' | 'viaje' | 'indisponibilidad' | 'otro'
  duracionHoras: number
  notas?: string
  createdAt: string
}

export interface WeightEntry {
  id: string
  date: string
  pesoKg: number
  createdAt: string
}

export interface WaistEntry {
  id: string
  date: string
  cinturaCm: number
  createdAt: string
}

export interface ProgressPhotoMetadata {
  id: string
  date: string
  fileName: string
  fileSize: number
  createdAt: string
}

export interface WeekPlan {
  startDate: string
  endDate: string
  actividades: PlannedActivity[]
  eventos: CalendarEvent[]
  updatedAt: string
}

export interface CoachRecommendation {
  id: string
  date: string
  tipo: ActivityType
  prioridad: Priority
  mensajePrincipal: string
  razon: string
  alternativas: string[]
  senalesPrecaucion: string[]
  horaSugerida?: string
  duracionMin: number
}

export interface AppData {
  version: string
  profile: UserProfile | null
  checkIns: DailyCheckIn[]
  ladderSessions: LadderSession[]
  runSessions: RunSession[]
  swimSessions: SwimSession[]
  recoveryActivities: RecoveryActivity[]
  weekPlan: WeekPlan | null
  calendarEvents: CalendarEvent[]
  weightEntries: WeightEntry[]
  waistEntries: WaistEntry[]
  progressPhotos: ProgressPhotoMetadata[]
  recommendations: CoachRecommendation[]
}

export const EMPTY_APP_DATA: AppData = {
  version: '1.0.0',
  profile: null,
  checkIns: [],
  ladderSessions: [],
  runSessions: [],
  swimSessions: [],
  recoveryActivities: [],
  weekPlan: null,
  calendarEvents: [],
  weightEntries: [],
  waistEntries: [],
  progressPhotos: [],
  recommendations: [],
}
