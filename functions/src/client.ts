import { WebClient } from '@slack/client'
import * as config from './config.json'
import { User, EmojiMap } from './type'

const userMap = new Map<string, User>()
let defaultEmojiMap: EmojiMap
let customEmojiMap: EmojiMap

export const slack = new WebClient(config.SLACK_API_TOKEN)

export async function getUserInfo(userid: string): Promise<User> {
  if (!userMap.has(userid)) {
    const result = await slack.users.info({ user: userid })
    const user = (result as any).user
    userMap.set(userid, user)
  }
  return userMap.get(userid)
}

export async function getEmojiUrl(emoji: string): Promise<string | undefined> {
  if (defaultEmojiMap == null) {
    defaultEmojiMap = await import('./emoji.json')
  }
  if (emoji in defaultEmojiMap) {
    const resolved = await resolveEmoji(defaultEmojiMap[emoji])
    defaultEmojiMap[emoji] = resolved
    return resolved
  }

  if (customEmojiMap == null) {
    const result = await slack.emoji.list()
    customEmojiMap = (result as any).emoji
  }
  if (emoji in customEmojiMap) {
    const resolved = await resolveEmoji(customEmojiMap[emoji])
    customEmojiMap[emoji] = resolved
    return resolved
  }

  return undefined
}

async function resolveEmoji(emoji: string): Promise<string> {
  if (/^http/.test(emoji)) {
    return emoji
  } else if(/^alias/.test(emoji)) {
    const [, aliasTo] = /^alias:(.*)$/.exec(emoji)
    return await getEmojiUrl(aliasTo)
  } else {
    return `https://twemoji.maxcdn.com/2/72x72/${emoji}.png`
  }
}
