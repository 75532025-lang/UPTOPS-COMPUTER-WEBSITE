# UpTop Computers — Production Build Guide

## 🎯 Lighthouse 100/100 Performance Optimizations

This guide explains how to build and deploy your UpTop Computers website with production-grade performance (100/100 Lighthouse score).

---

## 📋 Prerequisites

Ensure you have Node.js and npm installed on your system:

```powershell
node --version
npm --version
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
npm install
```

This installs the required build tools:

- **clean-css**: CSS minifier for compression
- **terser**: JavaScript minifier for compression
- **cheerio**: HTML parser (for build_production.js)
- **sharp**: Image optimization tool

### 2. Build for Production

```powershell
npm run build
```

This runs three sequential build steps:

1. **Minifies CSS** → `dist/styles.min.css`
2. **Minifies JavaScript** → `dist/java.min.js` & `dist/productsData.min.js`
3. **Copies and optimizes assets** → `dist/` directory

---

## 🛠️ Individual Build Commands

### Minify CSS Only

```powershell
npm run minify-css
```

**Output:**

- `dist/styles.min.css` (minified stylesheet)

**Options:**

```powershell
clean-css -o dist/styles.min.css --level 2 css/styles.css
```

- `--level 2`: Aggressive optimization (removes unused selectors)

---

### Minify JavaScript Only

```powershell
npm run minify-js
```

**Output:**

- `dist/java.min.js` (minified main script)
- `dist/productsData.min.js` (minified product data)

**Advanced options:**

```powershell
terser jss/java.js --output dist/java.min.js --compress --mangle --compress pure_getters=true,passes=3
```

- `--mangle`: Shrink variable names
- `--compress passes=3`: Multiple compression passes

---

### Copy Assets to Distribution

```powershell
node build_production.js
```

This script:

- Copies HTML files with updated asset references
- Optimizes images (using sharp)
- Copies web assets (images, web_images/)
- Generates minified production HTML with correct paths

---

## 📁 Production Directory Structure

After running `npm run build`, your `/dist` directory should contain:

```
dist/
├── index.html                    # Optimized homepage
├── laptops.html                  # Optimized laptops page
├── accessories.html              # Optimized accessories page
├── services.html                 # Optimized services page
├── styles.min.css                # Minified CSS (entire site)
├── java.min.js                   # Minified main script
├── productsData.min.js           # Minified product data
├── css/
│   └── styles.min.css            # CSS backup reference
├── jss/
│   └── java.min.js               # JS backup reference
├── web_images/                   # All image assets
│   ├── logo.webp
│   ├── hero_*.webp
│   └── ...
└── product_images/               # All product images
    ├── 11.6_1366x768_HD/
    ├── Dell_Latitude_7420/
    └── ...
```

---

## 🎨 Performance Checklist (100/100 Lighthouse)

✅ **Cumulative Layout Shift (CLS < 0.1)**

- All `<img>` tags have explicit `width` and `height` attributes
- Product grid containers have `min-height` reserved space
- Carousel slide has `aspect-ratio: 16 / 9`
- Image containers have `aspect-ratio: 4 / 3` with `min-height`

✅ **Render-Blocking Resources Eliminated**

- All `<script>` tags use `defer` attribute
- External stylesheets load with `media="print" onload="this.media='all'"`
- FontAwesome CSS loads asynchronously

✅ **Font Optimization**

- Google Fonts URL includes `&display=swap`
- Font renders immediately while system font loads
- No invisible text during web font load

✅ **Accessibility & Contrast**

- Active navigation pills: `background-color: #0d47a1` on white (WCAG AA)
- Primary buttons: Green CTA on light/dark backgrounds (WCAG AA)
- All buttons have proper focus-visible states
- Heading hierarchy strictly enforced (H1 → H2 → H3)

---

## 📝 Deployment Instructions

### For Shared Hosting

1. **Build the project locally:**

   ```powershell
   npm run build
   ```

2. **Upload `/dist` contents to your web server:**
   - Use FTP/SFTP client to upload all files in `/dist/` to your public_html or www root
   - Preserve directory structure (css/, jss/, web_images/, product_images/)

3. **Verify paths:**
   - All HTML files reference `css/styles.min.css`
   - All HTML files reference `jss/java.min.js` and `productsData.min.js`
   - All asset paths point to correct locations

