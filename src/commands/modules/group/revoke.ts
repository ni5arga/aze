import { defineCommand } from '../../types.js'

export default defineCommand({
  name: 'revoke',
  category: 'group',
  description: 'Revoke and rotate the group invite link.',
  permission: 'admin',
  cooldown: 10_000,
  run: async ({ sock, send, message }) => {
    const code = await sock.groupRevokeInvite(message.chat)
    await send.reply(message, `New invite link:\nhttps://chat.whatsapp.com/${code}`)
  }
})
