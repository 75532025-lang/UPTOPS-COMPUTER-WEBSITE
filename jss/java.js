/*
  Unified site script for Uptop Computers.
  productsData.js (loaded before this file) is the single source of truth
  for every product card on every page.
*/
(() => {
  const PHONE_NUMBER = '254115369156';
  const PHONE_DIGITS = PHONE_NUMBER.replace(/[^0-9]/g, '');
  const WA_URL = `https://wa.me/${PHONE_DIGITS}`;
  const DEFAULT_IMAGE = 'web_images/placeholder.webp';

  const SEARCH_TERMS = [
    'Chargers',
    'Keyboards',
    'Mouse',
    'Laptop bags',
    'Screens',
    'Custom PC build',
    'OS installation',
    'Screen repair',
    'Software setup',
    'WhatsApp support'
  ];

  function sanitizeForAttribute(value) {
    return String(value == null ? '' : value).replace(/[<>"'`]/g, '');
  }

  function parsePriceToNumber(priceText) {
    if (typeof priceText !== 'number') priceText = String(priceText || '');
    const digits = priceText.replace(/[^0-9]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  function normalizeProductText(value) {
    return String(value ?? '')
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
  }

  function getProductSpecs(product) {
    const specs = normalizeProductText(product.specs);
    return specs || 'Quality-tested computer product';
  }

  function getProductDescription(product) {
    const name = product.name || 'Product';
    const kind = (product.type || product.category || 'product').toLowerCase();
    const specs = getProductSpecs(product);
    const detail = specs === 'Quality-tested computer product' ? 'reliable performance and practical value' : specs;
    return `${name} is a ${kind} with ${detail}. Built for dependable daily use, smooth productivity, and practical value for homes, offices, and businesses in Kenya.`;
  }

  function buildWhatsAppUrl(product) {
    const parts = [`Hi Uptop Computers, I'd like to order: ${product.name}`];
    if (product.specs) parts.push(`Specs: ${getProductSpecs(product)}`);
    if (product.price) parts.push(`Listed price: ${product.price}`);
    const message = sanitizeForAttribute(parts.join(' | '));
    return `${WA_URL}?text=${encodeURIComponent(message)}`;
  }

  /* --------------------------------------------------------------------------
     Hero carousel
     -------------------------------------------------------------------------- */
  function initHomeCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = Array.from(document.querySelectorAll('.dot'));
    const container = document.getElementById('carousel');
    if (!track || !prevBtn || !nextBtn || !dots.length || !container) return;

    let current = 0;
    let interval = null;

    const update = (index) => {
      if (!dots.length) return;
      current = index < 0 ? dots.length - 1 : index >= dots.length ? 0 : index;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));
    };

    const stop = () => {
      if (interval) {
        window.clearInterval(interval);
        interval = null;
      }
    };

    const start = () => {
      stop();
      interval = window.setInterval(() => update(current + 1), 4000);
    };

    prevBtn.addEventListener('click', () => { update(current - 1); stop(); start(); });
    nextBtn.addEventListener('click', () => { update(current + 1); stop(); start(); });
    dots.forEach((dot, idx) => dot.addEventListener('click', () => { update(idx); stop(); start(); }));
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('touchstart', stop, { passive: true });
    container.addEventListener('touchend', start);
    update(0);
    start();
  }

  /* --------------------------------------------------------------------------
     Testimonial carousel
     -------------------------------------------------------------------------- */
  function initReviewCarousel() {
    const track = document.querySelector('.review-carousel-track');
    const cards = Array.from(document.querySelectorAll('.review-card'));
    const prevBtn = document.querySelector('.review-prev');
    const nextBtn = document.querySelector('.review-next');
    const dotsContainer = document.querySelector('.review-dots');
    if (!track || !cards.length || !prevBtn || !nextBtn || !dotsContainer) return;

    let current = 0;
    let interval = null;

    const renderDots = () => {
      dotsContainer.innerHTML = '';
      cards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `review-dot${idx === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Review ${idx + 1}`);
        dot.addEventListener('click', () => { goTo(idx); stop(); start(); });
        dotsContainer.appendChild(dot);
      });
    };

    const updateDots = () => {
      Array.from(document.querySelectorAll('.review-dot')).forEach((dot, idx) => dot.classList.toggle('active', idx === current));
    };

    const updateCards = () => {
      cards.forEach((card, idx) => card.classList.toggle('active', idx === current));
    };

    const applyTransform = () => {
      const target = cards[current];
      if (!target) return;
      track.style.transform = `translateX(-${Math.round(target.offsetLeft)}px)`;
    };

    const goTo = (index) => {
      current = index < 0 ? cards.length - 1 : index >= cards.length ? 0 : index;
      updateCards();
      updateDots();
      applyTransform();
    };

    const stop = () => {
      if (interval) {
        window.clearInterval(interval);
        interval = null;
      }
    };

    const start = () => {
      stop();
      interval = window.setInterval(() => goTo(current + 1), 4500);
    };

    prevBtn.addEventListener('click', () => { goTo(current - 1); stop(); start(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); stop(); start(); });
    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);
    track.addEventListener('touchstart', stop, { passive: true });
    track.addEventListener('touchend', start);
    renderDots();
    goTo(0);
    start();
    window.addEventListener('resize', applyTransform);
  }

  const SEARCH_ROUTES = {
    'chargers': 'accessories.html?cat=chargers',
    'keyboards': 'accessories.html?cat=keyboards',
    'mouse': 'accessories.html?cat=mouse',
    'laptop bags': 'accessories.html?cat=bags',
    'screens': 'accessories.html?cat=screens',
    'custom pc build': 'services.html#custom-pc',
    'os installation': 'services.html#os-install',
    'screen repair': 'services.html#screen-repair',
    'software setup': 'services.html#software',
    'whatsapp support': 'services.html#contact',
    'laptops': 'laptops.html'
  };

  function handleSearchRedirect(query) {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim().toLowerCase();

    if (SEARCH_ROUTES[cleanQuery]) {
      window.location.href = SEARCH_ROUTES[cleanQuery];
      return;
    }

    for (const [key, url] of Object.entries(SEARCH_ROUTES)) {
      if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
        window.location.href = url;
        return;
      }
    }

    window.location.href = `laptops.html?search=${encodeURIComponent(cleanQuery)}`;
  }

  /* --------------------------------------------------------------------------
     Search suggestions
     -------------------------------------------------------------------------- */
  function initSearchSuggestions() {
    if (window.location.pathname.includes('laptops.html')) return;

    const inputs = Array.from(document.querySelectorAll('.search-input'));
    inputs.forEach((input) => {
      let suggestions = input.parentElement.querySelector('.search-suggestions');
      if (!suggestions) {
        suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        suggestions.id = suggestions.id || 'searchSuggestions';
        input.insertAdjacentElement('afterend', suggestions);
      }

      const buildItem = (term) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'suggestion-item';
        button.textContent = term;

        button.addEventListener('click', () => {
          input.value = term;
          suggestions.classList.remove('show');
          handleSearchRedirect(term);
        });

        return button;
      };

      const update = (value) => {
        const query = String(value || '').toLowerCase().trim();
        const list = query 
          ? SEARCH_TERMS.filter((term) => term.toLowerCase().includes(query)) 
          : SEARCH_TERMS.slice(0, 5);

        suggestions.innerHTML = '';
        if (!list.length) {
          suggestions.classList.remove('show');
          return;
        }

        list.slice(0, 6).forEach((term) => suggestions.appendChild(buildItem(term)));
        suggestions.classList.add('show');
      };

      input.addEventListener('input', (event) => {
        update(event.target.value);
        window.__uptopFilterProducts?.(event.target.value);
      });

      input.addEventListener('focus', () => update(input.value));

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          suggestions.classList.remove('show');
          handleSearchRedirect(input.value);
        } else if (event.key === 'Escape') {
          suggestions.classList.remove('show');
          suggestions.innerHTML = '';
        }
      });

      document.addEventListener('click', (event) => {
        if (!suggestions.contains(event.target) && event.target !== input) {
          suggestions.classList.remove('show');
          suggestions.innerHTML = '';
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     Overlay, mobile menu, scroll-to-top
     -------------------------------------------------------------------------- */
  function initViewAllOverlay() {
    const button = document.querySelector('.view-all');
    const overlay = document.getElementById('viewAllOverlay');
    if (!button || !overlay) return;

    const closeOverlay = () => {
      overlay.classList.remove('open', 'active');
      button.setAttribute('aria-expanded', 'false');
    };

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = overlay.classList.toggle('open');
      overlay.classList.toggle('active', isOpen);
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
      if (!overlay.contains(event.target) && event.target !== button) closeOverlay();
    });
  }

  function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuBtn');
    if (!toggle) return;
    const navId = toggle.getAttribute('aria-controls');
    if (!navId) return;
    const nav = document.getElementById(navId);
    if (!nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('active'));
  }

  function initScrollToTop() {
    const button = document.getElementById('scrollTopBtn') || document.querySelector('.scroll-top-btn, .scroll-up-btn');
    if (!button) return;
    const update = () => button.classList.toggle('visible', window.scrollY > 300);
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
  }

  /* --------------------------------------------------------------------------
     Product catalogue module
     -------------------------------------------------------------------------- */
  function getPageCategory() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('accessories.html')) return 'accessory';
    return 'laptop';
  }

  function createProductCard(product) {
    const sanitizedSpecs = getProductSpecs(product);
    const descriptionText = getProductDescription(product);

    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.brand = (product.brand || '').toLowerCase();
    card.dataset.type = product.type || '';
    card.dataset.price = String(parsePriceToNumber(product.price));
    card.dataset.name = product.name || '';
    card.dataset.specs = sanitizedSpecs.toLowerCase();
    card.dataset.category = product.category || '';
    card.dataset.description = descriptionText;

    const imgWrap = document.createElement('div');
    imgWrap.className = 'img-container';
    const img = document.createElement('img');
    img.src = product.image || DEFAULT_IMAGE;
    img.alt = product.name || 'UpTop Computers product';
    img.loading = 'lazy';
    img.width = 400;
    img.height = 300;
    img.onerror = () => { img.onerror = null; img.src = DEFAULT_IMAGE; };
    imgWrap.appendChild(img);

    const details = document.createElement('div');
    details.className = 'card-details';

    const brandLabel = document.createElement('span');
    brandLabel.className = 'product-brand';
    brandLabel.textContent = product.type || product.brand || '';

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.name || 'Product';

    const specs = document.createElement('p');
    specs.className = 'product-specs';
    specs.textContent = sanitizedSpecs;

    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = descriptionText;

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = product.price || 'Contact for price';

    const orderLink = document.createElement('a');
    orderLink.className = 'whatsapp-btn';
    orderLink.href = buildWhatsAppUrl(product);
    orderLink.target = '_blank';
    orderLink.rel = 'noopener';
    orderLink.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Order';

    footer.append(price, orderLink);
    details.append(brandLabel, title, specs, description, footer);
    card.append(imgWrap, details);
    return card;
  }

  function renderNoResults(grid) {
    const msg = document.createElement('p');
    msg.className = 'no-results';
    msg.textContent = 'No products match these filters right now — try clearing a filter or message us on WhatsApp for the full list.';
    grid.appendChild(msg);
  }

  function populateBrandFilter(select, products) {
    if (!select) return;
    const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
    select.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Brands';
    select.appendChild(allOption);
    brands.forEach((brand) => {
      const option = document.createElement('option');
      option.value = brand.toLowerCase();
      option.textContent = brand;
      select.appendChild(option);
    });
  }

  function populateTypeChips(container, products) {
    if (!container) return;
    const types = Array.from(new Set(products.map((p) => p.type).filter(Boolean)));
    container.innerHTML = '';

    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.className = 'chip-btn active';
    allChip.dataset.filter = 'all';
    allChip.textContent = 'All';
    container.appendChild(allChip);

    types.forEach((type) => {
      const count = products.filter((p) => p.type === type).length;
      if (!count) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip-btn';
      chip.dataset.filter = type;
      chip.textContent = type;
      container.appendChild(chip);
    });
  }

  function initCatalog() {
    const grid = document.querySelector('#productsGrid, #productGrid, #product-grid, .products-grid, .product-grid');
    if (!grid || typeof productsData === 'undefined' || !Array.isArray(productsData)) return;
    if (grid.dataset.static === 'true') return;

    const pageCategory = getPageCategory();
    const products = productsData.filter((p) => p.category === pageCategory);

    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    products.forEach((product) => fragment.appendChild(createProductCard(product)));
    grid.appendChild(fragment);

    const brandFilter = document.getElementById('brandFilter');
    const typeChips = document.getElementById('typeChips') || document.querySelector('.chip-container');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.querySelector('.search-input');

    if (brandFilter) populateBrandFilter(brandFilter, products);
    if (typeChips) populateTypeChips(typeChips, products);

    let activeType = 'all';

    const applyFilters = () => {
      const brandValue = (brandFilter?.value || 'all').toLowerCase();
      const rawQuery = (searchInput?.value || '').toLowerCase().trim();
      const query = rawQuery.endsWith('s') ? rawQuery.slice(0, -1) : rawQuery;

      const cards = Array.from(grid.querySelectorAll('.product-card'));
      let visibleCount = 0;

      cards.forEach((card) => {
        const matchesBrand = brandValue === 'all' || card.dataset.brand === brandValue;
        const matchesType = activeType === 'all' || card.dataset.type === activeType;
        
        const cardName = card.dataset.name.toLowerCase();
        const cardSpecs = card.dataset.specs.toLowerCase();
        const cardType = card.dataset.type.toLowerCase();
        const cardBrand = card.dataset.brand.toLowerCase();
        const cardCat = card.dataset.category.toLowerCase();

        const matchesQuery = !query || 
          cardName.includes(query) || 
          cardSpecs.includes(query) || 
          cardType.includes(query) || 
          cardBrand.includes(query) || 
          cardCat.includes(query);

        const show = matchesBrand && matchesType && matchesQuery;
        card.style.display = show ? '' : 'none';
        if (show) visibleCount += 1;
      });

      const existingEmpty = grid.querySelector('.no-results');
      if (existingEmpty) existingEmpty.remove();
      if (visibleCount === 0) renderNoResults(grid);
    };

    brandFilter?.addEventListener('change', applyFilters);

    if (typeChips) {
      typeChips.addEventListener('click', (event) => {
        const chip = event.target.closest('.chip-btn');
        if (!chip) return;
        activeType = chip.dataset.filter || 'all';
        Array.from(typeChips.querySelectorAll('.chip-btn')).forEach((c) => c.classList.toggle('active', c === chip));
        applyFilters();
      });
    }

    sortSelect?.addEventListener('change', () => {
      const value = sortSelect.value;
      const cards = Array.from(grid.querySelectorAll('.product-card'));
      if (value === 'price-asc') {
        cards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
      } else if (value === 'price-desc') {
        cards.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
      } else {
        cards.sort((a, b) => products.findIndex((p) => p.name === a.dataset.name) - products.findIndex((p) => p.name === b.dataset.name));
      }
      cards.forEach((card) => grid.appendChild(card));
    });

    window.__uptopFilterProducts = (value) => {
      if (searchInput) searchInput.value = value;
      applyFilters();
    };

    applyFilters();
  }

  /* --------------------------------------------------------------------------
     Home page featured grid
     -------------------------------------------------------------------------- */
  function initFeaturedGrid() {
    const grid = document.querySelector('.featured-grid');
    if (!grid || typeof productsData === 'undefined' || !Array.isArray(productsData)) return;

    const laptops = productsData.filter((p) => p.category === 'laptop' && p.type === 'Laptop').slice(0, 4);
    const accessories = productsData.filter((p) => p.category === 'accessory').slice(0, 4);
    const featured = [...laptops, ...accessories];

    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    featured.forEach((product) => fragment.appendChild(createProductCard(product)));
    grid.appendChild(fragment);
  }

  function initSite() {
    initMobileMenu();
    initSearchSuggestions();
    initScrollToTop();
    initViewAllOverlay();
    initHomeCarousel();
    initReviewCarousel();
    initCatalog();
    initFeaturedGrid();
  }

  document.addEventListener('DOMContentLoaded', initSite);
})();
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('#productsGrid .product-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 1. Highlight Active Chip
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // 2. Filter Category Items
      const targetCategory = button.getAttribute('data-category').toLowerCase();

      productCards.forEach(card => {
        const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();

        if (targetCategory === 'all' || cardCategory === targetCategory) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});