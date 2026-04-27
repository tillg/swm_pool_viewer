const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://www.swm.de/baeder/auslastung#bad', { waitUntil: 'networkidle' });

  // Wait for the page to load and dismiss any cookie dialogs
  try {
    await page.click('button:has-text("Alle ablehnen")', { timeout: 3000 });
  } catch (e) {
    console.log('No cookie dialog or already dismissed');
  }

  await page.waitForTimeout(1000);

  // Find the hero section and extract styles
  const heroStyles = await page.evaluate(() => {
    // Find the hero box with the title
    const heroBox = document.querySelector('.hero__box, .stage__box, [class*="hero"] [class*="box"]');
    const heroTitle = document.querySelector('.hero__headline, .stage__headline, h1');
    const heroContainer = document.querySelector('.hero, .stage, [class*="hero"]');

    const getComputedStyles = (el) => {
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        padding: styles.padding,
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        margin: styles.margin,
        width: styles.width,
        maxWidth: styles.maxWidth,
        height: styles.height,
        position: styles.position,
        className: el.className,
        tagName: el.tagName,
        innerHTML: el.innerHTML?.substring(0, 200)
      };
    };

    // Also try to find by looking at the page structure
    const allH1 = document.querySelectorAll('h1');
    let foundTitle = null;
    allH1.forEach(h1 => {
      if (h1.textContent.includes('Auslastung') || h1.textContent.includes('Hallenbäder')) {
        foundTitle = h1;
      }
    });

    // Get the parent box of the title
    let foundBox = null;
    if (foundTitle) {
      foundBox = foundTitle.closest('div');
    }

    return {
      heroBox: getComputedStyles(heroBox),
      heroTitle: getComputedStyles(heroTitle),
      heroContainer: getComputedStyles(heroContainer),
      foundTitle: getComputedStyles(foundTitle),
      foundBox: getComputedStyles(foundBox),
      foundBoxParent: foundBox ? getComputedStyles(foundBox.parentElement) : null
    };
  });

  console.log('Hero Styles:', JSON.stringify(heroStyles, null, 2));

  // Take a screenshot of just the hero area
  await page.screenshot({
    path: '/Users/tgartner/git/swm_pool_viewer/Specs/02_DESIGN_SYSTEM/swm-hero-reference.png',
    clip: { x: 0, y: 0, width: 1440, height: 600 }
  });

  console.log('Screenshot saved');

  await browser.close();
})();
