import type { AppData, CalendarEvent } from '../domain/models'

export interface BackendRepository {
  load(): Promise<AppData>
  save(data: AppData): Promise<void>
}

export interface CalendarProvider {
  getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]>
  addEvent(event: CalendarEvent): Promise<CalendarEvent>
  removeEvent(id: string): Promise<void>
}

export interface LocalCalendarProvider extends CalendarProvider {}

export interface FutureGoogleCalendarProvider extends CalendarProvider {
  isConnected(): Promise<boolean>
  connect(): Promise<void>
  disconnect(): Promise<void>
}

export interface HealthDataImporter {
  importSleep(startDate: string, endDate: string): Promise<number[]>
  importWeight(startDate: string, endDate: string): Promise<number[]>
  importSteps(startDate: string, endDate: string): Promise<number[]>
  isAvailable(): boolean
}

export interface FutureHealthDataImporter extends HealthDataImporter {
  requestPermissions(): Promise<boolean>
}

export interface AICoachProvider {
  isAvailable(): boolean
  chat(message: string, context: unknown): Promise<string>
  analyzeCapture(imageData: string): Promise<string>
}

export interface MockCoachProvider extends AICoachProvider {}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}
