document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productsGrid = document.getElementById("productsGrid") || document.querySelector(".featured-grid");
  if (!productsGrid) return;

  const isFeaturedHomePage = !!document.querySelector(".featured-grid") && !document.getElementById("productsGrid");
  const path = window.location.pathname;
  const isAccessoriesPage = path.includes("accessories");
  const isLaptopsPage = path.includes("laptops");

  // Categories that belong on the Accessories page filter chips
  // (Motherboard, Screen, Keyboard, Mouse & Pads, Charger, Laptop Bags).
  const ACCESSORY_CATEGORIES = ["motherboard", "screen", "keyboard", "mouse", "charger", "bag"];
  // Everything that is a full machine, shown on the Laptops & Desktops page.
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

  function renderProducts(categoryFilter = "all") {
    const products = window.productsData || (typeof productsData !== "undefined" ? productsData : []);
    const visibleProducts = isFeaturedHomePage ? products.slice(0, 8) : products;

    const filteredProducts = visibleProducts.filter(item => {
      const cat = getCategory(item);

      // Page-level scoping: accessories.html never shows laptops/desktops,
      // laptops.html never shows accessory parts.
      if (isAccessoriesPage && !ACCESSORY_CATEGORIES.includes(cat)) return false;
      if (isLaptopsPage && !LAPTOP_PAGE_CATEGORIES.includes(cat)) return false;

      if (categoryFilter === "all") return true;
      return cat === categoryFilter;
    });

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML = `<p class="no-products">No products match these filters right now \u2014 try clearing a filter or message us on WhatsApp for the full list.</p>`;
      return;
    }

    productsGrid.innerHTML = filteredProducts
      .map(item => {
        const name = item.name || item.title || "";
        const desc = item.specs || item.description || "";
        const price = (item.price || "").toString();
        const tagLabel = item.type || item.category || "Accessory";
        const image = item.image || item.imageUrl || "";

        return `
      <div class="product-card" data-category="${getCategory(item)}">
        <img src="${image}" alt="${name}" class="product-img" loading="lazy" />
        <div class="product-details">
          <span class="product-tag">${tagLabel.toString().toUpperCase()}</span>
          <h3 class="product-title">${name}</h3>
          <p class="product-desc">${desc}</p>
          <div class="product-price">${price}</div>
          <a href="https://wa.me/254115369156?text=Hello%20Uptop%20Computers,%20I%20want%20to%20buy%20${encodeURIComponent(name)}" target="_blank" rel="noopener noreferrer" class="buy-btn">Order via WhatsApp</a>
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
      const category = btn.getAttribute("data-category").toLowerCase();
      renderProducts(category);
    });
  });

  renderProducts("all");
});
