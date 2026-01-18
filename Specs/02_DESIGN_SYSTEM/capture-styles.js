const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://www.swm.de/baeder/auslastung', { waitUntil: 'networkidle' });

  // Dismiss cookie dialog
  try {
    await page.click('button:has-text("Alle ablehnen")', { timeout: 5000 });
  } catch (e) {
    console.log('No cookie dialog');
  }

  await page.waitForTimeout(2000);

  // Extract styles from key elements
  const styles = await page.evaluate(() => {
    const getStyles = (selector, description) => {
      const el = document.querySelector(selector);
      if (!el) return { description, found: false };
      const cs = window.getComputedStyle(el);
      return {
        description,
        found: true,
        text: el.textContent?.substring(0, 100),
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        padding: cs.padding,
        margin: cs.margin
      };
    };

    // Find the section title "Echtzeit-Auslastung der Bäder"
    let sectionTitle = null;
    document.querySelectorAll('h2, h3, .headline').forEach(el => {
      if (el.textContent?.includes('Echtzeit-Auslastung')) {
        const cs = window.getComputedStyle(el);
        sectionTitle = {
          text: el.textContent.trim(),
          tagName: el.tagName,
          className: el.className,
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          color: cs.color
        };
      }
    });

    // Find hero title
    let heroTitle = null;
    document.querySelectorAll('h1, .hero__headline, .stage__headline').forEach(el => {
      if (el.textContent?.includes('Hallenbäder') || el.textContent?.includes('Auslastung')) {
        const cs = window.getComputedStyle(el);
        heroTitle = {
          text: el.textContent.trim(),
          tagName: el.tagName,
          className: el.className,
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          color: cs.color
        };
      }
    });

    // Get hero box
    let heroBox = null;
    const boxEl = document.querySelector('.hero__box, .stage__box');
    if (boxEl) {
      const cs = window.getComputedStyle(boxEl);
      heroBox = {
        className: boxEl.className,
        backgroundColor: cs.backgroundColor,
        padding: cs.padding
      };
    }

    return { sectionTitle, heroTitle, heroBox };
  });

  console.log(JSON.stringify(styles, null, 2));

  await browser.close();
})();
