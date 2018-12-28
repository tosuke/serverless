import { Request } from '../type'
import { getUserInfo } from '../client'

const opts = {
  unfurl_links: true,
  unfurl_media: true,
  mrkdwn: true
}

const userRegexp = /<@(\w+)\|[^>]+>(.+)$/
const emojiRegexp = /(:\w+:)\s*([^\s]+)\s+(.+)$/

export default async (req: Request) => {
  if (userRegexp.test(req.text)) {
    const [, uid, text] = userRegexp.exec(req.text)
    return await gisouToUser(req, uid, text)
  }
  if (emojiRegexp.test(req.text)) {
    const [, emoji, name, text] = emojiRegexp.exec(req.text)
    return await gisouToEmoji(req, emoji, name, text)
  }
  throw new Error('invalid format')
}

async function gisouToUser(req: Request, uid: string, text: string): Promise<any> {
  const user = await getUserInfo(uid)

  console.info(`${req.user_name} to ${user.name}`)

  const name = user.real_name ? user.real_name : user.profile.display_name
  return {
    ...opts,
    icon_url: user.profile.image_192,
    username: name,
    text
  }
}

async function gisouToEmoji(req: Request, emoji: string, name: string, text: string): Promise<any> {
  console.info(`${req.user_name} to ${emoji}`)

  return {
    ...opts,
    icon_emoji: emoji,
    username: name,
    text
  }
}
