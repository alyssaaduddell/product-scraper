import { chromium } from 'playwright';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter.' });
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const title = await page.title();

    const price = await page.locator('text=\$').first().textContent().catch(() => '');
    const image = await page.locator('img').first().getAttribute('src').catch(() => '');

    await browser.close();

    return res.status(200).json({
      title: title || '',
      price: price?.trim() || '',
      image: image || ''
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to scrape the product.' });
  }
}