import type { StorageAdapter } from './interfaces'
import type { AppData, CalendarEvent } from '../domain/models'
import { EMPTY_APP_DATA } from '../domain/models'

const DB_NAME = 'personal-trainner-db'
const DB_VERSION = 1
const STORE_PHOTOS = 'photos'
const STORE_CAPTURES = 'captures'

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS)
      }
      if (!db.objectStoreNames.contains(STORE_CAPTURES)) {
        db.createObjectStore(STORE_CAPTURES)
      }
    }
  })
}

async function idbPut(storeName: string, key: string, value: Blob): Promise<void> {
  const db = await openIndexedDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.put(value, key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function idbGet(storeName: string, key: string): Promise<Blob | undefined> {
  const db = await openIndexedDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as Blob | undefined)
  })
}

async function idbDelete(storeName: string, key: string): Promise<void> {
  const db = await openIndexedDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.delete(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export class LocalRepository {
  private storageKey = 'personal-trainner-data-v1'
  private memoryCache: AppData | null = null

  constructor(private storage: StorageAdapter) {}

  async load(): Promise<AppData> {
    if (this.memoryCache) return this.memoryCache
    try {
      const raw = await this.storage.getItem(this.storageKey)
      if (!raw) {
        this.memoryCache = { ...EMPTY_APP_DATA }
        return this.memoryCache
      }
      const parsed = JSON.parse(raw) as AppData
      this.memoryCache = { ...EMPTY_APP_DATA, ...parsed }
      return this.memoryCache
    } catch {
      this.memoryCache = { ...EMPTY_APP_DATA }
      return this.memoryCache
    }
  }

  async save(data: AppData): Promise<void> {
    this.memoryCache = { ...data }
    const serialized = JSON.stringify(data)
    await this.storage.setItem(this.storageKey, serialized)
  }

  async clear(): Promise<void> {
    this.memoryCache = null
    await this.storage.removeItem(this.storageKey)
  }

  async savePhoto(photoId: string, blob: Blob): Promise<void> {
    await idbPut(STORE_PHOTOS, photoId, blob)
  }

  async getPhoto(photoId: string): Promise<string | undefined> {
    const blob = await idbGet(STORE_PHOTOS, photoId)
    if (!blob) return undefined
    return blobToDataUrl(blob)
  }

  async deletePhoto(photoId: string): Promise<void> {
    await idbDelete(STORE_PHOTOS, photoId)
  }

  async saveCapture(sessionId: string, dataUrl: string): Promise<void> {
    const blob = dataUrlToBlob(dataUrl)
    await idbPut(STORE_CAPTURES, sessionId, blob)
  }

  async getCapture(sessionId: string): Promise<string | undefined> {
    const blob = await idbGet(STORE_CAPTURES, sessionId)
    if (!blob) return undefined
    return blobToDataUrl(blob)
  }

  async deleteCapture(sessionId: string): Promise<void> {
    await idbDelete(STORE_CAPTURES, sessionId)
  }
}

export class LocalCalendarProvider {
  private events: CalendarEvent[] = []
  private storageKey = 'personal-trainner-events-v1'

  constructor(private storage: StorageAdapter) {
    this.load()
  }

  private async load(): Promise<void> {
    try {
      const raw = await this.storage.getItem(this.storageKey)
      if (raw) {
        this.events = JSON.parse(raw) as CalendarEvent[]
      }
    } catch {
      this.events = []
    }
  }

  async persist(): Promise<void> {
    await this.storage.setItem(this.storageKey, JSON.stringify(this.events))
  }

  async getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    await this.load()
    return this.events.filter((e) => e.date >= startDate && e.date <= endDate)
  }

  async addEvent(event: CalendarEvent): Promise<CalendarEvent> {
    await this.load()
    this.events.push(event)
    await this.persist()
    return event
  }

  async removeEvent(id: string): Promise<void> {
    await this.load()
    this.events = this.events.filter((e) => e.id !== id)
    await this.persist()
  }
}

export class BrowserStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }
}
