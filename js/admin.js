// Админ панель
let keywords = [];
let gameBlocks = [];
let isAdmin = false;
let appBlocks = [];
const ADMIN_PASSWORD = "admin123";

// Обновите функцию initAdmin, добавив вызов loadAppBlocks()
function initAdmin() {
  loadKeywords();
  loadGameBlocks();
  loadAppBlocks(); // Добавьте эту строку
  loadAdminProducts();
  updateKeywordSelect();
  updateGameKeywordSelect();
  updateAppKeywordSelect(); // Добавьте эту строку
  renderGamesBlocks();
  renderAppsBlocks(); // Добавьте эту строку
}

// Загрузка блоков игр
function loadGameBlocks() {
  const stored = localStorage.getItem("apex_game_blocks");
  if (stored) {
    gameBlocks = JSON.parse(stored);
  } else {
    gameBlocks = [
      { id: "1", name: "Другие игры", keywordId: "", icon: "fas fa-gamepad", imageUrl: "" },
      { id: "2", name: "Roblox", keywordId: "", icon: "fab fa-fort-awesome", imageUrl: "" },
      { id: "3", name: "Valorant", keywordId: "", icon: "fas fa-crosshairs", imageUrl: "" },
      { id: "4", name: "Minecraft", keywordId: "", icon: "fas fa-cube", imageUrl: "" },
      { id: "5", name: "Counter-Strike", keywordId: "", icon: "fas fa-skull", imageUrl: "" },
      { id: "6", name: "Arena Breakout", keywordId: "", icon: "fas fa-crosshairs", imageUrl: "" },
      { id: "7", name: "Rust", keywordId: "", icon: "fas fa-tree", imageUrl: "" },
      { id: "8", name: "PUBG", keywordId: "", icon: "fas fa-plane", imageUrl: "" },
      { id: "9", name: "Crimson Desert", keywordId: "", icon: "fas fa-dragon", imageUrl: "" },
      { id: "10", name: "Танки", keywordId: "", icon: "fas fa-tank", imageUrl: "" }
    ];
    localStorage.setItem("apex_game_blocks", JSON.stringify(gameBlocks));
  }
  renderGamesBlocks();
  renderHomeGameBlocks();
}

