// ========== УПРАВЛЕНИЕ ТОВАРАМИ (ПОДПИСКАМИ) ==========

let productImageFile = null;
let currentEditingProductId = null;

function showCreateProductForm() {
  const form = document.getElementById('createProductForm');
  if (form) {
    const isVisible = form.style.display === 'block';
    form.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      form.scrollIntoView({ behavior: 'smooth' });
      loadKeywordsForProductSelect();
      setupImageUpload();
    }
  }
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function loadKeywordsForProductSelect() {
  const select = document.getElementById('productKeywordSelect');
  if (!select) return;
  
  let keywords = JSON.parse(localStorage.getItem('apex_keywords') || '[]');
  if (keywords.length === 0) {
    keywords = [
      { id: 'kw1', name: 'Steam', type: 'Premium' },
      { id: 'kw2', name: 'Discord', type: 'Nitro' },
      { id: 'kw3', name: 'Netflix', type: '4K' },
      { id: 'kw4', name: 'Spotify', type: 'Premium' },
      { id: 'kw5', name: 'YouTube', type: 'Premium' },
      { id: 'kw6', name: 'Telegram', type: 'Premium' },
      { id: 'kw7', name: 'TikTok', type: 'Premium' },
      { id: 'kw8', name: 'Instagram', type: 'Business' }
    ];
  }
  
  select.innerHTML = '<option value="">Выберите сервис или ключевое слово</option>';
  keywords.forEach(kw => {
    select.innerHTML += `<option value="${escapeHtml(kw.id)}">${escapeHtml(kw.name)} - ${escapeHtml(kw.type)}</option>`;
  });
}

function setupImageUpload() {
  const uploadArea = document.getElementById('imageUploadArea');
  const fileInput = document.getElementById('productImageInput');
  
  if (!uploadArea || !fileInput) return;
  
  uploadArea.addEventListener('click', () => fileInput.click());
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#3b82f6';
    uploadArea.style.background = 'rgba(59, 130, 246, 0.05)';
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#2a2a2a';
    uploadArea.style.background = '#0a0a0a';
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#2a2a2a';
    uploadArea.style.background = '#0a0a0a';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  });
}

