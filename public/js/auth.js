// Аутентификация и работа с пользователем
window.currentUser = null;

// Данные пользователя по умолчанию
let userProfile = {
  balance: 0.10,
  joinedDate: "января 2026",
  productsCount: 0,
  purchasesCount: 0,
  salesCount: 0,
  activeOrders: 0,
  completedOrders: 0,
  rating: 5.0,
  reviewsCount: 3
};

function initAuth() {
  let user = localStorage.getItem("apex_user");
  let profile = localStorage.getItem("apex_profile");
  
  if (!user) {
    user = prompt("Добро пожаловать! Введите ваш никнейм:") || "Гость";
    localStorage.setItem("apex_user", user);
  }
  
  if (profile) {
    userProfile = JSON.parse(profile);
  } else {
    // Сохраняем профиль по умолчанию
    localStorage.setItem("apex_profile", JSON.stringify(userProfile));
  }
  
  window.currentUser = user;
  
  // Обновляем профиль на странице
  updateProfileUI();
  
  // Обновляем количество товаров пользователя
  updateUserProductsCountFromStorage();
}

function updateUserProductsCountFromStorage() {
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const userProductsCount = products.filter(p => p.seller === window.currentUser).length;
  userProfile.productsCount = userProductsCount;
  localStorage.setItem("apex_profile", JSON.stringify(userProfile));
  
  const productsCountEl = document.getElementById("profileProductsCount");
  if (productsCountEl) productsCountEl.innerText = userProductsCount;
}

function updateProfileUI() {
  // Обновляем баланс
  const balanceEl = document.getElementById("profileBalance");
  if (balanceEl) balanceEl.innerText = userProfile.balance.toFixed(2) + " ₽";
  
  // Обновляем имя пользователя
  const usernameEl = document.getElementById("profileUsername");
  if (usernameEl) usernameEl.innerText = window.currentUser;
  
  // Обновляем статистику
  const productsCountEl = document.getElementById("profileProductsCount");
  if (productsCountEl) productsCountEl.innerText = userProfile.productsCount;
  
  const purchasesCountEl = document.getElementById("profilePurchasesCount");
  if (purchasesCountEl) purchasesCountEl.innerText = userProfile.purchasesCount;
  
  const salesCountEl = document.getElementById("profileSalesCount");
  if (salesCountEl) salesCountEl.innerText = userProfile.salesCount;
  
  const reviewsCountEl = document.getElementById("profileReviewsCount");
  if (reviewsCountEl) reviewsCountEl.innerText = userProfile.reviewsCount + " отзыва";
  
  const activeCountEl = document.getElementById("activeCount");
  if (activeCountEl) activeCountEl.innerText = userProfile.activeOrders;
  
  const completedCountEl = document.getElementById("completedCount");
  if (completedCountEl) completedCountEl.innerText = userProfile.completedOrders;
  
  // Обновляем дату регистрации
  const joinedEl = document.getElementById("profileJoined");
  if (joinedEl) joinedEl.innerText = `на Плейнексис с ${userProfile.joinedDate}`;

  if (typeof updateNewProfileStats === 'function') {
  updateNewProfileStats(userProfile);
}
}

function updateProfileStats(products, purchases, sales) {
  if (products !== undefined) userProfile.productsCount = products;
  if (purchases !== undefined) userProfile.purchasesCount = purchases;
  if (sales !== undefined) userProfile.salesCount = sales;
  
  localStorage.setItem("apex_profile", JSON.stringify(userProfile));
  updateProfileUI();
}

function logout() {
  localStorage.clear();
  location.reload();
}

// Экспортируем в глобальный объект
window.logout = logout;
window.updateProfileStats = updateProfileStats;
window.updateProfileUI = updateProfileUI;