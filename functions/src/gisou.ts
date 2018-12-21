import { Request } from './type'
import { getUserInfo } from './client'

export default async (req: Request) => {
  const regexp = /<@(\w+)\|.+>(.*)$/
  if (!regexp.test(req.text)) {
    throw new Error('invalid format')
  }
  const match = regexp.exec(req.text)
  const [, uid, text ] = match
  const user = await getUserInfo(uid)
  const name = user.real_name ? user.real_name : user.profile.display_name
  return {
    username: name,
    icon_url: user.profile.image_192,
    mrkdwn: true,
    text: text || ''
  }
}
