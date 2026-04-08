// API для работы с сервером
const API = {
    async getProducts() {
        const res = await fetch('/api/products');
        return res.json();
    },
    
    async addProduct(product) {
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
    
    async getKeywords() {
        const res = await fetch('/api/keywords');
        return res.json();
    }
};

window.API = API;