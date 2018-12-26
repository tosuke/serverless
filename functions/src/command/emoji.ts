import { Request } from '../type'
import { getEmojiUrl, getUserInfo } from '../client'

const regexp = /:([^:]+):/

export default async (req: Request) => {
  if (!regexp.test(req.text)) {
    throw new Error('invalid format')
  }

  const [, emoji] = regexp.exec(req.text)

  const [emojiUrl, user] = await Promise.all([getEmojiUrl(emoji), getUserInfo(req.user_id)])

  if (emojiUrl == null) throw new Error('emoji not found')

  const name = user.real_name ? user.real_name : user.profile.display_name

  return {
    username: name,
    icon_url: user.profile.image_192,
    text: ' ',
    attachments: [
      {
        fallback: `:${emoji}:`,
        image_url: emojiUrl
      }
    ]
  }
}
