const express = require("express");
const { chromium } = require("playwright-extra");
const StealthPlugin = require("playwright-extra-plugin-stealth");
const cors = require("cors");

const app = express();
app.use(cors());

chromium.use(StealthPlugin());

app.get("/scrape", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL." });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const title = await page.title();
    const image = await page.$eval("img", (img) => img.src).catch(() => "");
    const price = await page.$eval("[data-test='product-price'], .price", (el) => el.textContent).catch(() => "");

    res.json({ title, price, image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scrape the product." });
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
