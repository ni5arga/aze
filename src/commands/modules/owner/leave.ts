import { defineCommand } from '../../types.js'
import { isGroup } from '../../../utils/jid.js'

export default defineCommand({
  name: 'leave',
  category: 'owner',
  description: 'Leave the current group, or the group whose JID is given.',
  usage: 'leave [group-jid]',
  permission: 'owner',
  run: async ({ sock, send, message, args }) => {
    const target = args[0] ?? message.chat
    if (!isGroup(target)) return send.reply(message, 'Not a group JID.')

    if (target === message.chat) {
      await send.reply(message, 'Leaving the group. Bye.')
    }
    await sock.groupLeave(target)
    if (target !== message.chat) await send.reply(message, `Left ${target}.`)
  }
})
