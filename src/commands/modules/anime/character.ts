import { defineCommand } from '../../types.js'
import { searchCharacter } from '../../../services/jikan.js'
import { getBuffer } from '../../../services/http.js'
import { truncate } from '../../../utils/text.js'

export default defineCommand({
  name: 'character',
  aliases: ['char'],
  category: 'anime',
  description: 'Look up an anime character (Jikan / MAL).',
  usage: 'character <name>',
  cooldown: 3000,
  run: async ({ send, message, args }) => {
    if (args.length === 0) return send.reply(message, 'Usage: character <name>')
    const query = args.join(' ')
    const result = await searchCharacter(query)
    if (!result) return send.reply(message, `No character found for "${query}".`)

    const meta: Array<[string, string]> = []
    if (result.name_kanji) meta.push(['kanji', result.name_kanji])
    if (result.nicknames?.length) meta.push(['aliases', result.nicknames.join(', ')])
    if (typeof result.favorites === 'number') meta.push(['favorites', String(result.favorites)])

    const parts: string[] = [`*${result.name}*`]
    if (meta.length) {
      parts.push('```')
      parts.push(meta.map(([k, v]) => `${k.padEnd(9)} ${v}`).join('\n'))
      parts.push('```')
    }
    if (result.about) parts.push(truncate(result.about, 700))
    parts.push('', result.url)

    const caption = parts.join('\n')

    try {
      const { data } = await getBuffer(result.images.jpg.image_url)
      await send.reply(message, { image: data, caption })
    } catch {
      await send.reply(message, caption)
    }
  }
})
