document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productsGrid = document.getElementById("productsGrid") || document.querySelector(".featured-grid");
  const brandFilterEl = document.getElementById("brandFilter") || document.getElementById("brandSelect");
  const sortFilterEl = document.getElementById("sortFilter") || document.getElementById("sortSelect");

  if (!productsGrid) return;

  const isFeaturedHomePage = !!document.querySelector(".featured-grid") && !document.getElementById("productsGrid");
  const path = window.location.pathname;
  const isAccessoriesPage = path.includes("accessories");
  const isLaptopsPage = path.includes("laptops");

  const ACCESSORY_CATEGORIES = ["motherboard", "screen", "keyboard", "mouse", "charger", "bag"];
  const LAPTOP_PAGE_CATEGORIES = ["laptop", "desktop"];

  function normalizeCategory(value) {
    const cat = (value || "").toString().trim().toLowerCase();
    if (!cat) return "";
    if (cat === "laptops") return "laptop";
    if (cat === "desktops") return "desktop";
    return cat;
  }

  function getCategory(item) {
    return normalizeCategory(item.category || item.type || "");
  }

  function normalizePrice(value) {
    if (value === null || value === undefined) return "KES 0";
    const text = String(value).replace(/\s*\(approx\.?\)\s*/gi, "").trim();
    return text || "KES 0";
  }

  function getPriceNumber(value) {
    const match = String(value).match(/\d[\d,]*/);
    if (!match) return 0;
    return Number(match[0].replace(/,/g, ""));
  }

  function buildProductMessage(item) {
    const name = item.name || item.title || "Product";
    const price = normalizePrice(item.price || "KES 0");
    const specs = (item.specs || item.description || "N/A").replace(/\*/g, "").trim();
    const image = item.image || item.imageUrl || "";
    const link = image ? `${window.location.origin}/${image.replace(/^\//, "")}` : window.location.href;

    const message = [
      "Hello! 👋",
      "",
      "I'm interested in ordering this laptop from your website.",
      "",
      `Product: ${name}`,
      `Link: ${link}`,
      `Specs: ${specs}`,
      `Price: ${price}`,
      "",
      "Please confirm availability and payment/delivery details. Thank you!"
    ].join("\n");

    return `https://wa.me/254115369156?text=${encodeURIComponent(message)}`;
  }

  function getProducts() {
    return window.productsData || (typeof productsData !== "undefined" ? productsData : []);
  }

  function getPageProducts() {
    const products = getProducts();
    return isFeaturedHomePage ? products.slice(0, 8) : products;
  }

  function populateBrandOptions() {
    if (!brandFilterEl || !isLaptopsPage) return;

    const allowedBrandNames = ["HP", "Lenovo", "Dell"];
    const uniqueBrands = [...new Set(
      getProducts()
        .filter(item => LAPTOP_PAGE_CATEGORIES.includes(getCategory(item)))
        .map(item => String(item.brand || "").trim())
        .filter(Boolean)
        .filter(brand => allowedBrandNames.includes(brand))
    )];

    brandFilterEl.innerHTML = ['<option value="all">All Brands</option>']
      .concat(uniqueBrands.map(brand => `<option value="${brand.toLowerCase()}">${brand}</option>`))
      .join("");
  }

  function applyFiltersAndRender() {
    const products = getProducts();
    const selectedBrand = brandFilterEl ? (brandFilterEl.value || "all").toLowerCase() : "all";
    const selectedSort = sortFilterEl ? sortFilterEl.value : "featured";

    let filteredProducts = products.filter(item => {
      const cat = getCategory(item);
      if (!LAPTOP_PAGE_CATEGORIES.includes(cat)) return false;

      if (selectedBrand !== "all") {
        const brand = String(item.brand || "").toLowerCase();
        const title = String(item.name || item.title || "").toLowerCase();
        if (brand !== selectedBrand && !title.includes(selectedBrand)) {
          return false;
        }
      }

      return true;
    });

    if (selectedSort === "price-low-high") {
      filteredProducts = [...filteredProducts].sort((a, b) => getPriceNumber(a.price) - getPriceNumber(b.price));
    } else if (selectedSort === "price-high-low") {
      filteredProducts = [...filteredProducts].sort((a, b) => getPriceNumber(b.price) - getPriceNumber(a.price));
    }

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML = '<p class="no-products">No products match these filters right now — try clearing a filter or message us on WhatsApp for the full list.</p>';
      return;
    }

    productsGrid.innerHTML = filteredProducts
      .map(item => {
        const name = item.name || item.title || "";
        const desc = item.specs || item.description || "";
        const price = normalizePrice(item.price || "KES 0");
        const tagLabel = item.type || item.category || "Laptop";
        const image = item.image || item.imageUrl || "";
        const productUrl = buildProductMessage(item);

        return `
          <div class="product-card" data-category="${getCategory(item)}">
            <img src="${image}" alt="${name}" class="product-img" loading="lazy" />
            <div class="product-details">
              <span class="product-tag">${String(tagLabel).toUpperCase()}</span>
              <h3 class="product-title">${name}</h3>
              <p class="product-desc">${desc}</p>
              <div class="product-price">${price}</div>
              <a href="${productUrl}" target="_blank" rel="noopener noreferrer" class="buy-btn">Order via WhatsApp</a>
            </div>
          </div>
        `;
      })
      .join("");
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFiltersAndRender();
    });
  });

  if (brandFilterEl) {
    brandFilterEl.addEventListener("change", applyFiltersAndRender);
  }

  if (sortFilterEl) {
    sortFilterEl.addEventListener("change", applyFiltersAndRender);
  }

  populateBrandOptions();
  applyFiltersAndRender();
});
document.addEventListener('DOMContentLoaded', () => {
  const brandSelect = document.getElementById('brandFilter');
  const sortSelect = document.getElementById('sortFilter');
  const productGrid = document.querySelector('.products-grid') || document.querySelector('.grid') || document.getElementById('laptopsGrid');

  if (!brandSelect || typeof productsData === 'undefined') return;

  function applyFiltersAndRender() {
    const selectedBrand = brandSelect.value.toLowerCase();
    const selectedSort = sortSelect ? sortSelect.value : 'featured';

    // 1. Get base laptops
    const laptopProducts = productsData.filter(p => !p.category || p.category.toLowerCase() === 'laptops');

    // 2. Filter by Brand (checks brand field, title, and name)
    let filtered = laptopProducts.filter(product => {
      if (selectedBrand === 'all') return true;
      
      const productBrand = String(product.brand || '').toLowerCase();
      const productTitle = String(product.title || product.name || '').toLowerCase();

      return productBrand === selectedBrand || productTitle.includes(selectedBrand);
    });

    // 3. Sort by Price
    if (selectedSort === 'price-low-high') {
      filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (selectedSort === 'price-high-low') {
      filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    // 4. Render output to grid
    renderCards(filtered, productGrid);
  }

  // Parse formatted price string "KES 35,000" into raw integer 35000
  function parsePrice(val) {
    if (typeof val === 'number') return val;
    return Number(String(val || 0).replace(/[^0-9]/g, '')) || 0;
  }

  // Render cards function
  function renderCards(items, container) {
    if (!container) return;
    if (items.length === 0) {
      container.innerHTML = '<p class="no-products">No laptops found for this brand.</p>';
      return;
    }

    container.innerHTML = items.map(item => {
      const name = item.title || item.name || '';
      const desc = item.specs || item.description || '';
      const price = item.price || 'KES 0';
      const img = item.image || item.imageUrl || '';
      
      // WhatsApp order URL generator
      const waText = encodeURIComponent(`Hello! 👋\n\nI'm interested in ordering this laptop from your website.\n\nProduct: ${name}\nLink: ${window.location.href}\nSpecs: ${desc}\nPrice: ${price}\n\nPlease confirm availability and payment/delivery details. Thank you!`);
      const waLink = `https://wa.me/254115369156?text=${waText}`;

      return `
        <div class="product-card" data-category="laptops">
          <img src="${img}" alt="${name}" class="product-img" loading="lazy" />
          <div class="product-details">
            <span class="product-tag">${(item.type || 'LAPTOP').toUpperCase()}</span>
            <h3 class="product-title">${name}</h3>
            <p class="product-desc">${desc}</p>
            <div class="product-price">${price}</div>
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="buy-btn">Order via WhatsApp</a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Attach event listeners
  brandSelect.addEventListener('change', applyFiltersAndRender);
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFiltersAndRender);
  }

  // Run initial render on load
  applyFiltersAndRender();
});