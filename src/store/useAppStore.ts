import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppData, DailyCheckIn, LadderSession, RunSession, SwimSession, RecoveryActivity, WeekPlan, CalendarEvent, WeightEntry, WaistEntry, ProgressPhotoMetadata, CoachRecommendation, UserProfile } from '../domain/models'
import { EMPTY_APP_DATA } from '../domain/models'
import { generateDailyMission, calculateWeeklyProgress } from '../domain/ruleEngine'
import { LocalRepository, BrowserStorageAdapter, LocalCalendarProvider } from '../repositories/LocalRepository'

interface AppState {
  data: AppData
  loading: boolean
  todayRecommendation: CoachRecommendation | null
  weeklyProgress: ReturnType<typeof calculateWeeklyProgress> | null
  repository: LocalRepository
  calendar: LocalCalendarProvider

  init: () => Promise<void>
  save: () => Promise<void>

  setProfile: (profile: UserProfile) => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>

  addCheckIn: (checkIn: DailyCheckIn) => Promise<void>
  getTodayCheckIn: () => DailyCheckIn | undefined

  addLadderSession: (session: LadderSession) => Promise<void>
  addRunSession: (session: RunSession) => Promise<void>
  addSwimSession: (session: SwimSession) => Promise<void>
  addRecoveryActivity: (activity: RecoveryActivity) => Promise<void>

  setWeekPlan: (plan: WeekPlan) => Promise<void>
  addCalendarEvent: (event: CalendarEvent) => Promise<void>
  removeCalendarEvent: (id: string) => Promise<void>

  addWeightEntry: (entry: WeightEntry) => Promise<void>
  addWaistEntry: (entry: WaistEntry) => Promise<void>
  addProgressPhoto: (photo: ProgressPhotoMetadata) => Promise<void>
  removeProgressPhoto: (id: string) => Promise<void>

  recalculate: () => void
  clearAll: () => Promise<void>
  exportData: () => string
  importData: (json: string) => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      data: { ...EMPTY_APP_DATA },
      loading: true,
      todayRecommendation: null,
      weeklyProgress: null,
      repository: new LocalRepository(new BrowserStorageAdapter()),
      calendar: new LocalCalendarProvider(new BrowserStorageAdapter()),

      init: async () => {
        const repo = get().repository
        const data = await repo.load()
        set({ data, loading: false })
        get().recalculate()
      },

      save: async () => {
        const { data, repository } = get()
        await repository.save(data)
      },

      setProfile: async (profile) => {
        set((s) => ({ data: { ...s.data, profile, updatedAt: new Date().toISOString() } }))
        await get().save()
      },

      updateProfile: async (patch) => {
        const current = get().data.profile
        if (!current) return
        const updated = { ...current, ...patch, updatedAt: new Date().toISOString() }
        set((s) => ({ data: { ...s.data, profile: updated } }))
        await get().save()
      },

      addCheckIn: async (checkIn) => {
        set((s) => ({ data: { ...s.data, checkIns: [...s.data.checkIns, checkIn] } }))
        await get().save()
        get().recalculate()
      },

      getTodayCheckIn: () => {
        const today = new Date().toISOString().slice(0, 10)
        return get().data.checkIns.find((c) => c.date === today)
      },

      addLadderSession: async (session) => {
        set((s) => ({ data: { ...s.data, ladderSessions: [...s.data.ladderSessions, session] } }))
        await get().save()
        get().recalculate()
      },

      addRunSession: async (session) => {
        set((s) => ({ data: { ...s.data, runSessions: [...s.data.runSessions, session] } }))
        await get().save()
        get().recalculate()
      },

      addSwimSession: async (session) => {
        set((s) => ({ data: { ...s.data, swimSessions: [...s.data.swimSessions, session] } }))
        await get().save()
        get().recalculate()
      },

      addRecoveryActivity: async (activity) => {
        set((s) => ({ data: { ...s.data, recoveryActivities: [...s.data.recoveryActivities, activity] } }))
        await get().save()
        get().recalculate()
      },

      setWeekPlan: async (plan) => {
        set((s) => ({ data: { ...s.data, weekPlan: plan } }))
        await get().save()
        get().recalculate()
      },

      addCalendarEvent: async (event) => {
        const calendar = get().calendar
        await calendar.addEvent(event)
        const events = await calendar.getEvents(get().data.weekPlan?.startDate || new Date().toISOString().slice(0, 10), get().data.weekPlan?.endDate || new Date().toISOString().slice(0, 10))
        set((s) => ({ data: { ...s.data, calendarEvents: events } }))
        await get().save()
      },

      removeCalendarEvent: async (id) => {
        const calendar = get().calendar
        await calendar.removeEvent(id)
        const events = await calendar.getEvents(get().data.weekPlan?.startDate || new Date().toISOString().slice(0, 10), get().data.weekPlan?.endDate || new Date().toISOString().slice(0, 10))
        set((s) => ({ data: { ...s.data, calendarEvents: events } }))
        await get().save()
      },

      addWeightEntry: async (entry) => {
        set((s) => ({ data: { ...s.data, weightEntries: [...s.data.weightEntries, entry] } }))
        await get().save()
      },

      addWaistEntry: async (entry) => {
        set((s) => ({ data: { ...s.data, waistEntries: [...s.data.waistEntries, entry] } }))
        await get().save()
      },

      addProgressPhoto: async (photo) => {
        set((s) => ({ data: { ...s.data, progressPhotos: [...s.data.progressPhotos, photo] } }))
        await get().save()
      },

      removeProgressPhoto: async (id) => {
        set((s) => ({ data: { ...s.data, progressPhotos: s.data.progressPhotos.filter((p) => p.id !== id) } }))
        await get().save()
      },

      recalculate: () => {
        const { data } = get()
        const today = new Date()
        const todayStr = today.toISOString().slice(0, 10)
        const checkIn = data.checkIns.find((c) => c.date === todayStr)
        const recommendation = generateDailyMission(data.profile, data.weekPlan, checkIn, data)
        const progress = calculateWeeklyProgress(data)
        set({ todayRecommendation: recommendation, weeklyProgress: progress })
      },

      clearAll: async () => {
        await get().repository.clear()
        set({ data: { ...EMPTY_APP_DATA } })
        get().recalculate()
      },

      exportData: () => {
        return JSON.stringify(get().data, null, 2)
      },

      importData: async (json) => {
        try {
          const parsed = JSON.parse(json) as AppData
          set({ data: { ...EMPTY_APP_DATA, ...parsed } })
          await get().save()
          get().recalculate()
        } catch (e) {
          console.error('Error importing data', e)
        }
      },
    }),
    {
      name: 'personal-trainner-storage',
      storage: createJSONStorage(() => ({
        getItem: (name: string) => localStorage.getItem(name),
        setItem: (name: string, value: string) => localStorage.setItem(name, value),
        removeItem: (name: string) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({ data: state.data }),
    }
  )
)
