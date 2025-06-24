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

    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });

    const title = await page.title();
    console.log(`Title: ${title}`);

    let price = '';
    try {
      price = await page.locator('text=\\$').first().textContent();
      console.log(`Price: ${price}`);
    } catch (err) {
      console.warn('Price not found');
    }

    let image = '';
    try {
      image = await page.locator('img').first().getAttribute('src');
      console.log(`Image: ${image}`);
    } catch (err) {
      console.warn('Image not found');
    }

    await browser.close();

    return res.json({
      title: title || '',
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
