import { defineCommand } from '../../types.js'
import { resolveTargets } from '../../../utils/targets.js'
import { phoneFromJid } from '../../../utils/jid.js'
import { warns } from '../../../state/warns.js'

export default defineCommand({
  name: 'warn',
  category: 'moderation',
  description: 'Warn a user. Removes them after the threshold is hit.',
  usage: 'warn @user [reason]',
  permission: 'admin',
  run: async ({ sock, send, message, args }) => {
    const targets = resolveTargets(message, args)
    if (targets.length === 0)
      return send.reply(message, 'Mention, reply to, or pass a phone number to warn.')

    const reason = args
      .filter((a) => !a.startsWith('@') && a.replace(/\D/g, '').length < 5)
      .join(' ')
      .trim()

    const threshold = await warns.threshold()
    const lines: string[] = []
    const toRemove: string[] = []

    for (const jid of targets) {
      const phone = phoneFromJid(jid)
      if (!phone) continue
      const entry = await warns.add(message.chat, phone, reason)
      lines.push(`@${jid.split('@')[0]} — warning ${entry.count}/${threshold}${reason ? ` (${reason})` : ''}`)
      if (entry.count >= threshold) {
        toRemove.push(jid)
        await warns.clear(message.chat, phone)
      }
    }

    await send.send(message.chat, { text: lines.join('\n'), mentions: targets })

    if (toRemove.length) {
      try {
        await sock.groupParticipantsUpdate(message.chat, toRemove, 'remove')
        const list = toRemove.map((j) => `@${j.split('@')[0]}`).join(' ')
        await send.send(message.chat, {
          text: `Removed ${list} after reaching ${threshold} warns.`,
          mentions: toRemove
        })
      } catch (err) {
        await send.reply(message, `Could not remove: ${(err as Error).message}`)
      }
    }
  }
})
