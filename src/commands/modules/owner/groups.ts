import { defineCommand } from '../../types.js'

export default defineCommand({
  name: 'groups',
  category: 'owner',
  description: 'List every group the bot participates in.',
  permission: 'owner',
  cooldown: 5000,
  run: async ({ sock, send, message }) => {
    const all = await sock.groupFetchAllParticipating()
    const list = Object.values(all)
    if (list.length === 0) return send.reply(message, 'Not in any groups.')

    list.sort((a, b) => a.subject.localeCompare(b.subject))
    const lines = [`*Groups* (${list.length})`, '```']
    for (const g of list) {
      lines.push(`${g.subject}`)
      lines.push(`  ${g.id}  ·  ${g.participants.length} members`)
    }
    lines.push('```')
    await send.reply(message, lines.join('\n'))
  }
})
