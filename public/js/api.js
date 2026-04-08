// api.js
const API_BASE = ''; // Оставляем пустым, чтобы работало на том же домене

const API = {
    // ----- ТОВАРЫ -----
    async getProducts() {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error('Ошибка загрузки товаров');
        return res.json();
    },

    async createProduct(productData) {
        const res = await fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (!res.ok) throw new Error('Ошибка создания товара');
        return res.json();
    },

    async deleteProduct(productId) {
        const res = await fetch(`${API_BASE}/api/products/${productId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Ошибка удаления товара');
        return res.json();
    },

    // ----- КЛЮЧЕВЫЕ СЛОВА -----
    async getKeywords() {
        const res = await fetch(`${API_BASE}/api/keywords`);
        if (!res.ok) throw new Error('Ошибка загрузки ключевых слов');
        return res.json();
    },

    async createKeyword(keywordData) {
        const res = await fetch(`${API_BASE}/api/keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(keywordData)
        });
        return res.json();
    },
    
    // ----- БЛОКИ ИГР И ПРИЛОЖЕНИЙ -----
    async getGameBlocks() {
        const res = await fetch(`${API_BASE}/api/game-blocks`);
        return res.json();
    },

    async getAppBlocks() {
        const res = await fetch(`${API_BASE}/api/app-blocks`);
        return res.json();
    }
};

// Делаем API доступным везде
window.API = API;