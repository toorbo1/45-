// Основной файл инициализации приложения
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация всех модулей
  if (typeof initAuth === 'function') initAuth();
  if (typeof loadProducts === 'function') loadProducts();
  if (typeof initAdmin === 'function') initAdmin();
  
  // Инициализация навигации
  initNavigation();
  
  // Настройка поиска
  const globalSearchInput = document.getElementById('globalSearchInput');
  const mainSearchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  
  // Инициализация чатов
  if (typeof initChats === 'function') {
    initChats();
    setupChatEventListeners();
  }
  
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', function(e) {
      const term = e.target.value;
      if (mainSearchInput) {
        mainSearchInput.value = term;
        if (typeof filterProducts === 'function') filterProducts();
      }
      if (clearSearchBtn) {
        clearSearchBtn.style.display = term.length > 0 ? 'flex' : 'none';
      }
    });
    
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        globalSearchInput.focus();
        globalSearchInput.select();
      }
    });
  }
  
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', function() {
      if (globalSearchInput) {
        globalSearchInput.value = '';
        if (mainSearchInput) {
          mainSearchInput.value = '';
          if (typeof filterProducts === 'function') filterProducts();
        }
        clearSearchBtn.style.display = 'none';
      }
    });
  }
  
  // Модальное окно
  const modalOverlay = document.getElementById("modalOverlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function(e) {
      if (e.target === modalOverlay && typeof closeModal === 'function') {
        closeModal();
      }
    });
  }
  
  // Инициализация табов и товаров
  initProfileTabs();
  loadUserProductsInProfile();
  
  // Скролл слайдеров
  const wrapper = document.getElementById('heroSlidersWrapper');
  const leftBtn = document.getElementById('scrollLeftBtn');
  const rightBtn = document.getElementById('scrollRightBtn');
  
  if (wrapper && leftBtn && rightBtn) {
    leftBtn.addEventListener('click', function() {
      wrapper.scrollBy({ left: -300, behavior: 'smooth' });
    });
    rightBtn.addEventListener('click', function() {
      wrapper.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
  
  initDesktopNavigation();
  
  // Убеждаемся что активна главная страница
  showPage('home');
});

// В функции setupChatEventListeners, добавьте/обновите:
function setupChatEventListeners() {
  const sendBtn = document.getElementById("sendChatMsgBtn");
  const msgInput = document.getElementById("chatMessageInput");
  const searchInput = document.getElementById("chatSearchInput");
  const backBtn = document.getElementById("backToChatList");
  
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      if (typeof sendChatMessage === 'function') sendChatMessage();
    });
  }
  
  if (msgInput) {
    msgInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && typeof sendChatMessage === 'function') {
        sendChatMessage();
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      if (typeof renderDialogsList === 'function') {
        renderDialogsList(e.target.value);
      }
    });
  }
  
  // Обработчик кнопки "Назад" - теперь использует closeChatOnMobile
  if (backBtn) {
    const newBackBtn = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(newBackBtn, backBtn);
    
    newBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof closeChatOnMobile === 'function') {
        closeChatOnMobile();
      }
    });
  }
}

// ============ ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ ============

// Навигация между страницами
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// Показать модальное окно с информацией
function showInfo(type) {
  const messages = {
    about: '📖 Плейнексис — маркетплейс цифровых товаров и подписок',
    privacy: '🔒 Мы не передаём ваши данные третьим лицам',
    info: 'ℹ️ Версия 1.0. Работает на Supabase + Render',
    discounts: '🏷️ Следите за акциями в нашем Telegram-канале',
    interesting: '✨ Скоро добавим новые категории товаров!'
  };
  alert(messages[type] || 'Информация');
}

// Переход по навигации
function navigate(pageId) {
  showPage(pageId);
}

// Показать детали товара
function showProductDetail(productId) {
  const product = window.allProducts?.find(p => p.id === productId);
  if (!product) return;
  
  const detailContent = document.getElementById('detailContent');
  if (detailContent) {
    detailContent.innerHTML = `
      <h3>${escapeHtml(product.title)}</h3>
      <img src="${product.image_url || 'https://via.placeholder.com/300'}" style="max-width:100%">
      <p><strong>Цена:</strong> ${product.price}</p>
      <p><strong>Продавец:</strong> ${product.seller}</p>
      <p><strong>Описание:</strong> ${product.description || 'Нет описания'}</p>
      <button onclick="buyProduct('${product.id}')" class="btn-glow">Купить</button>
    `;
  }
  
  document.getElementById('detailPage').classList.add('active');
}

