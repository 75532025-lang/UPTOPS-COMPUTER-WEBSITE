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

  const state = {
    category: "all"
  };

  function normalizeText(value) {
    return String(value ?? "").trim();
  }

  function normalizeCategory(value) {
    const cat = normalizeText(value).toLowerCase();
    if (!cat) return "";
    if (cat === "laptops") return "laptop";
    if (cat === "desktops") return "desktop";
    return cat;
  }

  function getCategory(item) {
    return normalizeCategory(item?.category || item?.type || "");
  }

  function normalizePrice(value) {
    if (value === null || value === undefined) return "KES 0";
    const text = String(value).replace(/\s*\(approx\.?\)\s*/gi, "").trim();
    return text || "KES 0";
  }

  function getNumericPrice(value) {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;
    return Number(String(value).replace(/[^0-9]/g, "")) || 0;
  }

  function buildProductMessage(item) {
    const name = item.name || item.title || "Product";
    const price = normalizePrice(item.price || "KES 0");
    const specs = (item.specs || item.description || "N/A").replace(/\*/g, "").trim();
    const image = item.image || item.imageUrl || "";
    const link = image ? `${window.location.origin}/${image.replace(/^\//, "")}` : window.location.href;

    const message = [
      "Hello 👋",
      "",
      "I'm interested in ordering this product from your website.",
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
    return Array.isArray(window.productsData) ? window.productsData : (typeof productsData !== "undefined" ? productsData : []);
  }

  function getPageProducts() {
    const products = getProducts();
    return isFeaturedHomePage ? products.slice(0, 8) : products;
  }

  function matchesBrand(item, selectedBrand) {
    if (!selectedBrand || selectedBrand === "all") return true;

    const brandText = [item?.brand, item?.title, item?.name, item?.model]
      .filter(Boolean)
      .map(value => String(value).toLowerCase())
      .join(" ");

    return brandText.includes(selectedBrand.toLowerCase());
  }

  function populateBrandOptions() {
    if (!brandFilterEl || !isLaptopsPage) return;

    const brands = [...new Set(
      getProducts()
        .filter(item => LAPTOP_PAGE_CATEGORIES.includes(getCategory(item)))
        .map(item => normalizeText(item.brand || item.title || item.name || item.model))
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    brandFilterEl.innerHTML = ['<option value="all">All Brands</option>']
      .concat(brands.map(brand => `<option value="${brand.toLowerCase()}">${brand}</option>`))
      .join("");
  }

  function getFilteredSortedProducts() {
    const products = getPageProducts();
    const selectedBrand = normalizeText(brandFilterEl ? brandFilterEl.value : "all").toLowerCase();
    const selectedSort = sortSelectEl ? sortSelectEl.value : "featured";

    let filtered = products.filter(item => {
      const cat = getCategory(item);

      if (isAccessoriesPage) {
        if (!ACCESSORY_CATEGORIES.includes(cat)) return false;
        if (state.category !== "all" && cat !== state.category) return false;
      }

      if (isLaptopsPage && !LAPTOP_PAGE_CATEGORIES.includes(cat)) return false;
      if (!matchesBrand(item, selectedBrand)) return false;

      return true;
    });

    if (selectedSort === "price-low-high") {
      filtered = [...filtered].sort((a, b) => getNumericPrice(a.price) - getNumericPrice(b.price));
    } else if (selectedSort === "price-high-low") {
      filtered = [...filtered].sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price));
    }

    return filtered;
  }

  function renderProductCard(item) {
    const name = item.name || item.title || "";
    const desc = item.specs || item.description || "";
    const price = normalizePrice(item.price || "KES 0");
    const tagLabel = item.type || item.category || "Accessory";
    const image = item.image || item.imageUrl || "";

    return `
      <div class="product-card" data-category="${getCategory(item)}">
        <img src="${image}" alt="${name}" class="product-img" loading="lazy" />
        <div class="product-details">
          <span class="product-tag">${String(tagLabel).toUpperCase()}</span>
          <h3 class="product-title">${name}</h3>
          <p class="product-desc">${desc}</p>
          <div class="product-price">${price}</div>
          <a href="${buildProductMessage(item)}" target="_blank" rel="noopener noreferrer" class="buy-btn">Order via WhatsApp</a>
        </div>
      </div>
    `;
  }

  function applyFiltersAndRender() {
    const filteredProducts = getFilteredSortedProducts();

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML = '<p class="no-products">No products match these filters right now — try clearing a filter or message us on WhatsApp for the full list.</p>';
      return;
    }

    productsGrid.innerHTML = filteredProducts.map(renderProductCard).join("");
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const category = (btn.getAttribute("data-category") || "all").toLowerCase();
      state.category = category;

      if (brandFilterEl && isLaptopsPage) {
        brandFilterEl.value = "all";
      }

      applyFiltersAndRender();
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