// Управление товарами
let productsArray = [];

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function filterProducts() {
  const term = document.getElementById('searchInput')?.value.toLowerCase() || '';
  let filtered = productsArray.filter(p => 
    p.title.toLowerCase().includes(term) || 
    (p.keyword && p.keyword.toLowerCase().includes(term)) ||
    (p.type && p.type.toLowerCase().includes(term))
  );
  renderProductGrid(filtered);
}

// Функция для получения рейтинга продавца
function getProductRating(product) {
  // Используем рейтинг из товара или генерируем
  let rating = product.rating || 4.5;
  if (typeof rating === 'string') rating = parseFloat(rating);
  if (isNaN(rating)) rating = 4.5;
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let starsHtml = '';
  
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '★';
  }
  if (hasHalfStar) {
    starsHtml += '½';
  }
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '☆';
  }
  
  // Количество отзывов
  let reviewsCount = product.sales || product.reviewsCount;
  if (!reviewsCount || reviewsCount === 0) {
    reviewsCount = Math.floor(Math.random() * 500) + 10;
  }
  
  return {
    starsHtml: starsHtml,
    rating: rating.toFixed(1),
    reviewsCount: reviewsCount
  };
}

// Функция форматирования цены со скидкой
function formatPriceWithDiscount(product) {
  // Если есть скидка и оригинальная цена
  if (product.discount && product.originalPrice) {
    let discountText = product.discount;
    // Добавляем % если нет
    if (discountText && !discountText.includes('%') && !isNaN(parseFloat(discountText))) {
      discountText = discountText + '%';
    }
    return {
      hasDiscount: true,
      currentPrice: product.price,
      oldPrice: product.originalPrice,
      discountText: discountText
    };
  }
  
  // Проверяем, есть ли скидка в текстовом виде
  if (product.discount && typeof product.discount === 'string') {
    let discountText = product.discount;
    if (!discountText.includes('%') && !isNaN(parseFloat(discountText))) {
      discountText = discountText + '%';
    }
    return {
      hasDiscount: true,
      currentPrice: product.price,
      oldPrice: product.originalPrice || product.price,
      discountText: discountText
    };
  }
  
  return {
    hasDiscount: false,
    currentPrice: product.price,
    oldPrice: null,
    discountText: null
  };
}
// ========== УЛУЧШЕНИЕ МОБИЛЬНЫХ КАРТОЧЕК ==========
(function() {
  function optimizeMobileCards() {
    if (window.innerWidth > 600) return;
    
    // Находим все контейнеры с изображениями
    const wrappers = document.querySelectorAll('.product-img-wrapper');
    
    wrappers.forEach(wrapper => {
      // Удаляем лишние padding которые могут вызывать обрезку
      wrapper.style.padding = '0';
      
      // Находим изображение внутри
      const img = wrapper.querySelector('img');
      if (img) {
        // Убеждаемся что изображение не обрезается
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        
        // Если изображение еще не загружено, ждем
        if (!img.complete) {
          img.onload = function() {
            img.style.opacity = '1';
          };
        }
      }
    });
  }
  
  // Запускаем при загрузке
  document.addEventListener('DOMContentLoaded', optimizeMobileCards);
  
  // Запускаем при изменении размера окна
  window.addEventListener('resize', function() {
    setTimeout(optimizeMobileCards, 100);
  });
  
  // Запускаем при динамической загрузке товаров
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          setTimeout(optimizeMobileCards, 50);
        }
      });
    });
    
    const container = document.getElementById('productsGrid');
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }
  }
})();

// Дополнительная функция для обновления карточек при загрузке изображений
function fixProductImages() {
  const images = document.querySelectorAll('.product-img-wrapper img');
  images.forEach(img => {
    if (!img.complete) {
      img.onload = function() {
        const wrapper = this.closest('.product-img-wrapper');
        if (wrapper) {
          wrapper.style.minHeight = 'auto';
        }
      };
    }
  });
}