function renderGamesBlocks() {
  const container = document.getElementById("gamesBlocksList");
  if (!container) return;
  
  if (gameBlocks.length === 0) {
    container.innerHTML = "<div style='color: var(--text-muted);'>Нет блоков игр</div>";
    return;
  }
  
  container.innerHTML = gameBlocks.map(block => `
    <div class="game-block-item">
      <div class="game-block-info">
        <div class="game-block-icon">
          ${block.imageUrl ? 
            `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.name)}">` : 
            `<i class="${block.icon}"></i>`
          }
        </div>
        <div>
          <div class="game-block-name">${escapeHtml(block.name)}</div>
          <div class="game-block-keyword">${block.keywordId ? 'Привязан к ключевому слову' : 'Без привязки'}</div>
          ${block.imageUrl ? `<div class="game-block-keyword">📷 Фото установлено</div>` : ''}
        </div>
      </div>
      <div class="game-block-actions">
        <button class="edit-game-btn" onclick="editGameBlock('${block.id}')"><i class="fas fa-edit"></i></button>
        <button class="delete-game-btn" onclick="deleteGameBlock('${block.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function renderHomeGameBlocks() {
  const container = document.getElementById("gamesScrollWrapper");
  if (!container) return;
  
  if (gameBlocks.length === 0) {
    container.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">Нет блоков</div>';
    return;
  }
  
  // Разделяем игры на два ряда
  const midIndex = Math.ceil(gameBlocks.length / 2);
  const firstRow = gameBlocks.slice(0, midIndex);
  const secondRow = gameBlocks.slice(midIndex);
  
  const firstRowHtml = firstRow.map(block => `
    <div class="game-card" data-game="${escapeHtml(block.name)}" onclick="openKeywordPageByBlock('${block.id}')">
      <div class="game-icon">
        ${block.imageUrl ? 
          `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.name)}">` : 
          `<i class="${block.icon}"></i>`
        }
      </div>
      <div class="game-name">${escapeHtml(block.name)}</div>
    </div>
  `).join('');
  
  const secondRowHtml = secondRow.map(block => `
    <div class="game-card" data-game="${escapeHtml(block.name)}" onclick="openKeywordPageByBlock('${block.id}')">
      <div class="game-icon">
        ${block.imageUrl ? 
          `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.name)}">` : 
          `<i class="${block.icon}"></i>`
        }
      </div>
      <div class="game-name">${escapeHtml(block.name)}</div>
    </div>
  `).join('');
  
  container.innerHTML = `
    <div class="games-row">${firstRowHtml}</div>
    <div class="games-row-second">${secondRowHtml}</div>
  `;
}

function addGameBlock() {
  const name = document.getElementById("newGameName")?.value.trim();
  const keywordId = document.getElementById("newGameKeyword")?.value;
  const icon = document.getElementById("newGameIcon")?.value;
  const imageUrl = document.getElementById("newGameImageUrl")?.value.trim();
  
  if (!name) {
    alert("Введите название блока");
    return;
  }
  
  const newBlock = {
    id: Date.now().toString(),
    name: name,
    keywordId: keywordId || "",
    icon: icon || "fas fa-gamepad",
    imageUrl: imageUrl || ""
  };
  
  gameBlocks.push(newBlock);
  localStorage.setItem("apex_game_blocks", JSON.stringify(gameBlocks));
  renderGamesBlocks();
  renderHomeGameBlocks();
  updateGameKeywordSelect();
  
  // Очищаем форму
  document.getElementById("newGameName").value = "";
  document.getElementById("newGameKeyword").value = "";
  document.getElementById("newGameIcon").value = "fas fa-gamepad";
  document.getElementById("newGameImageUrl").value = "";
  const preview = document.getElementById("imagePreview");
  if (preview) preview.style.display = "none";
  
  alert("✅ Блок игры успешно добавлен!");
}

function deleteGameBlock(id) {
  if (confirm("Удалить этот блок?")) {
    gameBlocks = gameBlocks.filter(b => b.id !== id);
    localStorage.setItem("apex_game_blocks", JSON.stringify(gameBlocks));
    renderGamesBlocks();
    renderHomeGameBlocks();
    alert("✅ Блок удален");
  }
}

function editGameBlock(id) {
  const block = gameBlocks.find(b => b.id === id);
  if (!block) return;
  
  const newName = prompt("Введите новое название:", block.name);
  if (newName && newName.trim()) {
    block.name = newName.trim();
    
    const newImageUrl = prompt("Введите URL нового фото (оставьте пустым для использования иконки):\n\nТекущее фото: " + (block.imageUrl || "не установлено"), block.imageUrl || "");
    if (newImageUrl !== null) {
      block.imageUrl = newImageUrl.trim();
    }
    
    localStorage.setItem("apex_game_blocks", JSON.stringify(gameBlocks));
    renderGamesBlocks();
    renderHomeGameBlocks();
    alert("✅ Блок обновлен!");
  }
}

function updateGameKeywordSelect() {
  const select = document.getElementById("newGameKeyword");
  if (!select) return;
  
  select.innerHTML = '<option value="">Без привязки к ключевому слову</option>';
  keywords.forEach(k => {
    select.innerHTML += `<option value="${escapeHtml(k.id)}">${escapeHtml(k.name)} - ${escapeHtml(k.type)}</option>`;
  });
}

function previewGameImage(input) {
  const preview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const imageUrl = input.value.trim();
  
  if (imageUrl) {
    previewImg.src = imageUrl;
    preview.style.display = "block";
    previewImg.onerror = function() {
      preview.style.display = "none";
      alert("Не удалось загрузить изображение по указанному URL. Проверьте ссылку.");
    };
  } else {
    preview.style.display = "none";
  }
}

function loadKeywords() {
  const stored = localStorage.getItem("apex_keywords");
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
    localStorage.setItem("apex_keywords", JSON.stringify(keywords));
  }
  renderKeywords();
}

function renderKeywords() {
  const container = document.getElementById("keywordsList");
  if (!container) return;
  
  if (keywords.length === 0) {
    container.innerHTML = "<div style='color: var(--text-muted);'>Нет ключевых слов</div>";
    return;
  }
  
  container.innerHTML = keywords.map(k => `
    <div class="keyword-item">
      <span class="keyword-name">${escapeHtml(k.name)}</span>
      <span class="keyword-type">${escapeHtml(k.type)}</span>
      <button class="delete-keyword-btn" onclick="deleteKeyword('${k.id}')">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

