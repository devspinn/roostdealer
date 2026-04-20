import puppeteer, { type Browser, type Page } from 'puppeteer'

const RATE_LIMIT_MS = 200

let browser: Browser | null = null
let page: Page | null = null

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function ensureBrowser(): Promise<Page> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
  }
  return page!
}

/**
 * Fetch a page using a real browser. Passes WAF/JS challenges automatically.
 * Returns the fully-rendered HTML.
 */
export async function fetchPage(url: string): Promise<string> {
  const p = await ensureBrowser()
  await sleep(RATE_LIMIT_MS)

  const response = await p.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 })
  if (!response) {
    throw new Error(`No response fetching ${url}`)
  }

  const status = response.status()
  if (status >= 400) {
    throw new Error(`HTTP ${status} fetching ${url}`)
  }

  return p.content()
}

/**
 * Fetch JSON from an API endpoint using the browser's cookies/session.
 * After the browser has visited the site (passing WAF), subsequent
 * requests share the same cookie jar.
 */
export async function fetchJson<T>(url: string): Promise<T> {
  const p = await ensureBrowser()
  await sleep(RATE_LIMIT_MS)

  // Use page.evaluate to make a fetch from within the browser context,
  // which inherits all cookies and session state
  const result = await p.evaluate(async (fetchUrl: string) => {
    const res = await fetch(fetchUrl, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    return res.json()
  }, url)

  return result as T
}

/**
 * Evaluate a function in the current page's browser context.
 * The page must have been navigated to via fetchPage() first.
 */
export async function evaluateInPage<T>(fn: () => T): Promise<T> {
  if (!page) throw new Error('No page loaded — call fetchPage() first')
  return page.evaluate(fn)
}

/**
 * Close the browser. Call this when scraping is done.
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
    page = null
  }
}
