// One-off script to capture README screenshots using the system-installed
// Chrome (via Playwright's `channel: 'chrome'`) so no browser binary needs
// to be downloaded. Requires the dev server running at http://localhost:5173.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots')
const BASE_URL = 'http://localhost:5173'

mkdirSync(OUT_DIR, { recursive: true })

async function shot(page, file) {
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT_DIR, file), animations: 'disabled' })
  console.log(`saved ${file}`)
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()

  await page.goto(BASE_URL, { waitUntil: 'networkidle' })

  const demoButton = page.getByText('Explore with demo data')
  await demoButton.waitFor({ timeout: 20000 })
  await demoButton.click()

  await page.getByText('Current Balance').waitFor({ timeout: 20000 })
  await shot(page, 'home.png')

  await page.locator('a[href="/goals"]').first().click()
  await page.getByText(/Goals/i).first().waitFor({ timeout: 10000 })
  await shot(page, 'goals.png')

  await page.locator('nav a[href="/transactions"]').click()
  await page.waitForTimeout(300)
  await shot(page, 'transactions.png')

  await page.locator('nav a[href="/budgets"]').click()
  await page.waitForTimeout(300)
  await shot(page, 'budgets.png')

  await page.locator('nav a[href="/analytics"]').click()
  await page.waitForTimeout(800)
  await shot(page, 'analytics.png')

  await page.locator('nav a[href="/settings"]').click()
  await page.waitForTimeout(300)
  await shot(page, 'settings.png')

  await browser.close()
  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