// Закрыть детали
window.closeDetail = function() {
  document.getElementById('detailPage').classList.remove('active');
};

// Купить товар
async function buyProduct(productId) {
  if (!window.currentUser) {
    alert('Войдите в аккаунт для покупки');
    return;
  }
  alert('Функция покупки в разработке');
}

// Глобальные функции
window.showInfo = showInfo;
window.navigate = navigate;
window.showProductDetail = showProductDetail;
window.buyProduct = buyProduct;
window.createNewProduct = window.createNewProduct || function() {};
window.deleteProduct = window.deleteProduct || function() {};

console.log('✅ App.js загружен');

function updateActiveNavButtons(pageId) {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    if (btn.getAttribute('data-nav') === pageId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateDesktopNavButtons(pageId) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-nav') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Показывать футер на всех страницах, кроме детальной
function updateFooterVisibility() {
  const footer = document.querySelector('.site-footer');
  const detailPage = document.getElementById('detailPage');
  
  if (footer) {
    if (detailPage && detailPage.classList.contains('active')) {
      footer.style.display = 'none';
    } else {
      footer.style.display = 'block';
    }
  }
}

function moveWave(btn) {
  const bottomNav = document.getElementById('bottomNav');
  const wave = bottomNav?.querySelector('.wave');
  if (!bottomNav || !wave || !btn) return;
  
  const btnRect = btn.getBoundingClientRect();
  const navRect = bottomNav.getBoundingClientRect();
  wave.style.width = btnRect.width + 'px';
  wave.style.left = (btnRect.left - navRect.left) + 'px';
}

function initNavigation() {
  const bottomNav = document.getElementById('bottomNav');
  if (!bottomNav) return;
  
  const navBtns = bottomNav.querySelectorAll('.nav-item:not(.plus-btn)');
  const activeBtn = bottomNav.querySelector('.nav-item.active');
  if (activeBtn && typeof moveWave === 'function') moveWave(activeBtn);
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pageId = btn.getAttribute('data-nav');
      if (pageId) {
        showPage(pageId);
      }
    });
  });
  
  window.addEventListener('resize', () => {
    const activeBtn = bottomNav.querySelector('.nav-item.active');
    if (activeBtn && typeof moveWave === 'function') moveWave(activeBtn);
  });
}

function initDesktopNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-nav');
      if (pageId) showPage(pageId);
    });
  });
}

// Глобальная навигация
function navigate(pageId) {
  showPage(pageId);
}

function goBack() {
  showPage('home');
}

function scrollGames(direction) {
  const container = document.getElementById('gamesScrollContainer');
  if (!container) return;
  const scrollAmount = 250;
  container.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
}

function scrollApps(direction) {
  const container = document.getElementById('appsScrollContainer');
  if (!container) return;
  const scrollAmount = 250;
  container.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
}

function initProfileTabs() {
  const tabBtns = document.querySelectorAll('.profile-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      if (tab === 'active') {
        if (typeof loadActiveProducts === 'function') loadActiveProducts();
      } else if (tab === 'completed') {
        if (typeof loadCompletedProducts === 'function') loadCompletedProducts();
      }
    });
  });
}

