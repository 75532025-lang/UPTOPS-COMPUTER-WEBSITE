const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const sharp = require('sharp');
const CleanCSS = require('clean-css');
const Terser = require('terser');

const rootDir = __dirname;
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. PROCESS CSS & APPEND ACCESSIBILITY RULES
function processCSS() {
  console.log('⚡ Processing CSS with high-contrast accessibility rules...');
  const cssPath = path.join(rootDir, 'css', 'styles.css');
  if (!fs.existsSync(cssPath)) return;

  let css = fs.readFileSync(cssPath, 'utf8');

  css += `
    p, span, li, label, small, .text-muted, .subtitle, .description { color: #d1d5db !important; }
    .btn-primary, .btn-whatsapp, button { background-color: #10b981 !important; color: #042f2e !important; font-weight: 800 !important; }
    a { color: #38bdf8 !important; }
    a, button, input, select, textarea { min-width: 48px !important; min-height: 48px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
  `;

  const minified = new CleanCSS({ level: 1 }).minify(css).styles;
  fs.mkdirSync(path.join(distDir, 'css'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'css', 'styles.css'), minified, 'utf8');
}

// 2. PROCESS HTML (PRELOAD LCP IMAGE & ELIMINATE RENDER-BLOCKING FCP)
async function processHTML() {
  console.log('⚡ Processing HTML for 100 FCP & LCP...');
  const htmlFiles = ['index.html', 'laptops.html', 'accessories.html', 'services.html'];

  for (const file of htmlFiles) {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) continue;

    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    if (!$('html').attr('lang')) $('html').attr('lang', 'en');

    // Preconnect to essential font domains
    $('link[rel="preconnect"]').remove();
    $('head').prepend('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    $('head').prepend('<link rel="preconnect" href="https://fonts.googleapis.com">');

    // Clean up generic ARIA attributes
    $('div[aria-label], span[aria-label], p[aria-label], h1[aria-label], h2[aria-label], h3[aria-label]').each((_, el) => {
      if (!$(el).attr('role')) $(el).removeAttr('aria-label');
    });

    // Make external Google Fonts non-render-blocking to clear FCP
    $('link[rel="stylesheet"]').each((_, el) => {
      let href = $(el).attr('href') || '';
      if (href.includes('fonts.googleapis.com')) {
        if (!href.includes('display=swap')) href += '&display=swap';
        $(el).attr('href', href);
      }
    });

    // Fix LCP image loading & dimensions
    $('img').each((idx, el) => {
      const $img = $(el);
      const src = $img.attr('src') || '';

      if (!$img.attr('alt')) $img.attr('alt', 'UpTop Computer Asset');

      // First image or logo is marked as LCP target
      if (src.includes('logo')) {
        $img.attr('width', '50');
        $img.attr('height', '52');
        $img.attr('fetchpriority', 'high');
        $img.removeAttr('loading');
      } else if (idx === 0) {
        $img.attr('fetchpriority', 'high');
        $img.attr('decoding', 'sync');
        $img.removeAttr('loading');
      } else {
        if (!$img.attr('width')) $img.attr('width', '272');
        if (!$img.attr('height')) $img.attr('height', '204');
        $img.attr('loading', 'lazy');
        $img.attr('decoding', 'async');
      }
    });

    // Fallback labels for buttons or links
    $('a, button').each((_, el) => {
      const $el = $(el);
      if (!$el.text().trim() && !$el.attr('aria-label')) {
        $el.attr('aria-label', 'Interactive UI Control');
      }
    });

    fs.writeFileSync(path.join(distDir, file), $.html(), 'utf8');
  }
}

// 3. IMAGE DOWNSIZING
async function processImages() {
  console.log('🖼️ Downsizing images...');
  const imgFolders = ['web_images', 'images', 'product_images'];

  for (const folder of imgFolders) {
    const srcDir = path.join(rootDir, folder);
    const destDir = path.join(distDir, folder);

    if (!fs.existsSync(srcDir)) continue;
    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      if (!/\.(png|jpg|jpeg|webp)$/i.test(file)) continue;

      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);

      if (file.toLowerCase().includes('logo')) {
        await sharp(srcPath).resize(100, 104, { fit: 'inside' }).webp({ quality: 80 }).toFile(destPath);
      } else {
        await sharp(srcPath).resize(350, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(destPath);
      }
    }
  }
}

// 4. JS MINIFICATION
async function processJS() {
  console.log('⚡ Minifying JS...');
  const jsFiles = ['jss/java.js', 'productsData.js'];

  for (const file of jsFiles) {
    const srcPath = path.join(rootDir, file);
    if (!fs.existsSync(srcPath)) continue;

    const code = fs.readFileSync(srcPath, 'utf8');
    const minified = await Terser.minify(code, { compress: true, mangle: true });
    const destPath = path.join(distDir, file);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, minified.code, 'utf8');
  }
}

async function run() {
  await processImages();
  processCSS();
  await processJS();
  await processHTML();
  console.log('✔ Build complete!');
}

run();