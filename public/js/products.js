// ============ ЗАГРУЗКА ТОВАРОВ С СЕРВЕРА ============

async function loadProductsFromServer() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    
    // Сохраняем в глобальную переменную
    window.allProducts = products;
    
    // Отображаем на главной странице
    displayProductsOnHome(products);
    
    // Обновляем счётчик
    const countSpan = document.getElementById('productCountStat');
    if (countSpan) countSpan.textContent = `(${products.length})`;
    
    return products;
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    return [];
  }
}

// Отображение товаров на главной странице
function displayProductsOnHome(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="empty-products">Нет товаров</div>';
    return;
  }
  
  grid.innerHTML = products.map(product => `
    <div class="product-card" onclick="showProductDetail('${product.id}')">
      <div class="product-image">
        <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.title}">
      </div>
      <div class="product-info">
        <div class="product-title">${escapeHtml(product.title)}</div>
        <div class="product-price">${product.price}</div>
        <div class="product-seller">👤 ${product.seller}</div>
      </div>
    </div>
  `).join('');
}

// Добавление нового товара
async function createNewProduct() {
  const productData = {
    title: document.getElementById('productTitle')?.value || '',
    price: document.getElementById('productPrice')?.value || '',
    seller: window.currentUser?.username || 'Гость',
    seller_id: window.currentUser?.id || 'guest',
    keyword: document.getElementById('productKeywordSelect')?.value || '',
    image_url: document.getElementById('productImageUrl')?.value || '',
    description: document.getElementById('productDescription')?.value || ''
  };
  
  if (!productData.title || !productData.price) {
    alert('Заполните название и цену товара');
    return;
  }
  
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    const newProduct = await response.json();
    console.log('Товар добавлен:', newProduct);
    
    // Перезагружаем список товаров
    await loadProductsFromServer();
    
    // Закрываем форму
    document.getElementById('createProductForm').style.display = 'none';
    
    alert('Товар успешно добавлен!');
  } catch (error) {
    console.error('Ошибка при добавлении товара:', error);
    alert('Ошибка при добавлении товара');
  }
}

// Загрузка товаров пользователя
async function loadUserProducts() {
  const products = await loadProductsFromServer();
  const userProducts = products.filter(p => p.seller_id === window.currentUser?.id);
  
  const container = document.getElementById('userProductsList');
  if (!container) return;
  
  if (userProducts.length === 0) {
    container.innerHTML = '<div class="empty-products-state">У вас пока нет товаров</div>';
    return;
  }
  
  container.innerHTML = userProducts.map(product => `
    <div class="user-product-item">
      <img src="${product.image_url || 'https://via.placeholder.com/50'}" width="50">
      <div class="user-product-info">
        <div class="user-product-title">${escapeHtml(product.title)}</div>
        <div class="user-product-price">${product.price}</div>
      </div>
      <button onclick="deleteProduct('${product.id}')" class="delete-btn">🗑️</button>
    </div>
  `).join('');
}

// Удаление товара
async function deleteProduct(productId) {
  if (!confirm('Удалить товар?')) return;
  
  try {
    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    await loadProductsFromServer();
    await loadUserProducts();
  } catch (error) {
    console.error('Ошибка удаления:', error);
  }
}

// Вспомогательная функция для защиты от XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Загружаем товары при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  loadProductsFromServer();
});