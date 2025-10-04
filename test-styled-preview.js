const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to all console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.error(`[PAGE ERROR] ${error}`);
  });

  // Navigate to styled preview
  console.log('Navigating to styled preview...');
  await page.goto('http://localhost:3000/layout-editor-styled');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Take a screenshot
  await page.screenshot({ path: '.playwright-mcp/styled-preview.png', fullPage: true });
  console.log('Screenshot saved to .playwright-mcp/styled-preview.png');

  // Check if amber theme is applied
  const hasAmberTheme = await page.evaluate(() => {
    const element = document.querySelector('.amber-theme');
    return !!element;
  });
  console.log(`Amber theme applied: ${hasAmberTheme}`);

  // Check if styled preview header exists
  const headerText = await page.textContent('.amber-header-title').catch(() => null);
  console.log(`Header text: ${headerText}`);

  // Check sidebar for "Styled Preview" link
  const styledPreviewLink = await page.textContent('text=Styled Preview').catch(() => null);
  console.log(`Styled Preview link found: ${!!styledPreviewLink}`);

  // Wait a bit to see the page
  console.log('Waiting 5 seconds to inspect...');
  await page.waitForTimeout(5000);

  // Don't close automatically - leave browser open for inspection
  console.log('Browser is open for inspection. Press Ctrl+C to close.');
})();
