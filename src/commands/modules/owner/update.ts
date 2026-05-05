import { exec } from 'child_process'
import { promisify } from 'util'
import { spawn } from 'child_process'
import { defineCommand } from '../../types.js'

const run = promisify(exec)

export default defineCommand({
  name: 'update',
  category: 'owner',
  description: 'git pull, rebuild, and restart.',
  permission: 'owner',
  cooldown: 30_000,
  run: async ({ send, message }) => {
    await send.reply(message, 'Pulling…')
    let pulled: string
    try {
      const { stdout } = await run('git pull --ff-only', { cwd: process.cwd() })
      pulled = stdout.trim()
    } catch (err) {
      const msg = (err as Error).message.split('\n').slice(0, 4).join('\n')
      return send.reply(message, `git pull failed:\n\`\`\`\n${msg}\n\`\`\``)
    }

    if (/Already up to date/i.test(pulled)) {
      return send.reply(message, 'Already up to date.')
    }

    await send.reply(message, `Pulled:\n\`\`\`\n${pulled.slice(-1500)}\n\`\`\`\nRebuilding…`)

    try {
      await run('npm run build', { cwd: process.cwd() })
    } catch (err) {
      const msg = (err as Error).message.split('\n').slice(0, 6).join('\n')
      return send.reply(message, `Build failed, NOT restarting:\n\`\`\`\n${msg}\n\`\`\``)
    }

    await send.reply(message, 'Build OK — restarting.')

    setTimeout(() => {
      const child = spawn(process.argv[0]!, process.argv.slice(1), {
        cwd: process.cwd(),
        env: process.env,
        detached: true,
        stdio: 'inherit'
      })
      child.unref()
      process.exit(0)
    }, 500)
  }
})
