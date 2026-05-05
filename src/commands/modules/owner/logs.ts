import { readFile } from 'fs/promises'
import { defineCommand } from '../../types.js'
import { LOG_FILE } from '../../../core/logger.js'

const formatLine = (raw: string): string => {
  try {
    const obj = JSON.parse(raw) as { time: number; level: number; msg: string }
    const t = new Date(obj.time).toISOString().slice(11, 19)
    return `${t} [${obj.level}] ${obj.msg}`
  } catch {
    return raw
  }
}

export default defineCommand({
  name: 'logs',
  category: 'owner',
  description: 'Tail the most recent bot log lines.',
  usage: 'logs [count]',
  permission: 'owner',
  run: async ({ send, message, args }) => {
    const n = Math.max(1, Math.min(200, Number(args[0]) || 30))
    let raw: string
    try {
      raw = await readFile(LOG_FILE, 'utf8')
    } catch {
      return send.reply(message, 'No log file yet.')
    }
    const lines = raw.trim().split('\n').slice(-n).map(formatLine)
    const body = lines.join('\n').slice(-3500)
    await send.reply(message, `*Last ${lines.length} log lines*\n\`\`\`\n${body}\n\`\`\``)
  }
})
