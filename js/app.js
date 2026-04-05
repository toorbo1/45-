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
  // В функции инициализации document.addEventListener('DOMContentLoaded', ...) 
// ЗАМЕНИТЕ if (typeof initChats === 'function') initChats(); на:

if (typeof initChats === 'function') {
  initChats();
  setupChatEventListeners();
}

// ДОБАВЬТЕ ЭТУ ФУНКЦИЮ:
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
  
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const sidebar = document.getElementById("chatsSidebar");
      const chatWindow = document.getElementById("chatWindow");
      if (sidebar && chatWindow) {
        sidebar.classList.remove("hidden-mobile");
        chatWindow.classList.remove("active-mobile");
      }
    });
  }
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
  
  // Настройка чата
  const sendChatMsgBtn = document.getElementById("sendChatMsgBtn");
  const chatMessageInput = document.getElementById("chatMessageInput");
  const backToListBtn = document.getElementById("backToListBtn");
  
  if (sendChatMsgBtn) {
    sendChatMsgBtn.addEventListener("click", function() {
      if (typeof sendChatMessage === 'function') sendChatMessage();
    });
  }
  
  if (chatMessageInput) {
    chatMessageInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter" && typeof sendChatMessage === 'function') sendChatMessage();
    });
  }
  
  if (backToListBtn) {
    backToListBtn.addEventListener("click", function() {
      const chatWindow = document.getElementById("chatWindow");
      if (chatWindow) chatWindow.classList.remove("active-mobile");
    });
  }
  
  // Кнопка оплаты
  const amountInput = document.getElementById("amountInput");
  const payBtn = document.getElementById("payBtnDynamic");
  
  if (amountInput && payBtn) {
    function updatePayButton() {
      let val = parseFloat(amountInput.value) || 0;
      let total = Math.round(val * 1.05);
      const span = payBtn.querySelector('span');
      if (span) span.innerText = ` Оплатить ${total} ₽`;
    }
    amountInput.addEventListener("input", updatePayButton);
    payBtn.addEventListener("click", function() {
      let val = parseFloat(amountInput.value) || 0;
      let total = Math.round(val * 1.05);
      alert(`✅ Демо-оплата ${total} ₽\n💰 Сумма к оплате: ${total} ₽`);
    });
    updatePayButton();
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

// ЕДИНАЯ ФУНКЦИЯ ПОКАЗА СТРАНИЦЫ
function showPage(pageId) {
  console.log('Showing page:', pageId);
  
  // Скрываем ВСЕ страницы
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => {
    page.classList.remove('active');
    page.style.display = 'none';
  });
  
  // Показываем нужную
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.style.display = 'block';
    targetPage.classList.add('active');
    console.log('Activated page:', pageId);
  } else {
    console.error('Page not found:', pageId);
  }
  
  // Управление нижними меню
  const mainBottomNav = document.getElementById('bottomNav');
  const profileBottomNav = document.querySelector('.profile-bottom-nav');
  
if (pageId === 'profile') {
  if (mainBottomNav) mainBottomNav.style.display = 'none';
  if (profileBottomNav) profileBottomNav.style.display = 'flex';
  if (typeof loadUserProductsInProfile === 'function') loadUserProductsInProfile();
  if (typeof updateProfileUI === 'function') updateProfileUI();
} else if (pageId === 'products-manage') {
  if (mainBottomNav) mainBottomNav.style.display = 'flex';
  if (profileBottomNav) profileBottomNav.style.display = 'none';
  if (typeof renderUserProductsList === 'function') renderUserProductsList();
} else {
  if (mainBottomNav) mainBottomNav.style.display = 'flex';
  if (profileBottomNav) profileBottomNav.style.display = 'none';
}
  // Обновляем активные кнопки
  updateActiveNavButtons(pageId);
  updateDesktopNavButtons(pageId);
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
  
// Нижнее меню для профиля (только на мобильных)
const profileBottomNav = document.querySelector('.profile-bottom-nav');
if (profileBottomNav) {
  // Скрываем поиск и Steam кнопки, оставляем только Продать и Профиль
  const profileNavBtns = profileBottomNav.querySelectorAll('.profile-nav-btn');
  profileNavBtns.forEach(btn => {
    const text = btn.querySelector('span')?.innerText || '';
    if (text === 'Поиск' || text === 'Steam') {
      btn.style.display = 'none';
    }
  });
  
  // Добавляем кнопку Добавить задание если нужно
  const sellBtn = Array.from(profileNavBtns).find(btn => btn.querySelector('span')?.innerText === 'Продать');
  if (sellBtn) {
    sellBtn.innerHTML = '<i class="fas fa-tasks"></i><span>Задания</span>';
  }
  
  const profileBtns = profileBottomNav.querySelectorAll('.profile-nav-btn');
  profileBtns.forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';
    if (onclick.includes(`'${pageId}'`)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
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
  
  const navBtns = bottomNav.querySelectorAll('.nav-btn:not(.plus-btn)');
  const activeBtn = bottomNav.querySelector('.nav-btn.active');
  if (activeBtn) moveWave(activeBtn);
  
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
    const activeBtn = bottomNav.querySelector('.nav-btn.active');
    if (activeBtn) moveWave(activeBtn);
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

function initProfileTabs() {
  const tabBtns = document.querySelectorAll('.profile-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      if (tab === 'active') loadActiveProducts();
      else if (tab === 'completed') loadCompletedProducts();
    });
  });
}

