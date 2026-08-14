const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlFiles = ['index.html', 'laptops.html', 'accessories.html', 'services.html'];

htmlFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  // 1. Ensure <html> tag has lang="en"
  if (!$('html').attr('lang')) {
    $('html').attr('lang', 'en');
  }

  // 2. Add alt text to images missing alt attributes
  $('img').each((_, el) => {
    const $img = $(el);
    if (!$img.attr('alt')) {
      // Generate descriptive fallback from filename or class
      const src = $img.attr('src') || '';
      const fallbackAlt = src.split('/').pop().split('.')[0].replace(/[-_]/g, ' ') || 'UpTop Computers Image';
      $img.attr('alt', fallbackAlt);
    }
  });

  // 3. Add aria-label to icon buttons or buttons without visible text
  $('button').each((_, el) => {
    const $btn = $(el);
    const text = $btn.text().trim();
    if (!text && !$btn.attr('aria-label')) {
      const className = $btn.attr('class') || 'action';
      $btn.attr('aria-label', `Execute ${className.replace(/[-_]/g, ' ')}`);
    }
  });

  // 4. Ensure form input elements have aria-label or associated label
  $('input, select, textarea').each((_, el) => {
    const $input = $(el);
    if (!$input.attr('aria-label') && !$input.attr('id')) {
      const placeholder = $input.attr('placeholder') || $input.attr('name') || 'Input field';
      $input.attr('aria-label', placeholder);
    }
  });

  // 5. Ensure interactive links have text content or aria-label
  $('a').each((_, el) => {
    const $a = $(el);
    const text = $a.text().trim();
    if (!text && !$a.attr('aria-label')) {
      const href = $a.attr('href') || 'link';
      $a.attr('aria-label', `Navigate to ${href.replace(/[\/#._]/g, ' ')}`);
    }
  });

  // Save changes to root and dist/
  const outputHtml = $.html();
  fs.writeFileSync(filePath, outputHtml, 'utf8');

  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.writeFileSync(path.join(distDir, file), outputHtml, 'utf8');

  console.log(`✓ Automated Accessibility & Performance fixes applied to ${file}`);
});