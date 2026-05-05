import { defineCommand } from '../../types.js'
import { messagesCache } from '../../../state/messages-cache.js'
import { sleep } from '../../../utils/time.js'

export default defineCommand({
  name: 'purge',
  category: 'moderation',
  description: 'Delete a quoted message, or the last N messages in the chat.',
  usage: 'purge [count]   |   reply to a message with !purge',
  permission: 'admin',
  cooldown: 5000,
  run: async ({ sock, send, message, args }) => {
    if (message.quoted) {
      try {
        await sock.sendMessage(message.chat, { delete: message.quoted.key })
        return send.reply(message, 'Message deleted.')
      } catch (err) {
        return send.reply(message, `Failed to delete (am I admin?): ${(err as Error).message}`)
      }
    }

    const n = Math.max(1, Math.min(50, Number(args[0]) || 10))
    const recent = messagesCache.recent(message.chat, n, { excludeKey: message.id })
    if (recent.length === 0) return send.reply(message, 'Nothing to delete.')

    let deleted = 0
    for (const entry of recent) {
      try {
        await sock.sendMessage(message.chat, { delete: entry.key })
        deleted++
      } catch {}
      await sleep(200)
    }
    await send.reply(message, `Deleted ${deleted} message(s).`)
  }
})
