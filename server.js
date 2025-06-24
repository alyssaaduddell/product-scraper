import express from 'express';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/scraper', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter.' });
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const title = await page.title();
    const price = await page.locator('text=\\$').first().textContent().catch(() => '');
    const image = await page.locator('img').first().getAttribute('src').catch(() => '');

    await browser.close();

    return res.json({
      title: title || '',
      price: price?.trim() || '',
      image: image || ''
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to scrape the product.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
