import express from 'express';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({
    body: {},
    error: { status_code: 400, status_message: 'Missing URL parameter' },
    returned_an_error: true
  });

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const title =
        document.querySelector('meta[property="og:title"]')?.content ||
        document.title || '';

      const image =
        document.querySelector('meta[property="og:image"]')?.content || '';

      const price =
        document.querySelector('meta[property="product:price:amount"]')?.content ||
        document.querySelector('[class*="price"], [id*="price"]')?.textContent?.match(/\$\d+(\.\d{2})?/)?.[0] || '';

      return { title, price, image };
    });

    await browser.close();

    res.json({
      body: data,
      error: { status_code: 200, status_message: "OK" },
      returned_an_error: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      body: {},
      error: { status_code: 500, status_message: error.message },
      returned_an_error: true
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
