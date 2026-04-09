// ========== API КЛИЕНТ ==========

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
    
    async getProducts() {
        try {
            const products = await this.request('/api/products');
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    },
    
    async createProduct(product) {
        const result = await this.request('/api/products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
        return result;
    },
    
    async deleteProduct(id) {
        const result = await this.request(`/api/products/${id}`, {
            method: 'DELETE'
        });
        return result;
    },
    
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