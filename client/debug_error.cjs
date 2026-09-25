const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright...');
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
      console.log('BROWSER CONSOLE:', msg.type(), msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('BROWSER UNCAUGHT EXCEPTION:', error.message);
    });

    console.log('Navigating to Vercel URL...');
    await page.goto('https://ai-integration-in-code-engine.vercel.app', { waitUntil: 'networkidle' });
    const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML);
    console.log('ROOT HTML LENGTH:', rootHtml ? rootHtml.length : 'null');
    if (rootHtml && rootHtml.length < 500) {
      console.log('ROOT HTML:', rootHtml);
    }
    
    console.log('Done. Closing browser.');
    await browser.close();
  } catch (err) {
    console.error('Playwright Script Error:', err);
  }
})();
