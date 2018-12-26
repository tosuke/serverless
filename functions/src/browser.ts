import { launch as launchBrowser, Browser, Page } from 'puppeteer'

let browser: Browser | undefined
const freePage: Page[] = []

export async function getBrowser(): Promise<Browser> {
  if (browser == null) {
    const isDebug = process.env.NODE_ENV !== 'production'

    const launchOptions = {
      headless: isDebug ? false : true,
      args: ['--no-sandbox']
    }

    browser = await launchBrowser(launchOptions)
  }
  return browser
}

export async function getPage(): Promise<Page> {
  if(freePage.length > 0) {
    return freePage.pop()
  }
  const browser = await getBrowser()
  return await browser.newPage()
}

export function releasePage(page: Page) {
  page.goBack()
  freePage.push(page)
}