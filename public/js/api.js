// ============ API ДЛЯ РАБОТЫ С СЕРВЕРОМ ==========

const API = {
    // Базовый URL (автоматически определяет сервер)
    baseURL: '',
    
    init() {
        // Определяем базовый URL
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.baseURL = 'http://localhost:3000';
        } else {
            this.baseURL = window.location.origin;
        }
        console.log('API initialized with baseURL:', this.baseURL);
    },
    
    // ============ ТОВАРЫ ============
    
    async getProducts() {
        try {
            const res = await fetch(`${this.baseURL}/api/products`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('API.getProducts error:', error);
            const stored = localStorage.getItem('apex_products');
            return stored ? JSON.parse(stored) : [];
        }
    },
    
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
    
    async deleteProduct(id) {
        const res = await fetch(`${this.baseURL}/api/products/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    
    // ============ КЛЮЧЕВЫЕ СЛОВА ============
    
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
    
    async createKeyword(keyword) {
        const res = await fetch(`${this.baseURL}/api/keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(keyword)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    
    async deleteKeyword(id) {
        const res = await fetch(`${this.baseURL}/api/keywords/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    },
    
    // ============ ТЕСТ ============
    
    async testDatabase() {
        const res = await fetch(`${this.baseURL}/api/test-db`);
        return res.json();
    }
};

// Инициализация
API.init();

// Простой auth для совместимости
window.api = {
    login: async (username) => {
        return { id: Date.now().toString(), username: username, balance: 0, products_count: 0 };
    },
    getProducts: API.getProducts,
    createProduct: API.createProduct,
    deleteProduct: API.deleteProduct
};

window.API = API;

console.log('✅ API module loaded');