import { JsonStore } from './store.js'

interface WarnEntry {
  count: number
  reasons: string[]
}

interface WarnsFile {
  threshold: number
  warns: Record<string, Record<string, WarnEntry>>
}

const store = new JsonStore<WarnsFile>('warns.json', () => ({ threshold: 3, warns: {} }))

const norm = (phone: string): string => phone.replace(/\D/g, '')

export const warns = {
  async threshold(): Promise<number> {
    return (await store.read()).threshold
  },

  async add(chat: string, phone: string, reason: string): Promise<WarnEntry> {
    const key = norm(phone)
    if (!key) throw new Error('Invalid phone')
    let entry: WarnEntry = { count: 0, reasons: [] }
    await store.update((data) => {
      const chatMap = data.warns[chat] ?? {}
      const current = chatMap[key] ?? { count: 0, reasons: [] }
      current.count += 1
      if (reason) current.reasons.push(reason)
      chatMap[key] = current
      data.warns[chat] = chatMap
      entry = current
    })
    return entry
  },

  async clear(chat: string, phone: string): Promise<boolean> {
    const key = norm(phone)
    if (!key) return false
    let cleared = false
    await store.update((data) => {
      const chatMap = data.warns[chat]
      if (chatMap && chatMap[key]) {
        delete chatMap[key]
        cleared = true
      }
    })
    return cleared
  },

  async get(chat: string, phone: string): Promise<WarnEntry | null> {
    const key = norm(phone)
    const data = await store.read()
    return data.warns[chat]?.[key] ?? null
  }
}
