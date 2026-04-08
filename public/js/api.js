// api.js
window.API = {
    async getProducts() {
        const res = await fetch('/api/products');
        return res.json();
    },
    
    async getKeywords() {
        const res = await fetch('/api/keywords');
        return res.json();
    },
    
    async getGameBlocks() {
        const res = await fetch('/api/game-blocks');
        return res.json();
    },
    
    async getAppBlocks() {
        const res = await fetch('/api/app-blocks');
        return res.json();
    }
};