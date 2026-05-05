import { defineCommand } from '../../types.js'
import { formatDuration } from '../../../utils/time.js'
import os from 'os'

const mb = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(1)} MB`

export default defineCommand({
  name: 'stats',
  category: 'owner',
  description: 'Process and host stats.',
  permission: 'owner',
  run: async ({ send, message }) => {
    const mem = process.memoryUsage()
    const load = os.loadavg()
    const lines = [
      '*Stats*',
      '```',
      `node      ${process.version}`,
      `pid       ${process.pid}`,
      `uptime    ${formatDuration(process.uptime() * 1000)}`,
      `rss       ${mb(mem.rss)}`,
      `heap      ${mb(mem.heapUsed)} / ${mb(mem.heapTotal)}`,
      `external  ${mb(mem.external)}`,
      `loadavg   ${load.map((n) => n.toFixed(2)).join(' / ')}`,
      `cpus      ${os.cpus().length}`,
      `host      ${os.platform()} ${os.arch()}`,
      '```'
    ]
    await send.reply(message, lines.join('\n'))
  }
})
