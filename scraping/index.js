import puppeteer from "puppeteer";

const getQuotes = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // http://quotes.toscrape.com/

  await page.goto(
    "https://www.tradingview.com/markets/stocks-united-kingdom/market-movers-all-stocks/",
    {
      waitUntil: "domcontentloaded",
    }
  );
};

getQuotes();
