const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 25000 });
    
    await page.waitForSelector('svg', { timeout: 10000 });
    
    // Hide sticky header
    await page.evaluate(() => {
      const header = document.querySelector('header');
      if (header) header.style.display = 'none';
      const stickyElements = document.querySelectorAll('.sticky, .fixed');
      stickyElements.forEach(el => el.style.position = 'static');
    });

    // Locate the Cave Simulation section (first main section or div with cave)
    const sections = await page.$$('section');
    for (const sec of sections) {
      const text = await page.evaluate(el => el.innerText, sec);
      if (text.includes('Cave') || text.includes('MINE') || text.includes('Tunnel')) {
        await sec.screenshot({ path: 'docs/cave-simulation.png' });
        console.log('SUCCESS: Captured Cave Simulation section!');
        break;
      }
    }
    
    await browser.close();
  } catch (err) {
    console.error('Error in capture:', err);
    process.exit(1);
  }
})();
