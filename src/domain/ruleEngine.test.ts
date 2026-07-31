import { describe, it, expect } from 'vitest'
import { calculateRecoveryStatus, classifyTrainingLoad, generateDailyMission, findRescheduleOptions, calculateWeeklyProgress } from './ruleEngine'
import type { AppData, DailyCheckIn, WeekPlan, PlannedActivity, UserProfile } from './models'
import { EMPTY_APP_DATA } from './models'

function createCheckIn(overrides: Partial<DailyCheckIn> = {}): DailyCheckIn {
  return {
    id: 'ci-1',
    date: new Date().toISOString().slice(0, 10),
    horasSueno: 7,
    calidadSueno: 3,
    energia: 3,
    estres: 2,
    dolorFatiga: 3,
    tiempoDisponible: '40-60',
    ubicacionesDisponibles: ['gimnasio'],
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('calculateRecoveryStatus', () => {
  it('debe devolver fatiga con sueño muy bajo', () => {
    const ci = createCheckIn({ horasSueno: 4, dolorFatiga: 8 })
    expect(calculateRecoveryStatus([ci], [])).toBe('fatiga')
  })

  it('debe devolver carga con energia baja', () => {
    const ci = createCheckIn({ energia: 2 })
    expect(calculateRecoveryStatus([ci], [])).toBe('carga')
  })

  it('debe devolver normal con buenos datos', () => {
    const ci = createCheckIn({ horasSueno: 7, energia: 4, dolorFatiga: 2 })
    expect(calculateRecoveryStatus([ci], [])).toBe('normal')
  })

  it('debe devolver suave con energia baja moderada', () => {
    const ci = createCheckIn({ energia: 3, dolorFatiga: 3 })
    expect(calculateRecoveryStatus([ci], [])).toBe('suave')
  })
})

describe('classifyTrainingLoad', () => {
  it('debe clasificar como alta para pierna pesada', () => {
    const session = {
      id: '1',
      date: new Date().toISOString().slice(0, 10),
      tipo: 'pierna-pesada' as const,
      duracionMin: 60,
      rpe: 9,
      cargaPiernas: 'alta' as const,
    }
    expect(classifyTrainingLoad(session)).toBe('alta')
  })

  it('debe clasificar como baja para torso', () => {
    const session = {
      id: '1',
      date: new Date().toISOString().slice(0, 10),
      tipo: 'torso' as const,
      duracionMin: 45,
      rpe: 7,
      cargaPiernas: 'baja' as const,
    }
    expect(classifyTrainingLoad(session)).toBe('baja')
  })
})

describe('generateDailyMission', () => {
  it('debe priorizar descanso en fatiga', () => {
    const profile: UserProfile = {
      id: 'u-1',
      nombre: 'Usuario',
      pesoInicial: 93,
      altura: 1.75,
      objetivo: 'definicion-sostenible',
      preferenciasCardio: ['run'],
      duracionMaxSesionMin: 60,
      preferenciaHorario: 'indiferente',
      diasPreferidosLadder: [1, 3, 5],
      horaInicioLaboral: '08:30',
      horaFinLaboral: '16:30',
      recordatoriosActivos: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const weekPlan: WeekPlan = {
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      actividades: [],
      eventos: [],
      updatedAt: new Date().toISOString(),
    }

    const ci = createCheckIn({ horasSueno: 4, dolorFatiga: 8, energia: 1 })

    const rec = generateDailyMission(profile, weekPlan, ci, EMPTY_APP_DATA)
    expect(rec.tipo).toBe('rest')
    expect(rec.prioridad).toBe('imprescindible')
  })
})

describe('findRescheduleOptions', () => {
  it('debe proponer mover Ladder a otro dia', () => {
    const weekPlan: WeekPlan = {
      startDate: '2025-01-06',
      endDate: '2025-01-12',
      actividades: [
        {
          id: 'act-1',
          date: '2025-01-06',
          type: 'ladder',
          status: 'programado',
          duracionMin: 45,
          prioridad: 'imprescindible',
        } as PlannedActivity,
      ],
      eventos: [],
      updatedAt: new Date().toISOString(),
    }

    const result = findRescheduleOptions(weekPlan, { date: '2025-01-06', actividadId: 'act-1' }, null, EMPTY_APP_DATA)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('calculateWeeklyProgress', () => {
  it('debe calcular cumplimiento correctamente', () => {
    const data: AppData = {
      ...EMPTY_APP_DATA,
      profile: {
        id: 'u-1',
        nombre: 'Test',
        pesoInicial: 93,
        altura: 1.75,
        objetivo: 'definicion-sostenible',
        preferenciasCardio: ['run'],
        duracionMaxSesionMin: 60,
        preferenciaHorario: 'indiferente',
        diasPreferidosLadder: [1, 3, 5],
        horaInicioLaboral: '08:30',
        horaFinLaboral: '16:30',
        recordatoriosActivos: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      weekPlan: {
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        actividades: [],
        eventos: [],
        updatedAt: new Date().toISOString(),
      },
      ladderSessions: [
        {
          id: 'l-1',
          date: new Date().toISOString().slice(0, 10),
          tipo: 'torso',
          duracionMin: 45,
          rpe: 7,
          cargaPiernas: 'baja',
          completedAt: new Date().toISOString(),
        },
      ],
    }

    const progress = calculateWeeklyProgress(data)
    expect(progress.ladderCompletadas).toBe(1)
    expect(progress.minutosCarrera).toBe(0)
  })
})
