// ============================================
// GLOBAL FIX - ПОЛНАЯ СИНХРОНИЗАЦИЯ С API
// ============================================

(function() {
    console.log('🌍 GLOBAL FIX - загрузка...');

    // Проверка, является ли пользователь админом
    async function isCurrentUserAdmin() {
        const currentUser = localStorage.getItem('apex_user') || 'Гость';
        const admins = JSON.parse(localStorage.getItem('apex_admins') || '[]');
        return admins.some(a => a.username === currentUser);
    }

    // ========== 1. ЗАГРУЗКА ТОВАРОВ (только одобренные) ==========
    window.loadProducts = async function() {
        console.log('🔄 loadProducts (GLOBAL FIX)');
        try {
            const products = await API.getProducts();
            window.productsArray = products;
            
            // Отрисовка на главной странице
            const grid = document.getElementById('productsGrid');
            if (grid) {
                if (products.length === 0) {
                    grid.innerHTML = '<div class="empty-state">Нет товаров</div>';
                } else {
                    let html = '';
                    products.forEach(p => {
                        html += `
                            <div class="product-card" onclick="window.openProductDetailById('${p.id}')">
                                <div class="card-image">
                                    <img src="${p.image_url || 'https://picsum.photos/id/42/400/300'}" 
                                         onerror="this.src='https://picsum.photos/id/42/400/300'">
                                    ${p.discount ? `<span class="discount-badge">🔥 ${p.discount}</span>` : ''}
                                </div>
                                <div class="card-body">
                                    <div class="price-wrapper">
                                        <span class="current-price">${p.price}</span>
                                    </div>
                                    <h3 class="product-title">${(p.title || 'Без названия').substring(0, 50)}</h3>
                                </div>
                            </div>
                        `;
                    });
                    grid.innerHTML = html;
                }
            }
            
            const countSpan = document.getElementById('productCountStat');
            if (countSpan) countSpan.innerText = products.length;
            
            console.log(`✅ Загружено ${products.length} одобренных товаров`);
            return products;
        } catch(e) {
            console.error('loadProducts error:', e);
            return [];
        }
    };

    // ========== 2. ЗАГРУЗКА ТОВАРОВ НА МОДЕРАЦИИ (только для админов) ==========
    window.loadPendingProducts = async function() {
        const isAdmin = await isCurrentUserAdmin();
        if (!isAdmin) return [];
        
        try {
            const pending = await API.getPendingProducts();
            
            // Обновляем админский список
            const container = document.getElementById('pendingProductsList');
            if (container) {
                if (pending.length === 0) {
                    container.innerHTML = '<div class="empty-state">Нет товаров на модерации</div>';
                } else {
                    container.innerHTML = pending.map(p => `
                        <div class="pending-product-item">
                            <div class="pending-product-img">
                                <img src="${p.image_url || 'https://picsum.photos/id/42/50/50'}" alt="">
                            </div>
                            <div class="pending-product-info">
                                <div class="pending-product-title">${escapeHtml(p.title)}</div>
                                <div class="pending-product-price">${escapeHtml(p.price)}</div>
                                <div class="pending-product-seller">Продавец: ${escapeHtml(p.seller)}</div>
                            </div>
                            <div class="pending-product-actions">
                                <button class="approve-product-btn" onclick="window.approveProduct('${p.id}')">
                                    <i class="fas fa-check"></i> Одобрить
                                </button>
                                <button class="reject-product-btn" onclick="window.rejectProduct('${p.id}')">
                                    <i class="fas fa-times"></i> Отклонить
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            }
            
            return pending;
        } catch(e) {
            console.error('loadPendingProducts error:', e);
            return [];
        }
    };

    // ========== 3. ОДОБРЕНИЕ ТОВАРА ==========
    window.approveProduct = async function(productId) {
        try {
            await API.approveProduct(productId);
            showToast('✅ Товар одобрен и виден всем пользователям!', 'success');
            
            // Обновляем списки
            await window.loadPendingProducts();
            await window.loadProducts();
            
            // Обновляем админ-статистику
            if (typeof window.updateAdminStats === 'function') {
                await window.updateAdminStats();
            }
        } catch(e) {
            console.error('Approve error:', e);
            showToast('❌ Ошибка при одобрении: ' + e.message, 'error');
        }
    };

    // ========== 4. ОТКЛОНЕНИЕ ТОВАРА ==========
    window.rejectProduct = async function(productId) {
        const reason = prompt("Укажите причину отклонения (необязательно):");
        try {
            await API.rejectProduct(productId);
            showToast('❌ Товар отклонен', 'warning');
            await window.loadPendingProducts();
        } catch(e) {
            console.error('Reject error:', e);
            showToast('❌ Ошибка при отклонении: ' + e.message, 'error');
        }
    };

    // ========== 5. СОЗДАНИЕ ТОВАРА (с проверкой прав) ==========
    window.createAdminProduct = async function() {
        console.log('👑 createAdminProduct (GLOBAL FIX)');
        
        const isAdmin = await isCurrentUserAdmin();
        const title = document.getElementById('postTitle')?.value.trim();
        const price = document.getElementById('postPrice')?.value.trim();
        const description = document.getElementById('postDescription')?.value.trim();
        const seller = document.getElementById('postSeller')?.value.trim() || 
                      (isAdmin ? 'Admin' : localStorage.getItem('apex_user') || 'Гость');
        const imageUrl = document.getElementById('postImageUrl')?.value.trim();
        const keywordSelect = document.getElementById('postKeyword');
        const keywordId = keywordSelect?.value;
        
        if (!title || !price) {
            showToast('❌ Заполните название и цену', 'error');
            return;
        }
        
        // Получаем имя ключевого слова
        let keywordName = "Общее";
        if (keywordId && window.keywords) {
            const selected = window.keywords.find(k => k.id === keywordId);
            if (selected) keywordName = selected.name;
        }
        
        const newProduct = {
            title: title,
            price: price,
            seller: seller,
            keyword: keywordName,
            image_url: imageUrl || 'https://picsum.photos/id/42/400/200',
            description: description || 'Новый товар'
        };
        
        try {
            // Если админ - публикуем сразу, если нет - на модерацию
            const result = await API.createProduct(newProduct, isAdmin);
            
            if (isAdmin) {
                showToast('✅ Товар опубликован и виден всем пользователям!', 'success');
            } else {
                showToast('📝 Товар отправлен на модерацию. Администратор проверит его в ближайшее время.', 'info');
            }
            
            // Очищаем форму
            ['postTitle', 'postPrice', 'postDescription', 'postImageUrl', 'postSeller'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            if (keywordSelect) keywordSelect.value = '';
            
            // Обновляем отображение
            await window.loadProducts();
            
            // Обновляем список модерации для админа
            if (isAdmin) {
                await window.loadPendingProducts();
            }
            
            // Обновляем админ-список
            if (typeof window.loadAdminProducts === 'function') {
                await window.loadAdminProducts();
            }
            
        } catch(e) {
            console.error('Create error:', e);
            showToast('❌ Ошибка: ' + e.message, 'error');
        }
    };

    // ========== 6. СОЗДАНИЕ ТОВАРА ДЛЯ ОБЫЧНЫХ ПОЛЬЗОВАТЕЛЕЙ ==========
    window.createNewProduct = async function() {
        const title = document.getElementById('productTitle')?.value;
        const price = document.getElementById('productPrice')?.value;
        const description = document.getElementById('productDescription')?.value;
        const keywordSelect = document.getElementById('productKeywordSelect');
        const keywordId = keywordSelect?.value;
        
        if (!title || !price) {
            showToast('Заполните название и цену', 'error');
            return;
        }
        
        // Получаем имя ключевого слова
        let keywordName = "Общее";
        if (keywordId && window.keywords) {
            const selected = window.keywords.find(k => k.id === keywordId);
            if (selected) keywordName = selected.name;
        }
        
        const currentUser = localStorage.getItem('apex_user') || 'Гость';
        
        const newProduct = {
            title: title,
            price: price,
            seller: currentUser,
            keyword: keywordName,
            image_url: document.getElementById('productImageUrl')?.value || 'https://picsum.photos/id/42/400/200',
            description: description || 'Новый товар'
        };
        
        try {
            // Обычный пользователь - товар идёт на модерацию
            await API.createProduct(newProduct, false);
            showToast('📝 Товар отправлен на модерацию! Администратор проверит его.', 'info');
            
            // Очищаем форму
            ['productTitle', 'productPrice', 'productDescription', 'productImageUrl'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            if (keywordSelect) keywordSelect.value = '';
            
            // Закрываем форму
            const form = document.getElementById('createProductForm');
            if (form) form.style.display = 'none';
            
        } catch(e) {
            showToast('❌ Ошибка: ' + e.message, 'error');
        }
    };

    // ========== 7. ЗАГРУЗКА КЛЮЧЕВЫХ СЛОВ ==========
    window.loadKeywordsGlobal = async function() {
        try {
            const keywords = await API.getKeywords();
            window.keywords = keywords;
            
            // Обновляем все селекты
            const selects = ['postKeyword', 'productKeywordSelect', 'newGameKeyword', 'newAppKeyword', 'editKeyword'];
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select) {
                    const currentValue = select.value;
                    select.innerHTML = '<option value="">Выберите категорию</option>';
                    keywords.forEach(k => {
                        select.innerHTML += `<option value="${k.id}">${k.name} - ${k.type}</option>`;
                    });
                    if (currentValue && keywords.some(k => k.id === currentValue)) {
                        select.value = currentValue;
                    }
                }
            });
            
            console.log(`✅ Загружено ${keywords.length} ключевых слов`);
            return keywords;
        } catch(e) {
            console.error('loadKeywordsGlobal error:', e);
            return [];
        }
    };

    // ========== 8. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    function showToast(message, type = 'success') {
        let toast = document.getElementById('customToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'customToast';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle');
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        toast.className = `toast-notification ${type === 'error' ? 'error' : (type === 'info' ? 'info' : 'success')} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ========== 9. АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ==========
    async function initAll() {
        console.log('📄 Инициализация всех данных...');
        
        // Загружаем ключевые слова
        await window.loadKeywordsGlobal();
        
        // Загружаем одобренные товары
        await window.loadProducts();
        
        // Загружаем товары на модерацию (если пользователь админ)
        const isAdmin = await isCurrentUserAdmin();
        if (isAdmin) {
            await window.loadPendingProducts();
        }
        
        console.log('✅ Все данные синхронизированы с сервером');
    }
    
    // Запускаем инициализацию
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    console.log('✅ GLOBAL FIX загружен');
})();