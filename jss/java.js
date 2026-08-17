document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productsGrid = document.getElementById("productsGrid") || document.querySelector(".featured-grid");
  const brandFilterEl = document.getElementById("brandFilter");
  const sortSelectEl = document.getElementById("sortSelect");

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

    const brands = [...new Set(
      getProducts()
        .filter(item => LAPTOP_PAGE_CATEGORIES.includes(getCategory(item)))
        .map(item => String(item.brand || "").trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    brandFilterEl.innerHTML = ['<option value="all">All Brands</option>']
      .concat(brands.map(brand => `<option value="${brand}">${brand}</option>`))
      .join("");
  }

  function applyFiltersAndRender() {
    const products = getPageProducts();
    const brand = brandFilterEl ? brandFilterEl.value : "all";
    const sort = sortSelectEl ? sortSelectEl.value : "featured";

    let filteredProducts = products.filter(item => {
      const cat = getCategory(item);

      if (isAccessoriesPage && !ACCESSORY_CATEGORIES.includes(cat)) return false;
      if (isLaptopsPage && !LAPTOP_PAGE_CATEGORIES.includes(cat)) return false;

      if (brand !== "all" && String(item.brand || "").toLowerCase() !== brand.toLowerCase()) return false;

      return true;
    });

    if (sort === "price-asc") {
      filteredProducts = [...filteredProducts].sort((a, b) => getPriceNumber(a.price) - getPriceNumber(b.price));
    } else if (sort === "price-desc") {
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
        const tagLabel = item.type || item.category || "Accessory";
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
      const category = btn.getAttribute("data-category");
      const categoryButtons = document.querySelectorAll(".filter-btn");
      categoryButtons.forEach(item => item.classList.toggle("active", item === btn));

      if (!isAccessoriesPage && !isLaptopsPage) {
        applyFiltersAndRender();
        return;
      }

      if (brandFilterEl && isLaptopsPage) {
        brandFilterEl.value = "all";
      }

      const currentCategory = category ? category.toLowerCase() : "all";
      const categoryState = currentCategory === "all" ? "all" : currentCategory;

      if (!categoryState || categoryState === "all") {
        applyFiltersAndRender();
        return;
      }

      const pageProducts = getPageProducts();
      let displayed = pageProducts.filter(item => {
        const cat = getCategory(item);
        return cat === categoryState;
      });

      if (brandFilterEl && brandFilterEl.value !== "all") {
        displayed = displayed.filter(item => String(item.brand || "").toLowerCase() === brandFilterEl.value.toLowerCase());
      }

      const sort = sortSelectEl ? sortSelectEl.value : "featured";
      if (sort === "price-asc") displayed = [...displayed].sort((a, b) => getPriceNumber(a.price) - getPriceNumber(b.price));
      if (sort === "price-desc") displayed = [...displayed].sort((a, b) => getPriceNumber(b.price) - getPriceNumber(a.price));

      productsGrid.innerHTML = displayed.length
        ? displayed.map(item => {
            const name = item.name || item.title || "";
            const desc = item.specs || item.description || "";
            const price = normalizePrice(item.price || "KES 0");
            const image = item.image || item.imageUrl || "";
            return `
              <div class="product-card" data-category="${getCategory(item)}">
                <img src="${image}" alt="${name}" class="product-img" loading="lazy" />
                <div class="product-details">
                  <span class="product-tag">${String(item.type || item.category || "ACCESSORY").toUpperCase()}</span>
                  <h3 class="product-title">${name}</h3>
                  <p class="product-desc">${desc}</p>
                  <div class="product-price">${price}</div>
                  <a href="${buildProductMessage(item)}" target="_blank" rel="noopener noreferrer" class="buy-btn">Order via WhatsApp</a>
                </div>
              </div>
            `;
          }).join("")
        : '<p class="no-products">No products match these filters right now — try clearing a filter or message us on WhatsApp for the full list.</p>';
    });
  });

  if (brandFilterEl) {
    brandFilterEl.addEventListener("change", applyFiltersAndRender);
  }

  if (sortSelectEl) {
    sortSelectEl.addEventListener("change", applyFiltersAndRender);
  }

  populateBrandOptions();
  applyFiltersAndRender();
});
