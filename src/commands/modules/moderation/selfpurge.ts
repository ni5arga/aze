import { defineCommand } from '../../types.js'
import { messagesCache } from '../../../state/messages-cache.js'
import { sleep } from '../../../utils/time.js'

export default defineCommand({
  name: 'selfpurge',
  category: 'moderation',
  description: 'Delete the bot\'s recent messages in this chat.',
  usage: 'selfpurge [count]',
  permission: 'admin',
  cooldown: 5000,
  run: async ({ sock, send, message, args }) => {
    const n = Math.max(1, Math.min(50, Number(args[0]) || 10))
    const recent = messagesCache.recent(message.chat, n, {
      fromMe: true,
      excludeKey: message.id
    })
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
