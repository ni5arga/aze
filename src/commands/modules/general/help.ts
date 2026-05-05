import { defineCommand, type Command } from '../../types.js'
import { env } from '../../../config/env.js'
import { formatDuration } from '../../../utils/time.js'

const REPO_URL = 'https://github.com/ni5arga/aze'

const startedAt = Date.now()

const renderDetail = (cmd: Command, prefix: string): string => {
  const rows: Array<[string, string]> = [
    ['command', `${prefix}${cmd.name}`],
    ['about', cmd.description],
    ['category', cmd.category]
  ]
  if (cmd.aliases?.length) rows.push(['aliases', cmd.aliases.join(', ')])
  if (cmd.usage) rows.push(['usage', `${prefix}${cmd.usage}`])
  if (cmd.permission) rows.push(['access', cmd.permission])
  if (cmd.cooldown) rows.push(['cooldown', formatDuration(cmd.cooldown)])

  const block = rows.map(([k, v]) => `${k.padEnd(8)} ${v}`).join('\n')
  return [
    `*↳ ${prefix}${cmd.name}*`,
    '```',
    block,
    '```',
    `_source: ${REPO_URL}_`
  ].join('\n')
}

export default defineCommand({
  name: 'help',
  aliases: ['menu', 'commands'],
  category: 'general',
  description: 'List available commands or detail one.',
  usage: 'help [command]',
  run: async ({ send, message, args, prefix, registry }) => {
    if (args[0]) {
      const cmd = registry.resolve(args[0])
      if (!cmd) return send.reply(message, `No command named *${args[0]}*.`)
      await send.send(message.chat, { text: renderDetail(cmd, prefix) })
      return
    }

    const groups = registry.byCategory()
    const total = registry.list().length
    const uptime = formatDuration(Date.now() - startedAt)
    const name = env.botName.toLowerCase()

    const out: string[] = [
      `╭─ *${name}* ─╮`,
      `${REPO_URL}`,
      '',
      `\`prefix\` ${prefix}   \`commands\` ${total}   \`uptime\` ${uptime}`,
      ''
    ]

    const categories = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    for (const [category, cmds] of categories) {
      out.push(`*>> ${category}*  _(${cmds.length})_`)
      const sorted = [...cmds].sort((a, b) => a.name.localeCompare(b.name))
      for (const cmd of sorted) out.push(`  ›  *${prefix}${cmd.name}*  —  ${cmd.description}`)
      out.push('')
    }

    out.push(`_tip:_ \`${prefix}help <command>\` for details`)
    await send.send(message.chat, { text: out.join('\n').trim() })
  }
})
