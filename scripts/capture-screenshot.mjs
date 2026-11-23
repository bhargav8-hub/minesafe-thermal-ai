import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for the SVG lab bench or heading
  await page.waitForSelector('svg', { timeout: 10000 });

  // Locate the Tinkercad section
  const sections = await page.$$('section');
  let targetElement = null;
  for (const s of sections) {
    const text = await page.evaluate(el => el.innerText, s);
    if (text.includes('TINKERCAD') || text.includes('VIRTUAL LAB BENCH')) {
      targetElement = s;
      break;
    }
  }

  if (targetElement) {
    await targetElement.screenshot({ path: 'docs/tinkercad-lab-bench.png' });
    console.log('Successfully captured Tinkercad Lab Bench element screenshot!');
  } else {
    // If specific section not found, capture full page
    await page.screenshot({ path: 'docs/full-dashboard.png', fullPage: true });
    console.log('Captured full page screenshot!');
  }

  await browser.close();
})();
