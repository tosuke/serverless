import { WebClient } from '@slack/client'
import * as config from './config.json'
import { User, EmojiMap } from './type'

const userMap = new Map<string, User>()
let emojiMap: EmojiMap

export const slack = new WebClient(config.SLACK_API_TOKEN)

export async function getUserInfo(userid: string): Promise<User> {
  if (!userMap.has(userid)) {
    const result = await slack.users.info({ user: userid })
    const user = (result as any).user
    userMap.set(userid, user)
  }
  return userMap.get(userid)
}

export async function getEmoji(): Promise<EmojiMap> {
  if (emojiMap == null) {
    const result = await slack.emoji.list()
    const tmp: EmojiMap = {
      ...require('./emoji.json'),
      ...(result as any).emoji
    }

    for(const [key, val] of Object.entries(tmp)) {
      tmp[key] = resolveEmoji(val, tmp)
    }

    emojiMap = tmp
  }
  return emojiMap
}

function resolveEmoji(emoji: string, map: EmojiMap): string {
  if (/^http/.test(emoji)) {
    return emoji
  } else if(/^alias/.test(emoji)) {
    const [, aliasTo] = /^alias:(.*)$/.exec(emoji)
    return resolveEmoji(aliasTo, map)
  } else {
    return `https://twemoji.maxcdn.com/2/72x72/${emoji}.png`
  }
}
