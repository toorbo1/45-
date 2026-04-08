// js/api.js
const API_BASE = window.location.origin;

class API {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Ошибка запроса' }));
        throw new Error(error.error || 'Ошибка запроса');
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error ${endpoint}:`, error);
      throw error;
    }
  }

  // ========== ТОВАРЫ ==========
  async getProducts() {
    return this.request('/api/products');
  }

  async createProduct(productData) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== ПОЛЬЗОВАТЕЛИ ==========
  async login(username) {
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
  }

  async getUserProfile(username) {
    return this.request(`/api/users/${encodeURIComponent(username)}`);
  }

  async updateBalance(username, balance) {
    return this.request('/api/users/balance', {
      method: 'PUT',
      body: JSON.stringify({ username, balance })
    });
  }

  // ========== КЛЮЧЕВЫЕ СЛОВА ==========
  async getKeywords() {
    return this.request('/api/keywords');
  }

  async createKeyword(name, type) {
    return this.request('/api/keywords', {
      method: 'POST',
      body: JSON.stringify({ name, type })
    });
  }

  async deleteKeyword(id) {
    return this.request(`/api/keywords/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== БЛОКИ ИГР ==========
  async getGameBlocks() {
    return this.request('/api/game-blocks');
  }

  async createGameBlock(data) {
    return this.request('/api/game-blocks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGameBlock(id, data) {
    return this.request(`/api/game-blocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteGameBlock(id) {
    return this.request(`/api/game-blocks/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== БЛОКИ ПРИЛОЖЕНИЙ ==========
  async getAppBlocks() {
    return this.request('/api/app-blocks');
  }

  async createAppBlock(data) {
    return this.request('/api/app-blocks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAppBlock(id, data) {
    return this.request(`/api/app-blocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteAppBlock(id) {
    return this.request(`/api/app-blocks/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== ЗАГРУЗКА ФАЙЛОВ ==========
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Ошибка загрузки');
    return response.json();
  }
}

window.api = new API();