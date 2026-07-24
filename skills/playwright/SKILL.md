---
name: playwright
description: Use when automating browser tasks: testing, scraping, screenshots, form filling, or debugging web applications with Playwright.
---

# Playwright Guide

## Installation

```bash
npm init playwright@latest
# or
npx playwright install
```

## Basic Usage

```typescript
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto('https://example.com')
await page.click('button#submit')
await page.fill('input[name="email"]', 'test@example.com')

const title = await page.title()
await page.screenshot({ path: 'screenshot.png' })

await browser.close()
```

## Testing

```typescript
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')
  await page.fill('#email', 'user@example.com')
  await page.fill('#password', 'password')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Welcome')
})
```

## Selectors

```typescript
// CSS selectors
page.locator('button.primary')
page.locator('#submit-btn')
page.locator('.card >> text=Learn more')

// Text selectors
page.getByText('Submit')
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByPlaceholder('Enter email')

// Test ID
page.getByTestId('login-form')
```

## Best Practices

- Use **web-first assertions** (auto-retrying)
- Use **locators** over selectors
- **Isolate tests** — each test should be independent
- Use **fixtures** for common setup
- **Network interception** for API mocking
