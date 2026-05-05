import { defineCommand } from '../../types.js'
import { searchAnime } from '../../../services/jikan.js'
import { getBuffer } from '../../../services/http.js'
import { truncate } from '../../../utils/text.js'

export default defineCommand({
  name: 'animeinfo',
  aliases: ['anime'],
  category: 'anime',
  description: 'Look up an anime by name (Jikan / MAL).',
  usage: 'animeinfo <title>',
  cooldown: 3000,
  run: async ({ send, message, args }) => {
    if (args.length === 0) return send.reply(message, 'Usage: animeinfo <title>')
    const query = args.join(' ')
    const anime = await searchAnime(query)
    if (!anime) return send.reply(message, `No results for "${query}".`)

    const meta: Array<[string, string]> = []
    if (anime.type) meta.push(['type', anime.type])
    if (anime.episodes) meta.push(['episodes', String(anime.episodes)])
    if (anime.status) meta.push(['status', anime.status])
    if (anime.year) meta.push(['year', String(anime.year)])
    if (anime.score)
      meta.push(['score', `${anime.score}/10${anime.rank ? `  (#${anime.rank})` : ''}`])
    if (anime.genres?.length) meta.push(['genres', anime.genres.map((g) => g.name).join(', ')])
    if (anime.studios?.length) meta.push(['studios', anime.studios.map((s) => s.name).join(', ')])

    const block = meta.map(([k, v]) => `${k.padEnd(8)} ${v}`).join('\n')

    const titleLine =
      anime.title_english && anime.title_english !== anime.title
        ? `*${anime.title}*  _${anime.title_english}_`
        : `*${anime.title}*`

    const caption = [
      titleLine,
      '```',
      block,
      '```',
      anime.synopsis ? truncate(anime.synopsis, 600) : '',
      '',
      anime.url
    ]
      .filter(Boolean)
      .join('\n')

    const cover = anime.images.jpg.large_image_url ?? anime.images.jpg.image_url

    try {
      const { data } = await getBuffer(cover)
      await send.reply(message, { image: data, caption })
    } catch {
      await send.reply(message, caption)
    }
  }
})
