// ============================================
// GLOBAL FIX - ОБНОВЛЁННАЯ ВЕРСИЯ
// ============================================

(function() {
    console.log('🌍 GLOBAL FIX - загрузка...');

    // Загрузка товаров с сервера
    window.loadProducts = async function() {
        console.log('🔄 Загрузка товаров с сервера...');
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            window.productsArray = products;
            
            console.log('Получено товаров:', products.length);
            
            // Отображаем товары на главной странице
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
            
            // Обновляем счетчик
            const countSpan = document.getElementById('productCountStat');
            if (countSpan) countSpan.innerText = products.length;
            
            return products;
        } catch(e) {
            console.error('loadProducts error:', e);
            return [];
        }
    };

    // Загрузка ключевых слов
    window.loadKeywordsGlobal = async function() {
        try {
            const response = await fetch('/api/keywords');
            const keywords = await response.json();
            window.keywords = keywords;
            
            console.log('Получено ключевых слов:', keywords.length);
            
            // Обновляем выпадающие списки
            const selects = ['postKeyword', 'productKeywordSelect', 'newGameKeyword', 'newAppKeyword'];
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select) {
                    select.innerHTML = '<option value="">Выберите категорию</option>';
                    keywords.forEach(k => {
                        select.innerHTML += `<option value="${k.id}">${k.name} - ${k.type || 'Стандарт'}</option>`;
                    });
                }
            });
            
            return keywords;
        } catch(e) {
            console.error('loadKeywordsGlobal error:', e);
            return [];
        }
    };

    // Открытие деталей товара
    window.openProductDetailById = async function(productId) {
        const products = window.productsArray || [];
        const product = products.find(p => p.id === productId);
        if (!product) {
            alert('Товар не найден');
            return;
        }
        alert(`📦 ${product.title}\n💰 ${product.price}\n👤 ${product.seller}\n\n${product.description || ''}`);
    };

    // Инициализация
    async function init() {
        await window.loadKeywordsGlobal();
        await window.loadProducts();
        console.log('✅ Инициализация завершена');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();