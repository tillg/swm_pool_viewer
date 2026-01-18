const { chromium } = require('playwright');
const fs = require('fs');

async function captureDesign() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Navigating to SWM Auslastung page...');
  await page.goto('https://www.swm.de/baeder/auslastung', { waitUntil: 'networkidle' });

  // Wait for content to load
  await page.waitForTimeout(2000);

  // Try to accept cookies / dismiss dialog
  try {
    const acceptButton = await page.$('button:has-text("Alle akzeptieren"), button:has-text("akzeptieren")');
    if (acceptButton) {
      await acceptButton.click();
      console.log('Cookie consent accepted');
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('No cookie dialog or already dismissed');
  }

  // Take screenshot after dismissing dialog
  await page.screenshot({ path: 'swm-auslastung-clean.png', fullPage: true });
  console.log('Clean screenshot saved: swm-auslastung-clean.png');

  // Extract SVG icons for facilities
  const facilityIcons = await page.evaluate(() => {
    const icons = {};

    // Find all SVG elements with facility-related icons
    document.querySelectorAll('svg[data-name], svg use[href]').forEach(svg => {
      const dataName = svg.getAttribute('data-name');
      const useHref = svg.querySelector('use')?.getAttribute('href') || svg.getAttribute('href');

      if (dataName || useHref) {
        const key = dataName || useHref?.replace('#', '');
        if (key && !icons[key]) {
          // Try to get the symbol definition
          const symbolId = useHref?.replace('#', '') || dataName;
          const symbol = document.querySelector(`#${symbolId}`);
          icons[key] = {
            dataName,
            useHref,
            outerHTML: svg.outerHTML,
            symbolHTML: symbol?.outerHTML?.substring(0, 2000)
          };
        }
      }
    });

    // Also look for the main sprite/symbol definitions
    const spriteContainer = document.querySelector('svg:has(symbol)');
    if (spriteContainer) {
      icons._spriteSymbols = [];
      spriteContainer.querySelectorAll('symbol').forEach(symbol => {
        const id = symbol.getAttribute('id');
        if (id && (id.includes('baeder') || id.includes('sauna') || id.includes('eis') || id.includes('swim') || id.includes('pool'))) {
          icons._spriteSymbols.push({
            id,
            innerHTML: symbol.innerHTML.substring(0, 3000)
          });
        }
      });
    }

    return icons;
  });

  // Extract facility items structure
  const facilityItems = await page.evaluate(() => {
    const items = [];

    // Find facility list items
    document.querySelectorAll('[class*="bath-capacity-item"], [class*="facility-item"]').forEach(item => {
      const nameEl = item.querySelector('[class*="name"], [class*="title"], h3, h4');
      const progressBar = item.querySelector('[class*="progress-bar"]:not([class*="empty"])');
      const iconSvg = item.querySelector('svg');

      const computed = progressBar ? window.getComputedStyle(progressBar) : null;

      items.push({
        name: nameEl?.textContent?.trim(),
        classes: item.className,
        iconDataName: iconSvg?.getAttribute('data-name'),
        progressBarStyles: computed ? {
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius,
          height: computed.height
        } : null
      });
    });

    return items;
  });

  // Get section headers
  const sectionHeaders = await page.evaluate(() => {
    const headers = [];
    document.querySelectorAll('h2, h3').forEach(h => {
      if (h.textContent.includes('Auslastung') || h.textContent.includes('Bäder') || h.textContent.includes('Saun') || h.textContent.includes('Eislauf')) {
        const computed = window.getComputedStyle(h);
        headers.push({
          text: h.textContent.trim(),
          tag: h.tagName,
          styles: {
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            color: computed.color,
            marginBottom: computed.marginBottom
          }
        });
      }
    });
    return headers;
  });

  // Get detailed progress bar colors
  const progressBarColors = await page.evaluate(() => {
    const colors = new Set();
    document.querySelectorAll('[class*="progress-bar"]:not([class*="empty"])').forEach(bar => {
      colors.add(window.getComputedStyle(bar).backgroundColor);
    });
    return Array.from(colors);
  });

  // Get all symbol definitions from the SVG sprite
  const allSymbols = await page.evaluate(() => {
    const symbols = [];
    document.querySelectorAll('symbol[id]').forEach(symbol => {
      symbols.push({
        id: symbol.getAttribute('id'),
        viewBox: symbol.getAttribute('viewBox'),
        innerHTML: symbol.innerHTML.substring(0, 5000)
      });
    });
    return symbols;
  });

  // Filter for relevant facility symbols
  const facilitySymbols = allSymbols.filter(s =>
    s.id.includes('baeder') || s.id.includes('sauna') || s.id.includes('eis') ||
    s.id.includes('swim') || s.id.includes('pool') || s.id.includes('wellness')
  );

  const result = {
    facilityIcons,
    facilityItems: facilityItems.slice(0, 30),
    sectionHeaders,
    progressBarColors,
    facilitySymbols,
    capturedAt: new Date().toISOString()
  };

  fs.writeFileSync('swm-facility-icons.json', JSON.stringify(result, null, 2));
  console.log('Facility icons saved: swm-facility-icons.json');

  await browser.close();
  console.log('Done!');
}

captureDesign().catch(console.error);
