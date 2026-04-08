// API для работы с сервером Supabase через ваш бэкенд
const API = {
    // Базовый URL (для локальной разработки и продакшена)
    baseURL: window.location.origin,
    
    // ============ ТОВАРЫ ============
    
    // Получить все товары
    async getProducts() {
        try {
            const res = await fetch(`${this.baseURL}/api/products`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('API.getProducts error:', error);
            // Fallback на localStorage
            const stored = localStorage.getItem('apex_products');
            return stored ? JSON.parse(stored) : [];
        }
    },
    
    // Добавить товар
    async createProduct(product) {
        const res = await fetch(`${this.baseURL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: product.title,
                price: product.price,
                seller: product.seller,
                keyword: product.keyword,
                image_url: product.image_url,
                description: product.description
            })
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    
    // Удалить товар
    async deleteProduct(id) {
        const res = await fetch(`${this.baseURL}/api/products/${id}`, {
            method: 'DELETE'
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    
    // ============ КЛЮЧЕВЫЕ СЛОВА ============
    
    // Получить все ключевые слова
    async getKeywords() {
        try {
            const res = await fetch(`${this.baseURL}/api/keywords`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('API.getKeywords error:', error);
            const stored = localStorage.getItem('apex_keywords');
            return stored ? JSON.parse(stored) : [];
        }
    },
    
    // Добавить ключевое слово
    async createKeyword(keyword) {
        const res = await fetch(`${this.baseURL}/api/keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: keyword.name,
                type: keyword.type
            })
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    
    // Удалить ключевое слово
    async deleteKeyword(id) {
        const res = await fetch(`${this.baseURL}/api/keywords/${id}`, {
            method: 'DELETE'
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    
    // ============ БЛОКИ ИГР ============
    
    async getGameBlocks() {
        const res = await fetch(`${this.baseURL}/api/game-blocks`);
        return res.json();
    },
    
    async createGameBlock(block) {
        const res = await fetch(`${this.baseURL}/api/game-blocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(block)
        });
        return res.json();
    },
    
    async deleteGameBlock(id) {
        const res = await fetch(`${this.baseURL}/api/game-blocks/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    
    // ============ БЛОКИ ПРИЛОЖЕНИЙ ============
    
    async getAppBlocks() {
        const res = await fetch(`${this.baseURL}/api/app-blocks`);
        return res.json();
    },
    
    async createAppBlock(block) {
        const res = await fetch(`${this.baseURL}/api/app-blocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(block)
        });
        return res.json();
    },
    
    async deleteAppBlock(id) {
        const res = await fetch(`${this.baseURL}/api/app-blocks/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    
    // ============ ТЕСТ БАЗЫ ДАННЫХ ============
    
    async testDatabase() {
        const res = await fetch(`${this.baseURL}/api/test-db`);
        return res.json();
    }
};

// Экспортируем в глобальную область
window.API = API;

console.log('✅ API module loaded, connected to server');