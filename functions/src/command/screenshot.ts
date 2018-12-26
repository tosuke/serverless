import { Request } from '../type'
import { getPage, releasePage } from '../browser'
import { upload, createURL } from '../storage'
import { URL } from 'url'
import nanoid = require('nanoid')

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3165.0 Safari/537.36'

const regexp = /<([^>]+)>/

export default async (req: Request) => {
  if (!regexp.test(req.text)) throw new Error('invalid format')
  const [, src] = regexp.exec(req.text)
  const url = new URL(src).toString()

  const buffer = await screenshot(url)

  const id = nanoid()
  const objectName = `USLACKBOT/screenshots/${id}.jpg`
  await upload(objectName, buffer)
  const imageUrl = createURL(objectName)

  return {
    username: 'screenshot bot',
    icon_emoji: ':camera_with_flash:',
    text: `<@${req.user_id}> ${url}`,
    attachments: [
      {
        fallback: imageUrl,
        image_url: imageUrl
      }
    ]
  }
}

async function screenshot(url: string): Promise<Buffer> {
  const page = await getPage()
  try {
    page.setUserAgent(USER_AGENT)
    page.setViewport({ width: 1920, height: 1080 })
    await page.goto(url, {
      timeout: 10 * 1000,
      waitUntil: 'networkidle0'
    })
    const buffer = await page.screenshot({
      type: 'jpeg',
      encoding: 'binary'
    })
    return buffer
  } finally {
    releasePage(page)
  }
}
