// ============================================
// GLOBAL FIX - ПОЛНАЯ СИНХРОНИЗАЦИЯ С API
// ============================================

(function() {
    console.log('🌍 GLOBAL FIX - загрузка...');

    // ========== 1. ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ ТОВАРОВ ==========
    window.loadProducts = async function() {
        console.log('🔄 loadProducts (GLOBAL FIX)');
        try {
            const products = await API.getProducts();
            window.productsArray = products;
            localStorage.setItem('apex_products', JSON.stringify(products));
            
            // Отрисовка на главной странице
            const grid = document.getElementById('productsGrid');
            if (grid) {
                if (products.length === 0) {
                    grid.innerHTML = '<div class="empty-state">Нет товаров</div>';
                } else {
                    let html = '';
                    products.forEach(p => {
                        html += `
                            <div class="product-card" onclick="window.openProductDetail('${p.id}')">
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
            
            // Обновляем счетчик
            const countSpan = document.getElementById('productCountStat');
            if (countSpan) countSpan.innerText = products.length;
            
            console.log(`✅ Загружено ${products.length} товаров`);
            return products;
        } catch(e) {
            console.error('loadProducts error:', e);
            return [];
        }
    };

    // ========== 2. ОТКРЫТИЕ ТОВАРА ==========
    window.openProductDetail = async function(productId) {
        console.log('🔍 openProductDetail:', productId);
        const products = await API.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            alert('Товар не найден');
            return;
        }
        
        // Показываем информацию (можно заменить на красивый модал)
        alert(`📦 ${product.title}\n💰 ${product.price}\n👤 ${product.seller}\n\n📝 ${(product.description || '').substring(0, 200)}...`);
    };

    // ========== 3. ФИЛЬТРАЦИЯ ТОВАРОВ ==========
    window.filterProducts = function() {
        const term = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const products = window.productsArray || [];
        const filtered = products.filter(p => 
            p.title.toLowerCase().includes(term) || 
            (p.keyword && p.keyword.toLowerCase().includes(term))
        );
        
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state">Ничего не найдено</div>';
        } else {
            let html = '';
            filtered.forEach(p => {
                html += `
                    <div class="product-card" onclick="window.openProductDetail('${p.id}')">
                        <div class="card-image">
                            <img src="${p.image_url || 'https://picsum.photos/id/42/400/300'}" 
                                 onerror="this.src='https://picsum.photos/id/42/400/300'">
                        </div>
                        <div class="card-body">
                            <div class="current-price">${p.price}</div>
                            <h3 class="product-title">${(p.title || 'Без названия').substring(0, 50)}</h3>
                        </div>
                    </div>
                `;
            });
            grid.innerHTML = html;
        }
    };

    // ========== 4. АДМИН-ФУНКЦИЯ СОЗДАНИЯ ТОВАРА ==========
    window.createAdminProduct = async function() {
        console.log('👑 createAdminProduct (GLOBAL FIX)');
        
        const title = document.getElementById('postTitle')?.value.trim();
        const price = document.getElementById('postPrice')?.value.trim();
        const description = document.getElementById('postDescription')?.value.trim();
        const seller = document.getElementById('postSeller')?.value.trim() || 'Admin';
        const imageUrl = document.getElementById('postImageUrl')?.value.trim();
        const keywordSelect = document.getElementById('postKeyword');
        const keyword = keywordSelect?.options?.[keywordSelect.selectedIndex]?.text || 'Общее';
        
        if (!title || !price) {
            alert('❌ Заполните название и цену');
            return;
        }
        
        const newProduct = {
            title: title,
            price: price,
            seller: seller,
            keyword: keyword,
            image_url: imageUrl || 'https://picsum.photos/id/42/400/200',
            description: description || 'Новый товар'
        };
        
        try {
            await API.createProduct(newProduct);
            alert('✅ Товар создан и виден всем пользователям!');
            
            // Очищаем форму
            ['postTitle', 'postPrice', 'postDescription', 'postImageUrl', 'postSeller'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            if (keywordSelect) keywordSelect.value = '';
            
            // Обновляем отображение
            await window.loadProducts();
            
            // Обновляем админ-список если он есть
            if (typeof window.loadAdminProducts === 'function') {
                await window.loadAdminProducts();
            }
            
        } catch(e) {
            console.error('Create error:', e);
            alert('❌ Ошибка: ' + e.message);
        }
    };

    // ========== 5. ФУНКЦИЯ УДАЛЕНИЯ ТОВАРА ==========
    window.deleteProduct = async function(productId) {
        if (!confirm('Удалить этот товар?')) return;
        
        try {
            await API.deleteProduct(productId);
            alert('✅ Товар удален');
            await window.loadProducts();
            
            if (typeof window.loadAdminProducts === 'function') {
                await window.loadAdminProducts();
            }
            if (typeof window.renderUserProductsList === 'function') {
                await window.renderUserProductsList();
            }
        } catch(e) {
            alert('❌ Ошибка: ' + e.message);
        }
    };

    // ========== 6. ФУНКЦИЯ ДЛЯ СТРАНИЦЫ ТОВАРОВ ==========
    window.renderUserProductsList = async function() {
        const container = document.getElementById('userProductsList');
        if (!container) return;
        
        const currentUser = localStorage.getItem('apex_user') || 'Гость';
        const products = await API.getProducts();
        const userProducts = products.filter(p => p.seller === currentUser);
        
        if (userProducts.length === 0) {
            container.innerHTML = '<div class="empty-products-state">У вас пока нет товаров</div>';
            return;
        }
        
        container.innerHTML = userProducts.map(p => `
            <div class="product-item-card">
                <img class="product-item-img" src="${p.image_url || 'https://picsum.photos/id/42/60/60'}">
                <div class="product-item-info">
                    <div class="product-item-title">${p.title}</div>
                    <div class="product-item-price">${p.price}</div>
                </div>
                <div class="product-item-actions">
                    <button class="delete-product-btn" onclick="window.deleteProduct('${p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    };

    // ========== 7. ФУНКЦИЯ ДЛЯ ПРОФИЛЯ ==========
    window.loadUserProductsInProfile = async function() {
        const container = document.getElementById('profileProductsList');
        if (!container) return;
        
        const currentUser = localStorage.getItem('apex_user') || 'Гость';
        const products = await API.getProducts();
        const userProducts = products.filter(p => p.seller === currentUser);
        
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
        
        container.innerHTML = userProducts.map(p => `
            <div class="profile-product-item" onclick="window.openProductDetail('${p.id}')">
                <img class="profile-product-img" src="${p.image_url || 'https://picsum.photos/id/42/50/50'}">
                <div class="profile-product-info">
                    <div class="profile-product-title">${p.title}</div>
                    <div class="profile-product-price">${p.price}</div>
                    <div class="profile-product-status status-active">● Активен</div>
                </div>
            </div>
        `).join('');
        
        // Обновляем счетчик
        const countSpan = document.getElementById('profileProductsCount');
        if (countSpan) countSpan.innerText = userProducts.length;
    };

    // ========== 8. АДМИН-СПИСОК ТОВАРОВ ==========
    window.loadAdminProducts = async function() {
        const container = document.getElementById('adminProductsList');
        if (!container) return;
        
        const products = await API.getProducts();
        
        if (products.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;">Нет товаров</div>';
            return;
        }
        
        container.innerHTML = products.map(p => `
            <div class="admin-product-item">
                <div class="admin-product-info">
                    <div class="admin-product-title">${p.title}</div>
                    <div class="admin-product-price">${p.price}</div>
                    <div class="admin-product-seller">Продавец: ${p.seller}</div>
                </div>
                <div class="admin-product-actions">
                    <button class="admin-delete-btn" onclick="window.deleteProduct('${p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        const countSpan = document.getElementById('adminProductsCount');
        if (countSpan) countSpan.innerText = products.length;
    };

    // ========== 9. ОБНОВЛЕНИЕ СТАТИСТИКИ ==========
    window.updateAdminStats = async function() {
        try {
            const products = await API.getProducts();
            const countSpan = document.getElementById('adminProductsCount');
            if (countSpan) countSpan.innerText = products.length;
        } catch(e) {}
    };

    // ========== 10. СОЗДАНИЕ ТОВАРА (ДЛЯ ОБЫЧНЫХ ПОЛЬЗОВАТЕЛЕЙ) ==========
    window.createNewProduct = async function() {
        const title = document.getElementById('productTitle')?.value;
        const price = document.getElementById('productPrice')?.value;
        const description = document.getElementById('productDescription')?.value;
        
        if (!title || !price) {
            alert('Заполните название и цену');
            return;
        }
        
        const currentUser = localStorage.getItem('apex_user') || 'Гость';
        
        const newProduct = {
            title: title,
            price: price,
            seller: currentUser,
            keyword: 'Общее',
            image_url: document.getElementById('productImageUrl')?.value || 'https://picsum.photos/id/42/400/200',
            description: description || 'Новый товар'
        };
        
        try {
            await API.createProduct(newProduct);
            alert('✅ Товар создан!');
            
            // Очищаем форму
            ['productTitle', 'productPrice', 'productDescription', 'productImageUrl'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            
            await window.loadProducts();
            
            const form = document.getElementById('createProductForm');
            if (form) form.style.display = 'none';
            
        } catch(e) {
            alert('❌ Ошибка: ' + e.message);
        }
    };

    // ========== 11. АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ПРИ СТАРТЕ ==========
    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('📄 DOM загружен, инициализация...');
            await window.loadProducts();
            
            // Если на странице профиля - загружаем товары профиля
            if (document.getElementById('profile')?.classList?.contains('active')) {
                await window.loadUserProductsInProfile();
            }
            
            // Если на странице товаров - загружаем список
            if (document.getElementById('products-manage')?.classList?.contains('active')) {
                await window.renderUserProductsList();
            }
            
            // Если в админке - обновляем статистику
            if (typeof window.updateAdminStats === 'function') {
                await window.updateAdminStats();
            }
        });
    } else {
        (async () => {
            await window.loadProducts();
        })();
    }

    console.log('✅ GLOBAL FIX загружен - все функции синхронизированы с API');
})();