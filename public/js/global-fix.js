// ============================================
// GLOBAL FIX - ПОЛНАЯ СИНХРОНИЗАЦИЯ С СЕРВЕРОМ
// ============================================

(function() {
    console.log('🌍 GLOBAL FIX - загрузка...');

    // Проверка, является ли пользователь админом
    async function isCurrentUserAdmin() {
        const currentUser = localStorage.getItem('apex_user') || 'Гость';
        const admins = JSON.parse(localStorage.getItem('apex_admins') || '[{"username":"Admin","isOwner":true}]');
        return admins.some(a => a.username === currentUser);
    }

    // ========== ЗАГРУЗКА ТОВАРОВ ==========
    window.loadProducts = async function() {
        console.log('🔄 Загрузка товаров с сервера...');
        try {
            const products = await API.getProducts();
            window.productsArray = products;
            
            const grid = document.getElementById('productsGrid');
            if (grid) {
                if (products.length === 0) {
                    grid.innerHTML = '<div class="empty-state">Нет товаров</div>';
                } else {
                    grid.innerHTML = products.map(p => `
                        <div class="product-card" onclick="window.openProductDetailById('${p.id}')">
                            <div class="card-image">
                                <img src="${p.image_url || 'https://picsum.photos/id/42/400/300'}" 
                                     onerror="this.src='https://picsum.photos/id/42/400/300'">
                                ${p.discount ? `<span class="discount-badge">🔥 ${p.discount}</span>` : ''}
                            </div>
                            <div class="card-body">
                                <div class="current-price">${p.price}</div>
                                <h3 class="product-title">${(p.title || '').substring(0, 50)}</h3>
                            </div>
                        </div>
                    `).join('');
                }
            }
            
            const countSpan = document.getElementById('productCountStat');
            if (countSpan) countSpan.innerText = products.length;
            
            console.log(`✅ Загружено ${products.length} товаров`);
            return products;
        } catch(e) {
            console.error('loadProducts error:', e);
            return [];
        }
    };

    // ========== ЗАГРУЗКА КЛЮЧЕВЫХ СЛОВ ==========
    window.loadKeywordsGlobal = async function() {
        try {
            const keywords = await API.getKeywords();
            window.keywords = keywords;
            
            const selects = ['postKeyword', 'productKeywordSelect', 'newGameKeyword', 'newAppKeyword', 'editKeyword'];
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select) {
                    const currentValue = select.value;
                    select.innerHTML = '<option value="">Выберите категорию</option>';
                    keywords.forEach(k => {
                        select.innerHTML += `<option value="${k.id}">${k.name} - ${k.type || 'Стандарт'}</option>`;
                    });
                    if (currentValue && keywords.some(k => k.id === currentValue)) {
                        select.value = currentValue;
                    }
                }
            });
            
            // Обновляем список в админке
            const keywordsContainer = document.getElementById('keywordsList');
            if (keywordsContainer && typeof renderKeywords === 'function') {
                renderKeywords();
            }
            
            console.log(`✅ Загружено ${keywords.length} ключевых слов`);
            return keywords;
        } catch(e) {
            console.error('loadKeywordsGlobal error:', e);
            return [];
        }
    };

    // ========== ЗАГРУЗКА ТОВАРОВ НА МОДЕРАЦИИ ==========
    window.loadPendingProducts = async function() {
        const isAdmin = await isCurrentUserAdmin();
        if (!isAdmin) return [];
        
        try {
            const pending = await API.getPendingProducts();
            
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

    // ========== ОДОБРЕНИЕ ТОВАРА ==========
    window.approveProduct = async function(productId) {
        try {
            await API.approveProduct(productId);
            showToast('✅ Товар одобрен и виден всем пользователям!', 'success');
            await window.loadPendingProducts();
            await window.loadProducts();
            if (typeof window.updateAdminStats === 'function') {
                await window.updateAdminStats();
            }
        } catch(e) {
            console.error('Approve error:', e);
            showToast('❌ Ошибка при одобрении: ' + e.message, 'error');
        }
    };

    // ========== ОТКЛОНЕНИЕ ТОВАРА ==========
    window.rejectProduct = async function(productId) {
        try {
            await API.rejectProduct(productId);
            showToast('❌ Товар отклонен', 'warning');
            await window.loadPendingProducts();
        } catch(e) {
            console.error('Reject error:', e);
            showToast('❌ Ошибка при отклонении: ' + e.message, 'error');
        }
    };

    // ========== СОЗДАНИЕ ТОВАРА (АДМИН) ==========
    window.createAdminProduct = async function() {
        const isAdmin = await isCurrentUserAdmin();
        const title = document.getElementById('postTitle')?.value.trim();
        const price = document.getElementById('postPrice')?.value.trim();
        const description = document.getElementById('postDescription')?.value.trim();
        const seller = document.getElementById('postSeller')?.value.trim() || (isAdmin ? 'Admin' : localStorage.getItem('apex_user') || 'Гость');
        const imageUrl = document.getElementById('postImageUrl')?.value.trim();
        const keywordSelect = document.getElementById('postKeyword');
        const keywordId = keywordSelect?.value;
        
        if (!title || !price) {
            showToast('❌ Заполните название и цену', 'error');
            return;
        }
        
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
            await API.createProduct(newProduct, isAdmin);
            
            if (isAdmin) {
                showToast('✅ Товар опубликован и виден всем!', 'success');
            } else {
                showToast('📝 Товар отправлен на модерацию!', 'info');
            }
            
            // Очищаем форму
            ['postTitle', 'postPrice', 'postDescription', 'postImageUrl', 'postSeller'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            if (keywordSelect) keywordSelect.value = '';
            
            await window.loadProducts();
            if (isAdmin) await window.loadPendingProducts();
            if (typeof window.loadAdminProducts === 'function') await window.loadAdminProducts();
            
        } catch(e) {
            showToast('❌ Ошибка: ' + e.message, 'error');
        }
    };

    // ========== УДАЛЕНИЕ ТОВАРА ==========
    window.deleteProduct = async function(productId) {
        if (!confirm('Удалить этот товар?')) return;
        try {
            await API.deleteProduct(productId);
            showToast('✅ Товар удален', 'success');
            await window.loadProducts();
            if (typeof window.loadAdminProducts === 'function') await window.loadAdminProducts();
            if (typeof window.renderUserProductsList === 'function') await window.renderUserProductsList();
        } catch(e) {
            showToast('❌ Ошибка: ' + e.message, 'error');
        }
    };

    // ========== ОТКРЫТИЕ ДЕТАЛЕЙ ТОВАРА ==========
    window.openProductDetailById = async function(productId) {
        const products = await API.getProducts();
        const product = products.find(p => p.id === productId);
        if (!product) {
            alert('Товар не найден');
            return;
        }
        alert(`📦 ${product.title}\n💰 ${product.price}\n👤 ${product.seller}\n\n${product.description || ''}`);
    };

    // ========== ДОБАВЛЕНИЕ КЛЮЧЕВОГО СЛОВА ==========
    window.addKeyword = async function() {
        const name = document.getElementById('newKeywordName')?.value.trim();
        const type = document.getElementById('newKeywordType')?.value.trim();
        
        if (!name) {
            showToast('Введите название ключевого слова', 'error');
            return;
        }
        
        try {
            await API.createKeyword({ name: name, type: type || 'Стандарт' });
            showToast(`✅ Ключевое слово "${name}" добавлено!`, 'success');
            await window.loadKeywordsGlobal();
            
            if (document.getElementById('newKeywordName')) document.getElementById('newKeywordName').value = '';
            if (document.getElementById('newKeywordType')) document.getElementById('newKeywordType').value = '';
        } catch(e) {
            showToast('❌ Ошибка: ' + e.message, 'error');
        }
    };

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
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
        toast.className = `toast-notification ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    async function init() {
        console.log('📄 Инициализация всех данных...');
        await window.loadKeywordsGlobal();
        await window.loadProducts();
        
        const isAdmin = await isCurrentUserAdmin();
        if (isAdmin) {
            await window.loadPendingProducts();
        }
        
        console.log('✅ Все данные синхронизированы с сервером');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.showToast = showToast;
    console.log('✅ GLOBAL FIX загружен');
})();