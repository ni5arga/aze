import { defineCommand } from '../../types.js'

export default defineCommand({
  name: 'invitelink',
  aliases: ['link'],
  category: 'group',
  description: 'Get the group invite link.',
  permission: 'admin',
  cooldown: 5000,
  run: async ({ sock, send, message }) => {
    const code = await sock.groupInviteCode(message.chat)
    if (!code) return send.reply(message, 'Could not fetch invite code.')
    await send.reply(message, `https://chat.whatsapp.com/${code}`)
  }
})
