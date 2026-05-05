import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import { defineCommand } from '../../types.js'
import { env } from '../../../config/env.js'

export default defineCommand({
  name: 'sticker',
  aliases: ['s'],
  category: 'media',
  description: 'Convert an image or short video to a sticker.',
  cooldown: 3000,
  run: async ({ send, message }) => {
    const target = message.media ?? message.quoted?.media
    if (!target || (target.kind !== 'image' && target.kind !== 'video')) {
      return send.reply(message, 'Reply to or send an image/video.')
    }

    const buffer = await target.download()
    const sticker = new Sticker(buffer, {
      pack: env.botName,
      author: env.botName,
      type: StickerTypes.FULL,
      quality: 60
    })

    const out = await sticker.toBuffer()
    await send.reply(message, { sticker: out })
  }
})