// Вызываем после каждой загрузки товаров
if (typeof filterProducts === 'function') {
  const originalFilter = filterProducts;
  window.filterProducts = function() {
    originalFilter.apply(this, arguments);
    setTimeout(fixProductImages, 100);
  };
}
// ОСНОВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ТОВАРОВ
function renderProductGrid(products) {
  const container = document.getElementById("productsGrid");
  if (!container) return;
  if (products.length === 0) {
    container.innerHTML = "<div class='card-modern' style='text-align:center;'>Ничего не найдено</div>";
    updateProductCount(0);
    return;
  }
  let html = "";
  products.forEach(prod => {
    const priceInfo = formatPriceWithDiscount(prod);
    const ratingInfo = getProductRating(prod);
    
    // Форматируем текст скидки
    let discountText = priceInfo.discountText || "";
    
    html += `<div class="product-card" onclick="window.openProductDetailById('${prod.id}')">
      <div class="product-img-wrapper">
        ${priceInfo.hasDiscount ? `<span class="discount-badge-img">- ${discountText}</span>` : ''}
        ${prod.imageUrl ? `<img src="${escapeHtml(prod.imageUrl)}" alt="${escapeHtml(prod.title)}" loading="lazy">` : `<i class="fas fa-tag"></i>`}
      </div>
      <div class="product-body">
        <div class="product-price-wrapper">
          <span class="product-price">${escapeHtml(priceInfo.currentPrice)}</span>
          ${priceInfo.hasDiscount ? `<span class="product-old-price">${escapeHtml(priceInfo.oldPrice)}</span>` : ''}
        </div>
        <div class="product-title">${escapeHtml(prod.title)}</div>
        <div class="product-rating">
          <span class="product-stars">${ratingInfo.starsHtml}</span>
          <span class="product-reviews-count">${ratingInfo.reviewsCount} отзывов</span>
        </div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
  updateProductCount(products.length);
}

// ОБНОВЛЕННАЯ ФУНКЦИЯ ДЛЯ СТРАНИЦЫ КЛЮЧЕВОГО СЛОВА
function openKeywordPage(keyword) {
  const products = JSON.parse(localStorage.getItem("apex_products") || "[]");
  const filteredProducts = products.filter(p => 
    p.keyword && p.keyword.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const container = document.getElementById("keywordProductsGrid");
  const title = document.getElementById("keywordPageTitle");
  
  if (title) title.innerText = keyword;
  
  if (container) {
    if (filteredProducts.length === 0) {
      container.innerHTML = "<div class='card-modern' style='text-align:center;'>Нет товаров по этой категории</div>";
    } else {
      container.innerHTML = filteredProducts.map(prod => {
        const priceInfo = formatPriceWithDiscount(prod);
        const ratingInfo = getProductRating(prod);
        
        let discountText = priceInfo.discountText || "";
        
        return `
        <div class="product-card" onclick="window.openProductDetailById('${prod.id}')">
          <div class="product-img-wrapper">
            ${priceInfo.hasDiscount ? `<span class="discount-badge-img">🔥 ${discountText}</span>` : ''}
            ${prod.imageUrl ? `<img src="${escapeHtml(prod.imageUrl)}" alt="${escapeHtml(prod.title)}" loading="lazy">` : `<i class="fas fa-tag"></i>`}
          </div>
          <div class="product-body">
            <div class="product-price-wrapper">
              <span class="product-price">${escapeHtml(priceInfo.currentPrice)}</span>
              ${priceInfo.hasDiscount ? `<span class="product-old-price">${escapeHtml(priceInfo.oldPrice)}</span>` : ''}
            </div>
            <div class="product-title">${escapeHtml(prod.title)}</div>
            <div class="product-rating">
              <span class="product-stars">${ratingInfo.starsHtml}</span>
              <span class="product-reviews-count">${ratingInfo.reviewsCount} отзывов</span>
            </div>
          </div>
        </div>
      `}).join('');
    }
  }
  
  navigate("keywordPage");
}

function updateProductCount(count) {
  const span = document.getElementById("productCountStat");
  if (span) span.innerText = count;
}

// Загрузка ключевых слов для выпадающего списка
function loadKeywordsForSelect() {
  const select = document.getElementById("productKeyword");
  if (!select) return;
  
  const stored = localStorage.getItem("apex_keywords");
  let keywords = [];
  if (stored) {
    keywords = JSON.parse(stored);
  } else {
    keywords = [
      { id: "1", name: "Discord", type: "Nitro" },
      { id: "2", name: "Discord", type: "Turbo" },
      { id: "3", name: "Steam", type: "Premium" },
      { id: "4", name: "Netflix", type: "4K" },
      { id: "5", name: "Spotify", type: "Premium" }
    ];
  }
  
  select.innerHTML = '<option value="">Выберите ключевое слово/категорию</option>';
  keywords.forEach(k => {
    select.innerHTML += `<option value="${escapeHtml(k.id)}">${escapeHtml(k.name)} - ${escapeHtml(k.type)}</option>`;
  });
}

function loadProducts() {
  const stored = localStorage.getItem("apex_products");
  if (stored) {
    productsArray = JSON.parse(stored);
    let needSave = false;
    productsArray.forEach(p => {
      if (!p.id) {
        p.id = crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random();
        needSave = true;
      }
    });
    if (needSave) localStorage.setItem("apex_products", JSON.stringify(productsArray));
  } else {
    productsArray = [
      { id: crypto.randomUUID?.() || '1', title: "Активная подписка | Турция", price: "0₺", seller: "Zubiko1337", rating: 5.0, sales: 24678, fullDesc: "Активный пользователь | Турция. Однократно актуальный бонус. Моментальная выдача. Гарантия качества.", positive: "98%", responseTime: "отвечает за 5 мин", imageUrl: "https://picsum.photos/id/104/400/200", keyword: "Discord", type: "Nitro" },
      { id: crypto.randomUUID?.() || '2', title: "1000 Wild Cores", price: "668 ₽", seller: "GameSeller", rating: 4.9, sales: 12500, fullDesc: "Мгновенная доставка на аккаунт. Моментальная выдача. Гарантия качества.", positive: "97%", responseTime: "отвечает за 2 мин", imageUrl: "https://picsum.photos/id/26/400/200", keyword: "Steam", type: "Premium" },
      { id: crypto.randomUUID?.() || '3', title: "Premium Access 30д", price: "450 ₽", seller: "ApexStore", rating: 5.0, sales: 8900, fullDesc: "Доступ ко всем функциям на 30 дней. Моментальная выдача. Гарантия качества.", positive: "99%", responseTime: "отвечает за 1 мин", imageUrl: "https://picsum.photos/id/0/400/200", keyword: "Spotify", type: "Premium" },
      { id: crypto.randomUUID?.() || '4', title: "CS2 Prime Account", price: "1200 ₽", seller: "TopAcc", rating: 4.8, sales: 3400, fullDesc: "Готовый аккаунт с Prime статусом. Моментальная выдача. Гарантия качества.", positive: "95%", responseTime: "отвечает за 3 мин", imageUrl: "https://picsum.photos/id/155/400/200", keyword: "Steam", type: "Prime" }
    ];
    localStorage.setItem("apex_products", JSON.stringify(productsArray));
  }
  filterProducts();
}

function openProductDetailById(productId) {
  const p = productsArray.find(prod => prod.id === productId);
  if (!p) {
    console.error("Товар не найден", productId);
    alert("Товар не найден");
    return;
  }
  
  const detailContainer = document.getElementById("detailContent");
  if (!detailContainer) return;

  const kppNumber = Math.floor(10000 + Math.random() * 90000);
  
  const reviewsHtml = `
    <div class="reviews-list">
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">Максим</span>
          <span class="review-stars">★★★★★</span>
          <span class="review-date">15.03.2026</span>
        </div>
        <div class="review-text">Отличный продавец! Всё пришло мгновенно. Рекомендую!</div>
      </div>
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">Алексей</span>
          <span class="review-stars">★★★★★</span>
          <span class="review-date">10.03.2026</span>
        </div>
        <div class="review-text">Быстро, качественно, на связи 24/7. Спасибо!</div>
      </div>
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">Дмитрий</span>
          <span class="review-stars">★★★★★</span>
          <span class="review-date">05.03.2026</span>
        </div>
        <div class="review-text">Лучший магазин. Уже не первый раз беру.</div>
      </div>
    </div>
  `;

  detailContainer.innerHTML = `
    <div class="detail-top-row">
      <div class="detail-image-col">
        <img class="product-detail-image" src="${escapeHtml(p.imageUrl || 'https://picsum.photos/id/20/400/200')}" alt="товар" onerror="this.src='https://picsum.photos/id/20/400/200'">
      </div>
      <div class="detail-info-col">
        <div class="active-badge">
          <span class="active-dot"></span> Активный товар
        </div>
        <div class="product-detail-name">${escapeHtml(p.title)}</div>
        <div class="product-detail-price">${escapeHtml(p.price)}</div>
        <div class="detail-buttons-row">
          <button class="buy-button-inline" id="buyProductNowBtn">
            <i class="fas fa-shopping-cart"></i> Купить
          </button>
          <button class="chat-button-inline" id="chatWithSellerBtn">
            <i class="fab fa-telegram"></i> Написать продавцу
          </button>
        </div>
      </div>
    </div>

    <div class="kpp-block">
      <div class="kpp-number">${kppNumber}</div>
      <div class="kpp-desc">Моментальная выдача. Гарантия качества.</div>
    </div>

    <div class="seller-info-block">
      <div class="seller-name-large">${escapeHtml(p.seller)}</div>
      <div class="seller-rating">
        <span class="stars">★★★★★</span>
        <span class="rating-value">${p.rating}</span>
        <span class="reviews-count">${p.sales} отзывов</span>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-cell">
        <div class="stat-number">${p.sales.toLocaleString()}</div>
        <div class="stat-label">продаж</div>
      </div>
      <div class="stat-cell">
        <div class="stat-number">${p.positive || "98%"}</div>
        <div class="stat-label">положительных</div>
      </div>
      <div class="stat-cell">
        <div class="stat-number">${p.responseTime || "отвечает за 5 мин"}</div>
        <div class="stat-label"></div>
      </div>
    </div>

    <div class="guarantee-block">
      <div class="guarantee-title">
        <i class="fas fa-shield-alt"></i> Гарантия Покупателя
      </div>
      <div class="guarantee-items">
        <div class="guarantee-item"><i class="fas fa-check-circle"></i> Возврат средств, если вы не получили товар</div>
        <div class="guarantee-item"><i class="fas fa-check-circle"></i> Возврат средств, если товар не соответствует описанию</div>
        <div class="guarantee-item"><i class="fas fa-lock"></i> Безопасная оплата через защищенный шлюз</div>
        <div class="guarantee-item"><i class="fas fa-headset"></i> Круглосуточная поддержка</div>
        <div class="guarantee-item"><i class="fas fa-exchange-alt"></i> Обмен в течение 24 часов</div>
      </div>
    </div>

    <div class="tabs-container">
      <button class="tab-btn active" data-tab="about">О товаре</button>
      <button class="tab-btn" data-tab="reviews">Отзывы (3)</button>
    </div>
    
    <div class="tab-pane active" id="tab-about">
      <div class="seller-contact-text">
        <p>${escapeHtml(p.fullDesc)}</p>
        <p>Отвечаю быстро и всегда на связи. Если по каким-то причинам вы не можете самостоятельно активировать подписку — я помогу и всё сделаю за вас.</p>
      </div>
    </div>
    
    <div class="tab-pane" id="tab-reviews">
      ${reviewsHtml}
    </div>

    <div class="footer-links">
      <a href="#">Политика конфиденциальности</a>
      <a href="#">Пользовательское соглашение</a>
      <a href="#">Условия продажи</a>
      <a href="#">Контакты</a>
    </div>
  `;

  const tabBtns = detailContainer.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      detailContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });

  const buyBtn = document.getElementById('buyProductNowBtn');
  if (buyBtn) {
    buyBtn.onclick = () => {
      alert(`✅ Заказ оформлен!\nТовар: ${p.title}\nСумма: ${p.price}\nПродавец свяжется с вами в чате.`);
      closeDetail();
    };
  }

  const chatBtn = document.getElementById('chatWithSellerBtn');
  if (chatBtn) {
    chatBtn.onclick = () => {
      closeDetail();
      navigate('chat');
      setTimeout(() => {
        alert(`💬 Чат с продавцом ${p.seller} будет открыт`);
      }, 100);
    };
  }

  document.getElementById("detailPage").classList.add("active");
  document.body.style.overflow = "hidden";
}

function openProductDetail(index) {
  if (productsArray[index]) {
    openProductDetailById(productsArray[index].id);
  } else {
    console.error("Неверный индекс товара");
  }
}

function closeDetail() {
  document.getElementById("detailPage").classList.remove("active");
  document.body.style.overflow = "auto";
}

function createNewProduct() {
  const keywordSelect = document.getElementById("productKeyword");
  const keywordId = keywordSelect?.value;
  const productType = document.getElementById("productType")?.value.trim();
  const title = document.getElementById("productTitle")?.value.trim();
  const price = document.getElementById("productPrice")?.value.trim();
  const description = document.getElementById("productDescription")?.value.trim();
  const imageUrl = document.getElementById("productImageUrl")?.value.trim();
  
  if (!title) {
    alert("Введите название товара");
    return;
  }
  if (!price) {
    alert("Введите цену");
    return;
  }
  
  let keywordName = "";
  if (keywordId) {
    const stored = localStorage.getItem("apex_keywords");
    if (stored) {
      const keywords = JSON.parse(stored);
      const selected = keywords.find(k => k.id === keywordId);
      if (selected) {
        keywordName = selected.name;
      }
    }
  }
  
  const newId = crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random();
  const fullDescription = description || "Новый товар от пользователя";
  
  productsArray.unshift({ 
    id: newId,
    title: title, 
    price: price, 
    seller: window.currentUser || "User", 
    rating: 5.0, 
    sales: 0, 
    fullDesc: `${fullDescription} Моментальная выдача. Гарантия качества.`,
    positive: "100%",
    responseTime: "отвечает быстро",
    imageUrl: imageUrl || "https://picsum.photos/id/42/400/200",
    keyword: keywordName || "Без категории",
    type: productType || "Стандарт"
  });
  
  localStorage.setItem("apex_products", JSON.stringify(productsArray));
  filterProducts();
  closeModal();
  
  if (keywordSelect) keywordSelect.value = "";
  document.getElementById("productType").value = "";
  document.getElementById("productTitle").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productDescription").value = "";
  document.getElementById("productImageUrl").value = "";
  
  alert("✅ Товар успешно создан!");
}

function openModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) {
    modal.classList.add("active");
    loadKeywordsForSelect();
  }
}

function closeModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) modal.classList.remove("active");
}

function getUserProducts() {
  const userProducts = productsArray.filter(p => p.seller === window.currentUser);
  return userProducts;
}

function updateUserProductsCount() {
  const userProductsCount = getUserProducts().length;
  if (window.updateProfileStats) {
    window.updateProfileStats(userProductsCount, undefined, undefined);
  }
}

function searchByGame(gameName) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = gameName;
    filterProducts();
  }
  const productsHeader = document.querySelector('.products-header');
  if (productsHeader) {
    productsHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function scrollGames(direction) {
  const container = document.getElementById('gamesScrollContainer');
  if (!container) return;
  const scrollAmount = 250;
  if (direction === 'left') {
    container.scrollLeft -= scrollAmount;
  } else {
    container.scrollLeft += scrollAmount;
  }
}

function openKeywordPageByBlock(blockId) {
  const gameBlocks = JSON.parse(localStorage.getItem("apex_game_blocks") || "[]");
  const block = gameBlocks.find(b => b.id === blockId);
  if (!block) return;
  
  if (block.keywordId) {
    const keywords = JSON.parse(localStorage.getItem("apex_keywords") || "[]");
    const keyword = keywords.find(k => k.id === block.keywordId);
    if (keyword) {
      openKeywordPage(keyword.name);
      return;
    }
  }
  openKeywordPage(block.name);
}

function goBack() {
  navigate("home");
}

function initGlobalSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const mainSearchInput = document.getElementById('searchInput');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      if (mainSearchInput) {
        mainSearchInput.value = term;
        filterProducts();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(updateUserProductsCount, 100);
  initGlobalSearch();
});
// Фикс изображений на мобильных — принудительное применение contain
(function fixMobileImages() {
  function applyImageFix() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;
    
    const productImages = document.querySelectorAll('.product-img-wrapper img');
    productImages.forEach(img => {
      img.style.objectFit = 'contain';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.width = 'auto';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
    });
    
    const detailImages = document.querySelectorAll('.product-detail-image');
    detailImages.forEach(img => {
      img.style.objectFit = 'contain';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '280px';
      img.style.width = 'auto';
      img.style.height = 'auto';
    });
  }
  
  // Запускаем при загрузке
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyImageFix);
  } else {
    applyImageFix();
  }
  
  // Запускаем при изменении размера окна
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyImageFix, 150);
  });
  
  // Запускаем при динамической загрузке товаров
  const observer = new MutationObserver(function() {
    applyImageFix();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

// Экспортируем функции
window.openKeywordPageByBlock = openKeywordPageByBlock;
window.openKeywordPage = openKeywordPage;
window.goBack = goBack;
window.searchByGame = searchByGame;
window.scrollGames = scrollGames;
window.openProductDetailById = openProductDetailById;
window.openProductDetail = openProductDetail;
window.closeDetail = closeDetail;
window.createNewProduct = createNewProduct;
window.openModal = openModal;
window.closeModal = closeModal;
window.filterProducts = filterProducts;