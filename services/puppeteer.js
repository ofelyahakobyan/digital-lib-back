import puppeteer from 'puppeteer';

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: false,
    userDataDir: './tmp',
  });
  const page = await browser.newPage();
  // Navigate the page to a URL
  await page.goto('https://www.amazon.com/s?k=Spring+Jackets&rh=n%3A7141123011%2Cn%3A7132359011&dc&ds=v1%3AaDEGnqapFmcUhVBOvP6%2BfB%2F4Xnl9i6PmyP3A%2BbQsrPI&_encoding=UTF8&content-id=amzn1.sym.b4114be9-6d3d-4aed-8b31-fcbf38a83486&crid=28AAZ2JDZCYX1&pd_rd_r=024a6aa0-32fb-4217-ad11-37e012dde996&pd_rd_w=7sArL&pd_rd_wg=c6S6A&pf_rd_p=b4114be9-6d3d-4aed-8b31-fcbf38a83486&pf_rd_r=3Q5YHBY844CS957Q5RD9&qid=1704376262&rnid=2941120011&sprefix=spring+jackets%2Caps%2C140&ref=sr_nr_n_2');
  await page.screenshot({ path: 'sheet.png' });
  await browser.close();
})();