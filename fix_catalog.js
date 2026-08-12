const fs = require('fs');
const path = 'c:/Users/admin/Pictures/Real  uptop 1/productsData.js';
const text = fs.readFileSync(path, 'utf8');
const match = text.match(/^const productsData = ([\s\S]*?);\s*$/);
if (!match) {
  console.error('productsData.js pattern did not match');
  process.exit(1);
}

const items = JSON.parse(match[1]);

const clean = (value) => String(value ?? '')
  .replace(/\*/g, '')
  .replace(/\bUnspecified\b/gi, '')
  .replace(/\bN\/A\b/gi, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*[-–—]\s*/g, ' - ')
  .replace(/\s*,\s*/g, ', ')
  .replace(/\s+\./g, '.')
  .replace(/\s+\)/g, ')')
  .replace(/\(\s+/g, '(')
  .replace(/\s{2,}/g, ' ')
  .trim();

const kindLabel = (type) => {
  const t = String(type || '').toLowerCase();
  if (t.includes('desktop')) return 'desktop computer';
  if (t.includes('bag')) return 'laptop bag';
  if (t.includes('mouse')) return 'mouse';
  if (t.includes('keyboard')) return 'keyboard';
  if (t.includes('charger')) return 'charger';
  if (t.includes('screen')) return 'screen';
  if (t.includes('laptop')) return 'laptop';
  if (t.includes('accessory')) return 'accessory';
  if (t.includes('monitor')) return 'monitor';
  return 'computer product';
};

const normalized = items.map((product, index) => {
  const name = product.name || product.model || product.brand || `Product ${index + 1}`;
  const kind = kindLabel(product.type || product.category || 'product');
  const specs = clean(product.specs) || (kind === 'accessory' ? 'Quality-tested accessory' : 'Quality-tested computer product');
  const description = clean(product.description) || `${name} is a ${kind} with ${specs}. Built for dependable daily use, smooth productivity, and practical value for homes, offices, and businesses in Kenya.`;
  return { ...product, specs, description };
});

fs.writeFileSync(path, `const productsData = ${JSON.stringify(normalized, null, 2)};\n`);
const starCount = normalized.filter((product) => /\*/.test(product.specs || '')).length;
const unspecifiedCount = normalized.filter((product) => /Unspecified/i.test(product.specs || '')).length;
console.log(JSON.stringify({ total: normalized.length, starCount, unspecifiedCount, sample: normalized[0].description }, null, 2));