function addKeyword() {
  const name = document.getElementById("newKeyword")?.value.trim();
  const type = document.getElementById("keywordType")?.value.trim();
  
  if (!name) {
    alert("Введите ключевое слово");
    return;
  }
  
  const newKeyword = {
    id: Date.now().toString(),
    name: name,
    type: type || "Стандарт"
  };
  
  keywords.push(newKeyword);
  localStorage.setItem("apex_keywords", JSON.stringify(keywords));
  renderKeywords();
  updateKeywordSelect();
  updateGameKeywordSelect();
  
  document.getElementById("newKeyword").value = "";
  document.getElementById("keywordType").value = "";
  
  alert("✅ Ключевое слово добавлено!");
}

function deleteKeyword(id) {
  if (confirm("Удалить это ключевое слово? Все товары с ним останутся, но категория пропадёт.")) {
    keywords = keywords.filter(k => k.id !== id);
    localStorage.setItem("apex_keywords", JSON.stringify(keywords));
    renderKeywords();
    updateKeywordSelect();
    updateGameKeywordSelect();
    alert("✅ Ключевое слово удалено");
  }
}

function updateKeywordSelect() {
  const select = document.getElementById("postKeyword");
  if (!select) return;
  
  select.innerHTML = '<option value="">Выберите ключевое слово/категорию</option>';
  keywords.forEach(k => {
    select.innerHTML += `<option value="${escapeHtml(k.id)}">${escapeHtml(k.name)} - ${escapeHtml(k.type)}</option>`;
  });
}

function createAdminProduct() {
  const keywordId = document.getElementById("postKeyword")?.value;
  const title = document.getElementById("postTitle")?.value.trim();
  const price = document.getElementById("postPrice")?.value.trim();
  const discount = document.getElementById("postDiscount")?.value.trim();
  const description = document.getElementById("postDescription")?.value.trim();
  const imageUrl = document.getElementById("postImageUrl")?.value.trim();
  const seller = document.getElementById("postSeller")?.value.trim();
  const productType = document.getElementById("postType")?.value.trim();
  
  if (!keywordId) {
    alert("Выберите ключевое слово/категорию");
    return;
  }
  if (!title) {
    alert("Введите название товара");
    return;
  }
  if (!price) {
    alert("Введите цену");
    return;
  }
  
  const selectedKeyword = keywords.find(k => k.id === keywordId);
  const keywordName = selectedKeyword ? selectedKeyword.name : "Без категории";
  const keywordType = selectedKeyword ? selectedKeyword.type : "";
  
  let finalPrice = price;
  let discountText = "";
  if (discount) {
    discountText = discount;
    if (discount.includes("%")) {
      const percent = parseFloat(discount);
      const priceNum = parseFloat(price.replace(/[^0-9.-]/g, ''));
      if (!isNaN(priceNum) && !isNaN(percent)) {
        const newPrice = priceNum * (1 - percent / 100);
        finalPrice = `${Math.round(newPrice)} ${price.replace(/[0-9.-]/g, '').trim() || '₽'}`;
      }
    }
  }
  
  const fullDescription = description || "Новый товар от администратора";
  
  const newProduct = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    title: title,
    price: finalPrice,
    originalPrice: discount ? price : null,
    discount: discountText || null,
    seller: seller || window.currentUser || "Admin",
    rating: 5.0,
    sales: 0,
    fullDesc: `${fullDescription} Моментальная выдача. Гарантия качества.`,
    positive: "100%",
    responseTime: "отвечает быстро",
    imageUrl: imageUrl || "https://picsum.photos/id/42/400/200",
    keyword: keywordName,
    keywordId: keywordId,
    type: productType || keywordType || "Стандарт",
    createdAt: new Date().toISOString()
  };
  
  let products = JSON.parse(localStorage.getItem("apex_products") || "[]");
  products.unshift(newProduct);
  localStorage.setItem("apex_products", JSON.stringify(products));
  
  if (window.productsArray) {
    window.productsArray = products;
    window.filterProducts();
  }
  
  loadAdminProducts();
  
  document.getElementById("postTitle").value = "";
  document.getElementById("postPrice").value = "";
  document.getElementById("postDiscount").value = "";
  document.getElementById("postDescription").value = "";
  document.getElementById("postImageUrl").value = "";
  document.getElementById("postSeller").value = "";
  document.getElementById("postKeyword").value = "";
  document.getElementById("postType").value = "";
  
  alert("✅ Товар успешно опубликован!");
}

