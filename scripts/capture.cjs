const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // 2x high DPI crisp retina resolution
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 25000 });
    
    await page.waitForSelector('svg', { timeout: 10000 });
    
    // Hide any sticky top header so it doesn't overlap when scrolled
    await page.evaluate(() => {
      const header = document.querySelector('header');
      if (header) header.style.display = 'none';
      const stickyElements = document.querySelectorAll('.sticky, .fixed');
      stickyElements.forEach(el => el.style.position = 'static');
    });

    // Locate the Tinkercad section
    const sections = await page.$$('section');
    let target = null;
    for (const sec of sections) {
      const text = await page.evaluate(el => el.innerText, sec);
      if (text.includes('TINKERCAD') || text.includes('VIRTUAL LAB BENCH')) {
        target = sec;
        break;
      }
    }
    
    if (target) {
      // Scroll into view and screenshot
      await target.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
      await new Promise(r => setTimeout(r, 600));
      await target.screenshot({ path: 'docs/tinkercad-lab-bench.png' });
      console.log('SUCCESS: Captured clean Tinkercad Lab Bench section without header overlap!');
    }
    
    await browser.close();
  } catch (err) {
    console.error('Error in capture:', err);
    process.exit(1);
  }
})();
