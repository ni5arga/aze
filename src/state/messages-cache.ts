import type { WAMessageKey } from 'baileys'

export interface CachedKey {
  key: WAMessageKey
  fromMe: boolean
  participant: string
  timestamp: number
}

const MAX_PER_CHAT = 200

const buckets = new Map<string, CachedKey[]>()

export const messagesCache = {
  push(chat: string, key: WAMessageKey, participant: string, fromMe: boolean): void {
    const list = buckets.get(chat) ?? []
    list.push({ key, fromMe, participant, timestamp: Date.now() })
    if (list.length > MAX_PER_CHAT) list.splice(0, list.length - MAX_PER_CHAT)
    buckets.set(chat, list)
  },

  recent(
    chat: string,
    n: number,
    filter: { fromMe?: boolean; excludeKey?: string } = {}
  ): CachedKey[] {
    const list = buckets.get(chat) ?? []
    let candidates = list
    if (filter.fromMe !== undefined) candidates = candidates.filter((c) => c.fromMe === filter.fromMe)
    if (filter.excludeKey) candidates = candidates.filter((c) => c.key.id !== filter.excludeKey)
    return candidates.slice(-n)
  }
}