function loadAdminProducts() {
  const container = document.getElementById("adminProductsList");
  if (!container) return;
  
  const products = JSON.parse(localStorage.getItem("apex_products") || "[]");
  
  if (products.length === 0) {
    container.innerHTML = "<div style='color: var(--text-muted); text-align: center; padding: 20px;'>Нет товаров</div>";
    return;
  }
  
  container.innerHTML = products.map(p => `
    <div class="admin-product-item">
      <div class="admin-product-info">
        <div class="admin-product-title">
          ${escapeHtml(p.title)}
          ${p.discount ? `<span class="discount-badge">-${escapeHtml(p.discount)}</span>` : ''}
        </div>
        <div class="admin-product-price">
          ${escapeHtml(p.price)}
          ${p.originalPrice ? `<span style="text-decoration: line-through; color: var(--text-muted); font-size: 0.7rem; margin-left: 8px;">${escapeHtml(p.originalPrice)}</span>` : ''}
        </div>
        <div class="admin-product-keyword">${escapeHtml(p.keyword || 'Без категории')}</div>
      </div>
      <div class="admin-product-actions">
        <button class="admin-edit-btn" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
        <button class="admin-delete-btn" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}



// Добавьте функцию загрузки блоков приложений
function loadAppBlocks() {
  const stored = localStorage.getItem("apex_app_blocks");
  if (stored) {
    appBlocks = JSON.parse(stored);
  } else {
    appBlocks = [
      { id: "app1", name: "Telegram", keywordId: "", icon: "fab fa-telegram", imageUrl: "" },
      { id: "app2", name: "WhatsApp", keywordId: "", icon: "fab fa-whatsapp", imageUrl: "" },
      { id: "app3", name: "Instagram", keywordId: "", icon: "fab fa-instagram", imageUrl: "" },
      { id: "app4", name: "TikTok", keywordId: "", icon: "fab fa-tiktok", imageUrl: "" },
      { id: "app5", name: "YouTube", keywordId: "", icon: "fab fa-youtube", imageUrl: "" },
      { id: "app6", name: "Spotify", keywordId: "", icon: "fab fa-spotify", imageUrl: "" },
      { id: "app7", name: "Netflix", keywordId: "", icon: "fas fa-tv", imageUrl: "" },
      { id: "app8", name: "Discord", keywordId: "", icon: "fab fa-discord", imageUrl: "" }
    ];
    localStorage.setItem("apex_app_blocks", JSON.stringify(appBlocks));
  }
  renderAppsBlocks();
  renderHomeAppBlocks();
}

// Рендер блоков приложений в админке
function renderAppsBlocks() {
  const container = document.getElementById("appsBlocksList");
  if (!container) return;
  
  if (appBlocks.length === 0) {
    container.innerHTML = "<div style='color: var(--text-muted);'>Нет блоков приложений</div>";
    return;
  }
  
  container.innerHTML = appBlocks.map(block => `
    <div class="game-block-item">
      <div class="game-block-info">
        <div class="game-block-icon">
          ${block.imageUrl ? 
            `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.name)}">` : 
            `<i class="${block.icon}"></i>`
          }
        </div>
        <div>
          <div class="game-block-name">${escapeHtml(block.name)}</div>
          <div class="game-block-keyword">${block.keywordId ? 'Привязан к ключевому слову' : 'Без привязки'}</div>
          ${block.imageUrl ? `<div class="game-block-keyword">📷 Фото установлено</div>` : ''}
        </div>
      </div>
      <div class="game-block-actions">
        <button class="edit-game-btn" onclick="editAppBlock('${block.id}')"><i class="fas fa-edit"></i></button>
        <button class="delete-game-btn" onclick="deleteAppBlock('${block.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

// Рендер блоков приложений на главной странице
function renderHomeAppBlocks() {
  const container = document.getElementById("appsScrollWrapper");
  if (!container) return;
  
  if (appBlocks.length === 0) {
    container.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">Нет блоков</div>';
    return;
  }
  
  const midIndex = Math.ceil(appBlocks.length / 2);
  const firstRow = appBlocks.slice(0, midIndex);
  const secondRow = appBlocks.slice(midIndex);
  
  const firstRowHtml = firstRow.map(block => `
    <div class="game-card" data-app="${escapeHtml(block.name)}" onclick="openKeywordPageByAppBlock('${block.id}')">
      <div class="game-icon">
        ${block.imageUrl ? 
          `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.name)}">` : 
          `<i class="${block.icon}"></i>`
        }
      </div>
      <div class="game-name">${escapeHtml(block.name)}</div>
    </div>
  `).join('');
  
  const secondRowHtml = secondRow.map(block => `
    <div class="game-card" data-app="${escapeHtml(block.name)}" onclick="openKeywordPageByAppBlock('${block.id}')">
      <div class="game-icon">
        ${block.imageUrl ? 
          `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.name)}">` : 
          `<i class="${block.icon}"></i>`
        }
      </div>
      <div class="game-name">${escapeHtml(block.name)}</div>
    </div>
  `).join('');
  
  container.innerHTML = `
    <div class="games-row">${firstRowHtml}</div>
    <div class="games-row-second">${secondRowHtml}</div>
  `;
}

// В admin.js - исправленная функция добавления блока приложения
function addAppBlock() {
  const name = document.getElementById("newAppName")?.value.trim();
  const keywordId = document.getElementById("newAppKeyword")?.value;
  const icon = document.getElementById("newAppIcon")?.value;
  const imageUrl = document.getElementById("newAppImageUrl")?.value.trim();
  
  if (!name) {
    alert("Введите название приложения");
    return;
  }
  
  const newBlock = {
    id: "app_" + Date.now().toString(),
    name: name,
    keywordId: keywordId || "",  // Сохраняем ID ключевого слова
    icon: icon || "fab fa-android",
    imageUrl: imageUrl || ""
  };
  
  appBlocks.push(newBlock);
  localStorage.setItem("apex_app_blocks", JSON.stringify(appBlocks));
  renderAppsBlocks();
  renderHomeAppBlocks();
  updateAppKeywordSelect();
  
  // Очищаем форму
  document.getElementById("newAppName").value = "";
  document.getElementById("newAppKeyword").value = "";
  document.getElementById("newAppIcon").value = "fab fa-android";
  document.getElementById("newAppImageUrl").value = "";
  const preview = document.getElementById("appImagePreview");
  if (preview) preview.style.display = "none";
  
  alert("✅ Блок приложения успешно добавлен!");
}

// Удаление блока приложения
function deleteAppBlock(id) {
  if (confirm("Удалить этот блок?")) {
    appBlocks = appBlocks.filter(b => b.id !== id);
    localStorage.setItem("apex_app_blocks", JSON.stringify(appBlocks));
    renderAppsBlocks();
    renderHomeAppBlocks();
    alert("✅ Блок удален");
  }
}

// Редактирование блока приложения
function editAppBlock(id) {
  const block = appBlocks.find(b => b.id === id);
  if (!block) return;
  
  const newName = prompt("Введите новое название:", block.name);
  if (newName && newName.trim()) {
    block.name = newName.trim();
    
    const newImageUrl = prompt("Введите URL нового фото (оставьте пустым для использования иконки):\n\nТекущее фото: " + (block.imageUrl || "не установлено"), block.imageUrl || "");
    if (newImageUrl !== null) {
      block.imageUrl = newImageUrl.trim();
    }
    
    localStorage.setItem("apex_app_blocks", JSON.stringify(appBlocks));
    renderAppsBlocks();
    renderHomeAppBlocks();
    alert("✅ Блок обновлен!");
  }
}

// В admin.js - исправленная функция обновления выбора ключевых слов для приложений
function updateAppKeywordSelect() {
  const select = document.getElementById("newAppKeyword");
  if (!select) return;
  
  select.innerHTML = '<option value="">Без привязки к ключевому слову</option>';
  // Используем глобальный массив keywords
  if (typeof keywords !== 'undefined' && keywords.length > 0) {
    keywords.forEach(k => {
      select.innerHTML += `<option value="${escapeHtml(k.id)}">${escapeHtml(k.name)} - ${escapeHtml(k.type)}</option>`;
    });
  } else {
    // Если keywords еще не загружены, загружаем их
    const stored = localStorage.getItem("apex_keywords");
    if (stored) {
      const kw = JSON.parse(stored);
      kw.forEach(k => {
        select.innerHTML += `<option value="${escapeHtml(k.id)}">${escapeHtml(k.name)} - ${escapeHtml(k.type)}</option>`;
      });
    }
  }
}
// Превью фото для приложения
function previewAppImage(input) {
  const preview = document.getElementById("appImagePreview");
  const previewImg = document.getElementById("appPreviewImg");
  const imageUrl = input.value.trim();
  
  if (imageUrl) {
    previewImg.src = imageUrl;
    preview.style.display = "block";
    previewImg.onerror = function() {
      preview.style.display = "none";
      alert("Не удалось загрузить изображение по указанному URL. Проверьте ссылку.");
    };
  } else {
    preview.style.display = "none";
  }
}



function deleteProduct(productId) {
  if (confirm("Удалить этот товар?")) {
    let products = JSON.parse(localStorage.getItem("apex_products") || "[]");
    products = products.filter(p => p.id !== productId);
    localStorage.setItem("apex_products", JSON.stringify(products));
    
    if (window.productsArray) {
      window.productsArray = products;
      window.filterProducts();
    }
    
    loadAdminProducts();
    alert("Товар удалён");
  }
}

function editProduct(productId) {
  let products = JSON.parse(localStorage.getItem("apex_products") || "[]");
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    alert("Товар не найден");
    return;
  }
  
  document.getElementById("postTitle").value = product.title;
  document.getElementById("postPrice").value = product.price;
  document.getElementById("postDiscount").value = product.discount || "";
  document.getElementById("postDescription").value = product.fullDesc;
  document.getElementById("postImageUrl").value = product.imageUrl || "";
  document.getElementById("postSeller").value = product.seller || "";
  document.getElementById("postType").value = product.type || "";
  
  if (product.keywordId) {
    document.getElementById("postKeyword").value = product.keywordId;
  }
  
  deleteProduct(productId);
  document.querySelector(".admin-card").scrollIntoView({ behavior: "smooth" });
  alert("Редактирование: заполните форму и нажмите 'Опубликовать товар'");
}

function toggleAdminPanel() {
  if (!isAdmin) {
    const password = prompt("Введите пароль администратора:");
    if (password === ADMIN_PASSWORD) {
      isAdmin = true;
      document.getElementById("adminToggleBtn").style.background = "var(--accent-primary)";
      document.getElementById("adminToggleBtn").innerHTML = '<i class="fas fa-user-shield"></i>';
      
      const bottomNav = document.getElementById("bottomNav");
      if (bottomNav && !document.getElementById("adminNavBtn")) {
        const adminBtn = document.createElement("button");
        adminBtn.className = "nav-btn";
        adminBtn.id = "adminNavBtn";
        adminBtn.setAttribute("data-nav", "admin");
        adminBtn.innerHTML = '<i class="fas fa-cog"></i><span>Админ</span>';
        
        const wave = bottomNav.querySelector(".wave");
        const plusBtn = bottomNav.querySelector(".plus-btn");
        if (plusBtn && wave) {
          bottomNav.insertBefore(adminBtn, plusBtn.nextSibling);
        } else {
          bottomNav.appendChild(adminBtn);
        }
        
        if (window.initNavigation) window.initNavigation();
        alert("Добро пожаловать в админ-панель!");
        initAdmin();
      }
    } else {
      alert("Неверный пароль!");
    }
  } else {
    navigate("admin");
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initAdmin();
});

window.addKeyword = addKeyword;
window.deleteKeyword = deleteKeyword;
window.createAdminProduct = createAdminProduct;
window.deleteProduct = deleteProduct;
window.editProduct = editProduct;
window.toggleAdminPanel = toggleAdminPanel;
window.addGameBlock = addGameBlock;
window.deleteGameBlock = deleteGameBlock;
window.editGameBlock = editGameBlock;
window.previewGameImage = previewGameImage;