function handleImageFile(file) {
  if (file.size > 5 * 1024 * 1024) {
    showToast('Изображение не должно превышать 5МБ', 'error');
    return;
  }
  
  productImageFile = file;
  const reader = new FileReader();
  reader.onload = function(e) {
    const previewGrid = document.getElementById('imagePreviewGrid');
    previewGrid.innerHTML = `
      <div class="image-preview-item">
        <img src="${e.target.result}" alt="preview">
        <div class="remove-image" onclick="removeProductImage()"><i class="fas fa-times"></i></div>
      </div>
    `;
    document.getElementById('productImageUrl').value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeProductImage() {
  productImageFile = null;
  document.getElementById('imagePreviewGrid').innerHTML = '';
  document.getElementById('productImageUrl').value = '';
}

function cancelCreateProduct() {
  document.getElementById('createProductForm').style.display = 'none';
  document.getElementById('productCategory').value = '';
  document.getElementById('productKeywordSelect').value = '';
  document.getElementById('productTitle').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productDiscount').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productInstructions').value = '';
  document.getElementById('productContact').value = '';
  document.getElementById('productTitleCounter').innerText = '0/100';
  document.getElementById('productDescCounter').innerText = '0/1000';
  document.querySelector('input[name="productType"][value="monthly"]').checked = true;
  removeProductImage();
  currentEditingProductId = null;
}

function createNewProduct() {
  console.log('createNewProduct вызвана');
  
  const category = document.getElementById('productCategory').value;
  const keywordId = document.getElementById('productKeywordSelect').value;
  const title = document.getElementById('productTitle').value.trim();
  const price = document.getElementById('productPrice').value.trim();
  const discount = document.getElementById('productDiscount').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const instructions = document.getElementById('productInstructions').value.trim();
  const contact = document.getElementById('productContact').value.trim();
  const productType = document.querySelector('input[name="productType"]:checked')?.value || 'monthly';
  const imageUrl = document.getElementById('productImageUrl').value;
  
  console.log('Поля:', { category, keywordId, title, price, description });
  
  if (!category) { showToast('Выберите категорию товара', 'error'); return; }
  if (!keywordId) { showToast('Выберите сервис или ключевое слово', 'error'); return; }
  if (!title) { showToast('Введите название товара', 'error'); return; }
  if (title.length < 3) { showToast('Название должно быть не менее 3 символов', 'error'); return; }
  if (!price) { showToast('Введите цену товара', 'error'); return; }
  if (!description) { showToast('Введите описание товара', 'error'); return; }
  if (description.length < 20) { showToast('Описание должно быть не менее 20 символов', 'error'); return; }
  
  let keywordName = '';
  let keywordType = '';
  const keywords = JSON.parse(localStorage.getItem('apex_keywords') || '[]');
  const selectedKeyword = keywords.find(k => k.id === keywordId);
  if (selectedKeyword) {
    keywordName = selectedKeyword.name;
    keywordType = selectedKeyword.type;
  }
  
  const categoryLabels = {
    'subscription': 'Подписки и сервисы',
    'game': 'Игры и внутриигровые товары',
    'software': 'Программы и лицензии',
    'service': 'Услуги и консультации',
    'other': 'Другие цифровые товары'
  };
  
  const productTypeLabels = {
    'monthly': 'Ежемесячная подписка',
    'yearly': 'Годовая подписка',
    'one-time': 'Одноразовая покупка',
    'lifetime': 'Бессрочная / Lifetime'
  };
  
  // Формируем полное описание с сохранением переносов строк и пробелов
  let fullDescription = description;
  
  // Добавляем инструкцию если есть
  if (instructions) {
    fullDescription += '\n\n📖 Инструкция по активации:\n' + instructions;
  }
  
  // Добавляем гарантию в конце (это добавится в описание товара)
  fullDescription += '\n\nМоментальная выдача. Гарантия качества.';
  
  let finalPrice = price;
  let discountText = discount || null;
  let originalPrice = null;
  
  if (discount) {
    const discountValue = parseFloat(discount);
    const priceValue = parseFloat(price.replace(/[^0-9.-]/g, ''));
    if (!isNaN(priceValue) && !isNaN(discountValue)) {
      if (discount.includes('%')) {
        const newPrice = priceValue * (1 - discountValue / 100);
        finalPrice = Math.round(newPrice) + ' ₽';
        originalPrice = price;
      } else {
        finalPrice = (priceValue - discountValue) + ' ₽';
        originalPrice = price;
      }
    }
  }
  
  const currentUser = localStorage.getItem('apex_user') || 'Гость';
  let userId = localStorage.getItem('apex_user_id');
  if (!userId) {
    userId = 'user_' + Date.now();
    localStorage.setItem('apex_user_id', userId);
  }
  
  const newProduct = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    title: title,
    price: finalPrice,
    originalPrice: originalPrice,
    discount: discountText,
    seller: currentUser,
    sellerId: userId,
    rating: 5.0,
    sales: 0,
    fullDesc: fullDescription,
    positive: '100%',
    responseTime: 'отвечает быстро',
    imageUrl: imageUrl || 'https://picsum.photos/id/42/400/200',
    keyword: keywordName,
    keywordId: keywordId,
    type: productTypeLabels[productType] || keywordType || 'Стандарт',
    category: category,
    categoryLabel: categoryLabels[category],
    contact: contact || '',
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  console.log('Новый товар:', newProduct);
  
  let products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  console.log('Текущих товаров:', products.length);
  
  if (currentEditingProductId) {
    const index = products.findIndex(p => p.id === currentEditingProductId);
    if (index !== -1) {
      products[index] = { ...products[index], ...newProduct };
      showToast('✅ Товар успешно обновлен!', 'success');
    }
    currentEditingProductId = null;
  } else {
    products.unshift(newProduct);
    showToast('✅ Товар успешно опубликован!', 'success');
  }
  
  localStorage.setItem('apex_products', JSON.stringify(products));
  console.log('Сохранено товаров:', products.length);
  
  if (window.productsArray) {
    window.productsArray = products;
    if (typeof filterProducts === 'function') filterProducts();
  }
  
  cancelCreateProduct();
  renderUserProductsList();
  
  if (typeof updateUserProductsCount === 'function') updateUserProductsCount();
  if (typeof updateUserProductsCountFromStorage === 'function') updateUserProductsCountFromStorage();
}

function renderUserProductsList() {
  const container = document.getElementById('userProductsList');
  if (!container) return;
  
  const currentUser = localStorage.getItem('apex_user') || 'Гость';
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const userProducts = products.filter(p => p.seller === currentUser);
  
  const totalSpan = document.getElementById('userProductsTotalCount');
  if (totalSpan) totalSpan.innerText = `Всего: ${userProducts.length}`;
  
  if (userProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-products-state">
        <i class="fas fa-box-open"></i>
        <p>У вас пока нет товаров</p>
        <p style="font-size: 0.8rem; margin-top: 8px;">Нажмите "Добавить товар", чтобы выставить подписку или цифровой товар на продажу</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userProducts.map(product => `
    <div class="product-item-card">
      <img class="product-item-img" src="${escapeHtml(product.imageUrl || 'https://picsum.photos/id/42/60/60')}" alt="${escapeHtml(product.title)}" onclick="openProductDetailById('${product.id}')" style="cursor: pointer;">
      <div class="product-item-info" onclick="openProductDetailById('${product.id}')" style="cursor: pointer;">
        <div class="product-item-title">${escapeHtml(product.title)}</div>
        <div class="product-item-price">${escapeHtml(product.price)}</div>
        <div class="product-item-keyword">${escapeHtml(product.keyword || 'Без категории')}</div>
      </div>
      <div class="product-item-actions">
        <button class="edit-product-btn" onclick="editUserProduct('${product.id}')"><i class="fas fa-edit"></i></button>
        <button class="delete-product-btn" onclick="deleteUserProduct('${product.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function editUserProduct(productId) {
  const products = JSON.parse(localStorage.getItem('apex_products') || '[]');
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    showToast('Товар не найден', 'error');
    return;
  }
  
  if (product.seller !== (localStorage.getItem('apex_user') || 'Гость')) {
    showToast('Вы можете редактировать только свои товары', 'error');
    return;
  }
  
  currentEditingProductId = productId;
  
  document.getElementById('productCategory').value = product.category || '';
  document.getElementById('productKeywordSelect').value = product.keywordId || '';
  document.getElementById('productTitle').value = product.title || '';
  document.getElementById('productPrice').value = product.originalPrice || product.price || '';
  document.getElementById('productDiscount').value = product.discount || '';
  document.getElementById('productContact').value = product.contact || '';
  
  // Извлекаем описание без добавленных в конце строк
  let desc = product.fullDesc || '';
  desc = desc.replace(/\n\nМоментальная выдача\. Гарантия качества\.$/, '');
  desc = desc.replace(/\n\n📖 Инструкция по активации:\n/, '\n\n');
  document.getElementById('productDescription').value = desc.trim();
  
  // Извлекаем инструкцию если есть
  let instr = '';
  if (product.fullDesc && product.fullDesc.includes('📖 Инструкция по активации:')) {
    const parts = product.fullDesc.split('\n\n📖 Инструкция по активации:\n');
    if (parts.length > 1) {
      instr = parts[1].replace(/\n\nМоментальная выдача\. Гарантия качества\.$/, '');
    }
  }
  document.getElementById('productInstructions').value = instr;
  
  if (product.type) {
    if (product.type.includes('Ежемесячная')) document.querySelector('input[name="productType"][value="monthly"]').checked = true;
    else if (product.type.includes('Годовая')) document.querySelector('input[name="productType"][value="yearly"]').checked = true;
    else if (product.type.includes('Одноразовая')) document.querySelector('input[name="productType"][value="one-time"]').checked = true;
    else if (product.type.includes('Бессрочная')) document.querySelector('input[name="productType"][value="lifetime"]').checked = true;
  }
  
  if (product.imageUrl && product.imageUrl !== 'https://picsum.photos/id/42/400/200') {
    document.getElementById('imagePreviewGrid').innerHTML = `
      <div class="image-preview-item">
        <img src="${escapeHtml(product.imageUrl)}" alt="preview">
        <div class="remove-image" onclick="removeProductImage()"><i class="fas fa-times"></i></div>
      </div>
    `;
    document.getElementById('productImageUrl').value = product.imageUrl;
  }
  
  document.getElementById('productTitleCounter').innerText = (product.title?.length || 0) + '/100';
  document.getElementById('productDescCounter').innerText = (desc.length || 0) + '/1000';
  
  const descArea = document.getElementById('productDescription');
  if (descArea) {
    setTimeout(() => {
      descArea.style.height = 'auto';
      descArea.style.height = descArea.scrollHeight + 'px';
    }, 50);
  }
  
  const instrArea = document.getElementById('productInstructions');
  if (instrArea && instrArea.value) {
    setTimeout(() => {
      instrArea.style.height = 'auto';
      instrArea.style.height = instrArea.scrollHeight + 'px';
    }, 50);
  }
  
  showCreateProductForm();
}

function deleteUserProduct(productId) {
  if (confirm('Удалить этот товар?')) {
    let products = JSON.parse(localStorage.getItem('apex_products') || '[]');
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('apex_products', JSON.stringify(products));
    
    if (window.productsArray) {
      window.productsArray = products;
      if (typeof filterProducts === 'function') filterProducts();
    }
    
    renderUserProductsList();
    
    if (typeof updateUserProductsCount === 'function') updateUserProductsCount();
    if (typeof updateUserProductsCountFromStorage === 'function') updateUserProductsCountFromStorage();
    
    showToast('✅ Товар удален', 'success');
  }
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('customToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'customToast';
    toast.className = 'toast-notification';
    toast.innerHTML = '<i class="fas"></i><span id="toastMessage"></span>';
    document.body.appendChild(toast);
  }
  
  const icon = toast.querySelector('i');
  const msgSpan = document.getElementById('toastMessage');
  
  if (type === 'success') {
    icon.className = 'fas fa-check-circle';
    icon.style.color = '#22c55e';
  } else {
    icon.className = 'fas fa-exclamation-triangle';
    icon.style.color = '#ef4444';
  }
  
  msgSpan.innerText = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
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

document.addEventListener('DOMContentLoaded', function() {
  console.log('products-manage.js загружен');
  renderUserProductsList();
  loadKeywordsForProductSelect();
  setupImageUpload();
  
  const titleInput = document.getElementById('productTitle');
  const descInput = document.getElementById('productDescription');
  const instructionsInput = document.getElementById('productInstructions');
  
  if (titleInput) {
    titleInput.addEventListener('input', function() {
      const len = this.value.length;
      const counter = document.getElementById('productTitleCounter');
      if (counter) counter.innerText = `${len}/100`;
      if (len > 100) this.value = this.value.slice(0, 100);
    });
  }
  
  if (descInput) {
    descInput.addEventListener('input', function() {
      const len = this.value.length;
      const counter = document.getElementById('productDescCounter');
      if (counter) counter.innerText = `${len}/1000`;
      if (len > 1000) this.value = this.value.slice(0, 1000);
      // Авто-расширение textarea
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 300) + 'px';
    });
  }
  
  if (instructionsInput) {
    instructionsInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
  }
});

window.showCreateProductForm = showCreateProductForm;
window.cancelCreateProduct = cancelCreateProduct;
window.createNewProduct = createNewProduct;
window.editUserProduct = editUserProduct;
window.deleteUserProduct = deleteUserProduct;
window.removeProductImage = removeProductImage;
window.renderUserProductsList = renderUserProductsList;