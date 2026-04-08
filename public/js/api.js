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
            // Fallback на localStorage
            const stored = localStorage.getItem('apex_products');
            return stored ? JSON.parse(stored) : [];
        }
    },
    
    async createProduct(product) {
        const result = await this.request('/api/products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
        
        // Обновляем localStorage кеш
        const products = await this.getProducts();
        localStorage.setItem('apex_products', JSON.stringify(products));
        
        return result;
    },
    
    async deleteProduct(id) {
        const result = await this.request(`/api/products/${id}`, {
            method: 'DELETE'
        });
        
        // Обновляем localStorage кеш
        const products = await this.getProducts();
        localStorage.setItem('apex_products', JSON.stringify(products));
        
        return result;
    },
    
    async getKeywords() {
        try {
            const keywords = await this.request('/api/keywords');
            return Array.isArray(keywords) ? keywords : [];
        } catch (error) {
            console.error('Error fetching keywords:', error);
            const stored = localStorage.getItem('apex_keywords');
            return stored ? JSON.parse(stored) : [];
        }
    },
    
    async createKeyword(keyword) {
        const result = await this.request('/api/keywords', {
            method: 'POST',
            body: JSON.stringify(keyword)
        });
        
        const keywords = await this.getKeywords();
        localStorage.setItem('apex_keywords', JSON.stringify(keywords));
        
        return result;
    },
    
    async deleteKeyword(id) {
        const result = await this.request(`/api/keywords/${id}`, {
            method: 'DELETE'
        });
        
        const keywords = await this.getKeywords();
        localStorage.setItem('apex_keywords', JSON.stringify(keywords));
        
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

// Тест подключения при загрузке
setTimeout(async () => {
    console.log('🔌 Testing API connection...');
    const test = await API.testConnection();
    if (test.success) {
        console.log('✅ API connection OK');
    } else {
        console.error('❌ API connection failed:', test.error);
    }
}, 1000);

console.log('✅ API client loaded');