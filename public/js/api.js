// ========== API КЛИЕНТ (с модерацией) ==========

const API = {
    async request(url, options = {}) {
        try {
            console.log(`🌐 API request: ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API error ${response.status}:`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
            }
            
            const data = await response.json();
            console.log(`✅ API response:`, data);
            return data;
        } catch (error) {
            console.error(`❌ API request failed:`, error);
            throw error;
        }
    },
    
    // ========== ТОВАРЫ (только одобренные) ==========
    async getProducts() {
        try {
            const products = await this.request('/api/products');
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    },
    
    // ========== ТОВАРЫ НА МОДЕРАЦИИ ==========
    async getPendingProducts() {
        try {
            const products = await this.request('/api/pending-products');
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error('Error fetching pending products:', error);
            return [];
        }
    },
    
    // ========== СОЗДАНИЕ ТОВАРА (уходит на модерацию) ==========
    async createProduct(product, isAdmin = false) {
        // Если админ - публикуем сразу
        if (isAdmin) {
            const result = await this.request('/api/products', {
                method: 'POST',
                body: JSON.stringify(product)
            });
            return result;
        }
        
        // Если обычный пользователь - отправляем на модерацию
        const result = await this.request('/api/pending-products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
        return result;
    },
    
    // ========== ОДОБРЕНИЕ ТОВАРА (только для админов) ==========
    async approveProduct(productId) {
        const result = await this.request(`/api/approve-product/${productId}`, {
            method: 'POST'
        });
        return result;
    },
    
    // ========== ОТКЛОНЕНИЕ ТОВАРА ==========
    async rejectProduct(productId) {
        const result = await this.request(`/api/pending-products/${productId}`, {
            method: 'DELETE'
        });
        return result;
    },
    
    // ========== УДАЛЕНИЕ ТОВАРА (только для админов или владельца) ==========
    async deleteProduct(id) {
        const result = await this.request(`/api/products/${id}`, {
            method: 'DELETE'
        });
        return result;
    },
    
    // ========== КЛЮЧЕВЫЕ СЛОВА ==========
    async getKeywords() {
        try {
            const keywords = await this.request('/api/keywords');
            return Array.isArray(keywords) ? keywords : [];
        } catch (error) {
            console.error('Error fetching keywords:', error);
            return [];
        }
    },
    
    async createKeyword(keyword) {
        const result = await this.request('/api/keywords', {
            method: 'POST',
            body: JSON.stringify(keyword)
        });
        return result;
    },
    
    async deleteKeyword(id) {
        const result = await this.request(`/api/keywords/${id}`, {
            method: 'DELETE'
        });
        return result;
    },
    
    // ========== ПРОВЕРКА, ЯВЛЯЕТСЯ ЛИ ПОЛЬЗОВАТЕЛЬ АДМИНОМ ==========
    async isAdmin(username) {
        try {
            // Можно добавить эндпоинт для проверки админов
            // Пока используем localStorage
            const admins = JSON.parse(localStorage.getItem('apex_admins') || '[]');
            return admins.some(a => a.username === username);
        } catch (error) {
            return false;
        }
    },
    
    async testConnection() {
        try {
            const result = await this.request('/api/test-db');
            console.log('Database test result:', result);
            return result;
        } catch (error) {
            console.error('Connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
};

// Экспорт
window.API = API;

console.log('✅ API client loaded');