function loadActiveProducts() {
  const container = document.getElementById('profileProductsList');
  if (!container) return;
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const userProducts = products.filter(p => p.seller === window.currentUser);
  
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
    <div class="profile-product-item" onclick="window.openProductDetailById('${product.id}')">
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
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const userProducts = products.filter(p => p.seller === window.currentUser);
  
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
    <div class="profile-product-item" onclick="window.openProductDetailById('${product.id}')">
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
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const userProducts = products.filter(p => p.seller === window.currentUser);
  const count = userProducts.length;
  const productsCountEl = document.getElementById("profileProductsCount");
  if (productsCountEl) productsCountEl.innerText = count;
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
      container.innerHTML = "<div style='text-align:center;'>Нет товаров</div>";
    } else {
      container.innerHTML = filteredProducts.map(prod => `
        <div class="product-card" onclick="window.openProductDetailById('${prod.id}')">
          <div class="product-img-wrapper">
            ${prod.imageUrl ? `<img src="${escapeHtml(prod.imageUrl)}" alt="${escapeHtml(prod.title)}">` : `<i class="fas fa-tag"></i>`}
          </div>
          <div class="product-body">
            <div class="product-price">${escapeHtml(prod.price)}</div>
            <div class="product-title">${escapeHtml(prod.title)}</div>
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

// Вызывать при смене страницы
const originalShowPage = window.showPage;
window.showPage = function(pageId) {
  if (originalShowPage) originalShowPage(pageId);
  setTimeout(updateFooterVisibility, 50);
};

// Также при открытии/закрытии детальной страницы
function updateFooterOnDetail() {
  const footer = document.querySelector('.site-footer');
  const detailPage = document.getElementById('detailPage');
  if (footer && detailPage) {
    footer.style.display = detailPage.classList.contains('active') ? 'none' : 'block';
  }
}

// Добавить вызов в openProductDetailById и closeDetail
function showInfo(type) {
  const messages = {
    about: '📖 О нас\n\nПлейнексис — цифровой маркетплейс',
    privacy: '🔒 Политика конфиденциальности',
    info: 'ℹ️ Информация о проекте',
    discounts: '🏷️ Скидки и акции',
    interesting: '✨ Интересное'
  };
  alert(messages[type] || 'Информация');
}
// Добавьте функцию скролла для приложений
function scrollApps(direction) {
  const container = document.getElementById('appsScrollContainer');
  if (!container) return;
  const scrollAmount = 250;
  container.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
}

// В products.js - добавьте или замените функцию
function openKeywordPageByAppBlock(blockId) {
  const appBlocks = JSON.parse(localStorage.getItem("apex_app_blocks") || "[]");
  const block = appBlocks.find(b => b.id === blockId);
  
  if (!block) {
    console.error("Блок приложения не найден", blockId);
    return;
  }
  
  // Проверяем привязку к ключевому слову
  if (block.keywordId && block.keywordId !== "") {
    const keywords = JSON.parse(localStorage.getItem("apex_keywords") || "[]");
    const keyword = keywords.find(k => k.id === block.keywordId);
    if (keyword) {
      openKeywordPage(keyword.name);
      return;
    }
  }
  
  openKeywordPage(block.name);
}
window.openKeywordPageByAppBlock = openKeywordPageByAppBlock;

// Экспортируйте функции
window.scrollApps = scrollApps;
window.openKeywordPageByAppBlock = openKeywordPageByAppBlock;
// Экспорт
window.navigate = navigate;
window.goBack = goBack;
window.scrollGames = scrollGames;
window.showPage = showPage;
window.openKeywordPage = openKeywordPage;
window.openKeywordPageByBlock = openKeywordPageByBlock;
window.updateUserProductsCount = updateUserProductsCount;
window.loadUserProductsInProfile = loadUserProductsInProfile;
window.showInfo = showInfo;

setTimeout(function() {
  updateUserProductsCount();
  if (typeof initGamesScroll === 'function') initGamesScroll();
}, 100);

// Инициализация blob навигации
if (typeof initBlobNavigation === 'function') {
    initBlobNavigation();
}