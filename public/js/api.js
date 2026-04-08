// API клиент для работы с сервером
const API = {
    // Товары
    async getProducts() {
        const res = await fetch('/api/products');
        return res.json();
    },
    
    async createProduct(product) {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return res.json();
    },
    
    async deleteProduct(id) {
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    
    // Ключевые слова
    async getKeywords() {
        const res = await fetch('/api/keywords');
        return res.json();
    },
    
    async createKeyword(keyword) {
        const res = await fetch('/api/keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(keyword)
        });
        return res.json();
    },
    
    // Блоки игр
    async getGameBlocks() {
        const res = await fetch('/api/game-blocks');
        return res.json();
    },
    
    async createGameBlock(block) {
        const res = await fetch('/api/game-blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(block)
        });
        return res.json();
    },
    
    async deleteGameBlock(id) {
        const res = await fetch(`/api/game-blocks/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    
    // Блоки приложений
    async getAppBlocks() {
        const res = await fetch('/api/app-blocks');
        return res.json();
    },
    
    async createAppBlock(block) {
        const res = await fetch('/api/app-blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(block)
        });
        return res.json();
    },
    
    async deleteAppBlock(id) {
        const res = await fetch(`/api/app-blocks/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};