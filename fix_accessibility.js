const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// HTML files to process
const htmlFiles = ['index.html', 'laptops.html', 'accessories.html', 'services.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  // 1. Fix WhatsApp & Action Buttons (Add accessible labels)
  $('a.whatsapp-btn, .whatsapp-btn').each((i, el) => {
    if (!$(el).attr('aria-label')) {
      const text = $(el).text().trim() || 'WhatsApp';
      $(el).attr('aria-label', `Contact Uptop Computers via ${text}`);
    }
  });

  // 2. Ensure Nav & Structural Links have ARIA labels
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    const hasText = $(el).text().trim().length > 0;
    
    // Add aria-label if link is icon-only or generic
    if (!hasText && !$(el).attr('aria-label')) {
      $(el).attr('aria-label', `Navigate to ${href || 'page'}`);
    }
  });

  // 3. Fix Heading Structure (Ensure dynamic product cards use h2 or h3 properly)
  $('h4, h5, h6').each((i, el) => {
    // If skipping levels directly from h1, normalize to h2/h3
    if ($(el).parents('.product-card, .item-card').length) {
      el.tagName = 'h3';
    }
  });

  fs.writeFileSync(filePath, $.html());
  console.log(`✅ Accessibility automated fixes applied to ${file}`);
});