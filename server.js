import express from 'express';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/scraper', async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: 'Missing URL parameter.' });

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(5000); // wait extra 5s to let JS load

const content = await page.content();
console.log('Page HTML:', content.slice(0, 1000)); // Print first 1000 characters

// TEMPORARY: save raw HTML for inspection
await page.screenshot({ path: 'screenshot.png', fullPage: true });

const title = await page.locator('h1[data-buy-box-listing-title]').textContent().catch(() => '');
const price = await page.locator('[data-buy-box-region="price"] p').first().textContent().catch(() => '');
const image = await page.locator('[data-carousel-first-image] img').first().getAttribute('src').catch(() => '');

    await browser.close();

    return res.json({
      title: title?.trim() || '',
      price: price?.trim() || '',
      image: image || ''
    });

  } catch (error) {
    console.error('Scraper error:', error);
    return res.status(500).json({ error: 'Failed to scrape the product.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