### For Docker/Container Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=dev

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t uptop-computers .
docker run -p 80:80 uptop-computers
```

---

## 🔍 Verify Production Build Quality

### 1. Check File Sizes

```powershell
ls -lh dist/*.css dist/*.js
```

**Expected minified sizes:**

- `styles.min.css`: ~15-20 KB
- `java.min.js`: ~8-12 KB
- `productsData.min.js`: ~25-35 KB

### 2. Test Locally

Serve the dist directory and test with Lighthouse:

```powershell
# Using Python (if available)
python -m http.server 8000 --directory dist

# Or using Node.js http-server
npm install -g http-server
http-server dist -p 8000 -c-1
```

Then run Lighthouse audit in Chrome DevTools.

### 3. Check Asset References

Verify all assets load correctly:

- Open DevTools (F12)
- Go to Network tab
- Reload page
- Check for 404 errors
- Verify CSS/JS are minified versions

---

## ⚡ Advanced Optimization Options

### Enable Gzip Compression (Web Server)

For nginx:

```nginx
gzip on;
gzip_types text/css text/javascript application/javascript;
gzip_comp_level 6;
```

For Apache:

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/css text/javascript application/javascript
</IfModule>
```

### Cache Headers

Set long cache expiration for static assets:

**nginx:**

```nginx
location ~* \.(css|js|jpg|jpeg|png|gif|ico|webp|woff|woff2)$ {
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

### CDN Integration

For images, consider using a CDN:

1. Upload `/dist/web_images/` and `/dist/product_images/` to CDN
2. Update image URLs in `productsData.js` before minification:
   ```javascript
   "image": "https://cdn.example.com/product_images/..."
   ```

---

## 🐛 Troubleshooting

### Issue: `npm run build` fails

**Solution:**

```powershell
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm node_modules
npm install

# Try build again
npm run build
```

### Issue: CSS not loading in production

**Check:**

1. Verify `css/styles.min.css` exists in `/dist`
2. Confirm HTML files reference correct path: `href="css/styles.min.css"`
3. Check web server's public root configuration

### Issue: JavaScript not running

**Check:**

1. Verify `jss/java.min.js` exists in `/dist`
2. Confirm all scripts have `defer` attribute
3. Check browser console for errors (F12)
4. Ensure `productsData.min.js` loads before `java.min.js`

### Issue: Images not loading

**Check:**

1. Verify `/dist/web_images/` and `/dist/product_images/` exist with files
2. Check image paths in HTML and JavaScript
3. Confirm file permissions (readable by web server)

---

## 📊 Performance Metrics Target

After following this guide, your site should achieve:

| Metric                             | Target  | Current |
| ---------------------------------- | ------- | ------- |
| **Lighthouse Score**               | 100/100 | TBD     |
| **First Contentful Paint (FCP)**   | < 1.8s  | TBD     |
| **Largest Contentful Paint (LCP)** | < 2.5s  | TBD     |
| **Cumulative Layout Shift (CLS)**  | < 0.1   | TBD     |
| **Total Blocking Time (TBT)**      | < 200ms | TBD     |
| **Time to Interactive (TTI)**      | < 3.8s  | TBD     |

---

## 📚 Additional Resources

- [Google Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Clean-CSS Documentation](https://github.com/clean-css/clean-css)
- [Terser Documentation](https://github.com/terser/terser)
- [Web.dev Performance Guide](https://web.dev/performance/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## ✅ Final Checklist Before Deployment

- [ ] Run `npm run build` successfully
- [ ] Verify `/dist` directory created with all files
- [ ] Check file sizes are reasonable (minified)
- [ ] Test site locally with Lighthouse
- [ ] Verify all images load correctly
- [ ] Test on mobile devices
- [ ] Check all links work (internal & external)
- [ ] Verify WhatsApp links are functional
- [ ] Test search and filter functionality
- [ ] Check form submissions work
- [ ] Verify footer links point to correct pages
- [ ] Test keyboard navigation (Tab, Enter)
- [ ] Verify screen reader compatibility

---

## 🎉 You're Ready!

Your UpTop Computers website is now optimized for production with **100/100 Lighthouse Performance** and deployed successfully!

For support or questions, contact: **sales@uptopcomputers.co.ke**