function loadActiveProducts() {
  const container = document.getElementById('profileProductsList');
  if (!container) return;
  const currentUser = localStorage.getItem('apex_user') || 'Гость';
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const userProducts = products.filter(p => p.seller === currentUser);
  
  if (userProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-products">
        <i class="fas fa-box-open"></i>
        <p>Нет активных товаров</p>
        <button class="btn-glow sell-btn" onclick="window.openModal()">Выставить товар</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userProducts.map(product => `
    <div class="profile-product-item" onclick="window.openProductDetailById('${product.id}')" style="cursor: pointer; position: relative;">
      <img class="profile-product-img" src="${escapeHtml(product.imageUrl || 'https://picsum.photos/id/42/50/50')}" alt="${escapeHtml(product.title)}">
      <div class="profile-product-info">
        <div class="profile-product-title">${escapeHtml(product.title)}</div>
        <div class="profile-product-price">${escapeHtml(product.price)}</div>
        <div class="profile-product-status status-active">● Активен</div>
      </div>
    </div>
  `).join('');
}

function loadCompletedProducts() {
  const container = document.getElementById('profileProductsList');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-products">
      <i class="fas fa-check-circle"></i>
      <p>Нет завершенных товаров</p>
    </div>
  `;
}

function loadUserProductsInProfile() {
  const container = document.getElementById('profileProductsList');
  if (!container) return;
  const currentUser = localStorage.getItem('apex_user') || 'Гость';
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const userProducts = products.filter(p => p.seller === currentUser);
  
  // Обновляем счетчик товаров
  if (window.userProfile) {
    window.userProfile.productsCount = userProducts.length;
    localStorage.setItem("apex_profile", JSON.stringify(window.userProfile));
    if (typeof updateNewProfileStats === 'function') updateNewProfileStats(window.userProfile);
  }
  
  if (userProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-products">
        <i class="fas fa-box-open"></i>
        <p>Нет товаров</p>
        <button class="btn-glow sell-btn" onclick="window.openModal()">Выставить товар</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userProducts.map(product => `
    <div class="profile-product-item" style="position: relative; cursor: pointer;" onclick="window.openProductDetailById('${product.id}')">
      <img class="profile-product-img" src="${escapeHtml(product.imageUrl || 'https://picsum.photos/id/42/50/50')}" alt="${escapeHtml(product.title)}">
      <div class="profile-product-info">
        <div class="profile-product-title">${escapeHtml(product.title)}</div>
        <div class="profile-product-price">${escapeHtml(product.price)}</div>
        <div class="profile-product-status status-active">● Активен</div>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function updateUserProductsCount() {
  const currentUser = localStorage.getItem('apex_user') || 'Гость';
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const userProducts = products.filter(p => p.seller === currentUser);
  const count = userProducts.length;
  const productsCountEl = document.getElementById("profileProductsCount");
  if (productsCountEl) productsCountEl.innerText = count;
  if (window.userProfile) {
    window.userProfile.productsCount = count;
    localStorage.setItem("apex_profile", JSON.stringify(window.userProfile));
  }
}

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
      container.innerHTML = "<div class='empty-state'><i class='fas fa-box-open'></i><p>Нет товаров по этой категории</p></div>";
    } else {
      container.innerHTML = filteredProducts.map(prod => `
        <div class="product-card" onclick="window.openProductDetailById('${prod.id}')">
          <div class="card-image">
            <img src="${escapeHtml(prod.imageUrl || 'https://picsum.photos/id/42/400/300')}" alt="${escapeHtml(prod.title)}" loading="lazy" onerror="this.src='https://picsum.photos/id/42/400/300'">
          </div>
          <div class="card-body">
            <div class="price-wrapper">
              <span class="current-price">${escapeHtml(prod.price)}</span>
            </div>
            <h3 class="product-title">${escapeHtml(prod.title)}</h3>
          </div>
        </div>
      `).join('');
    }
  }
  showPage("keywordPage");
}

function openKeywordPageByBlock(blockId) {
  const gameBlocks = JSON.parse(localStorage.getItem("apex_game_blocks") || "[]");
  const block = gameBlocks.find(b => b.id === blockId);
  if (block) openKeywordPage(block.name);
}

function openKeywordPageByAppBlock(blockId) {
  const appBlocks = JSON.parse(localStorage.getItem("apex_app_blocks") || "[]");
  const block = appBlocks.find(b => b.id === blockId);
  if (block) openKeywordPage(block.name);
}

function showInfo(type) {
  const messages = {
    about: '📖 О нас\n\nПлейнексис — цифровой маркетплейс для покупки и продажи подписок, цифровых товаров и услуг. Мы гарантируем безопасность каждой сделки и мгновенную выдачу товаров.',
    privacy: '🔒 Политика конфиденциальности\n\nМы не передаём ваши данные третьим лицам. Все платежи защищены.',
    info: 'ℹ️ Информация о проекте\n\nВерсия: 2.0\nРазработчик: Плейнексис Team',
    discounts: '🏷️ Скидки и акции\n\nПодпишитесь на наш Telegram, чтобы первыми узнавать о скидках!',
    interesting: '✨ Интересное\n\nСкоро: программа лояльности, кешбэк и реферальная система!',
    contacts: '📞 Контакты\n\nПоддержка: @pleinexis_support\nEmail: support@pleinexis.ru'
  };
  alert(messages[type] || 'Информация');
}

// Экспорт
window.navigate = navigate;
window.goBack = goBack;
window.scrollGames = scrollGames;
window.scrollApps = scrollApps;
window.showPage = showPage;
window.openKeywordPage = openKeywordPage;
window.openKeywordPageByBlock = openKeywordPageByBlock;
window.openKeywordPageByAppBlock = openKeywordPageByAppBlock;
window.updateUserProductsCount = updateUserProductsCount;
window.loadUserProductsInProfile = loadUserProductsInProfile;
window.loadActiveProducts = loadActiveProducts;
window.loadCompletedProducts = loadCompletedProducts;
window.showInfo = showInfo;

setTimeout(function() {
  updateUserProductsCount();
}, 100);