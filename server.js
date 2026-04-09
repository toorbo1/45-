const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ============ Порт для Render ============
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

// ============ Middleware с поддержкой Cloudflare ============
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'CF-Ray', 'CF-Connecting-IP', 'X-Forwarded-For'],
    credentials: true
}));

app.set('trust proxy', true);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============ Логирование ============
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ============ Статические файлы ============
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d'
}));

// ============ Supabase ============
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ОШИБКА: SUPABASE_URL или SUPABASE_KEY не заданы!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase подключен');

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ ROOT ============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ API ТОВАРЫ (только одобренные) ============
app.get('/api/products', async (req, res) => {
    console.log('📦 GET /api/products');
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('❌ GET products error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ API ТОВАРЫ НА МОДЕРАЦИИ ============
app.get('/api/pending-products', async (req, res) => {
    console.log('📦 GET /api/pending-products');
    try {
        const { data, error } = await supabase
            .from('pending_products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('❌ GET pending products error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ СОЗДАНИЕ ТОВАРА (на модерацию) ============
app.post('/api/products', async (req, res) => {
    console.log('📦 POST /api/products');
    try {
        const product = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            title: req.body.title,
            price: req.body.price,
            seller: req.body.seller || 'User',
            keyword: req.body.keyword || 'Без категории',
            image_url: req.body.image_url || 'https://picsum.photos/id/42/400/200',
            description: req.body.description || '',
            discount: req.body.discount || null,
            original_price: req.body.originalPrice || null,
            created_at: new Date().toISOString(),
            status: 'active'
        };
        
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error('❌ POST product error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ ДОБАВЛЕНИЕ ТОВАРА НА МОДЕРАЦИЮ ============
app.post('/api/pending-products', async (req, res) => {
    console.log('📦 POST /api/pending-products');
    try {
        const pendingProduct = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            title: req.body.title,
            price: req.body.price,
            seller: req.body.seller || 'User',
            keyword: req.body.keyword || 'Без категории',
            image_url: req.body.image_url || 'https://picsum.photos/id/42/400/200',
            description: req.body.description || '',
            discount: req.body.discount || null,
            original_price: req.body.originalPrice || null,
            created_at: new Date().toISOString(),
            status: 'pending'
        };
        
        const { data, error } = await supabase
            .from('pending_products')
            .insert(pendingProduct)
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error('❌ POST pending product error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ ОДОБРЕНИЕ ТОВАРА ============
app.post('/api/approve-product/:id', async (req, res) => {
    console.log('✅ POST /api/approve-product/' + req.params.id);
    try {
        // 1. Получаем товар из pending_products
        const { data: pendingProduct, error: getError } = await supabase
            .from('pending_products')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (getError) throw getError;
        if (!pendingProduct) {
            return res.status(404).json({ error: 'Product not found in pending' });
        }
        
        // 2. Создаём товар в products
        const newProduct = {
            id: pendingProduct.id,
            title: pendingProduct.title,
            price: pendingProduct.price,
            seller: pendingProduct.seller,
            keyword: pendingProduct.keyword,
            image_url: pendingProduct.image_url,
            description: pendingProduct.description,
            discount: pendingProduct.discount,
            original_price: pendingProduct.original_price,
            created_at: pendingProduct.created_at,
            status: 'active'
        };
        
        const { error: insertError } = await supabase
            .from('products')
            .insert(newProduct);
        
        if (insertError) throw insertError;
        
        // 3. Удаляем из pending_products
        const { error: deleteError } = await supabase
            .from('pending_products')
            .delete()
            .eq('id', req.params.id);
        
        if (deleteError) throw deleteError;
        
        res.json({ success: true, product: newProduct });
    } catch (err) {
        console.error('❌ Approve product error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ ОТКЛОНЕНИЕ ТОВАРА ============
app.delete('/api/pending-products/:id', async (req, res) => {
    console.log('❌ DELETE /api/pending-products/' + req.params.id);
    try {
        const { error } = await supabase
            .from('pending_products')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Delete pending product error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ УДАЛЕНИЕ ТОВАРА ИЗ PRODUCTS ============
app.delete('/api/products/:id', async (req, res) => {
    console.log('🗑️ DELETE /api/products/' + req.params.id);
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('❌ DELETE product error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ КЛЮЧЕВЫЕ СЛОВА - GET ============
app.get('/api/keywords', async (req, res) => {
    console.log('🏷️ GET /api/keywords');
    try {
        const { data, error } = await supabase
            .from('keywords')
            .select('*')
            .order('name');
        
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('❌ GET keywords error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ КЛЮЧЕВЫЕ СЛОВА - POST ============
app.post('/api/keywords', async (req, res) => {
    console.log('🏷️ POST /api/keywords');
    try {
        const keyword = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            name: req.body.name,
            type: req.body.type || 'Стандарт',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('keywords')
            .insert(keyword)
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error('❌ POST keyword error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ КЛЮЧЕВЫЕ СЛОВА - DELETE ============
app.delete('/api/keywords/:id', async (req, res) => {
    console.log('🏷️ DELETE /api/keywords/' + req.params.id);
    try {
        const { error } = await supabase
            .from('keywords')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('❌ DELETE keyword error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ ИГРОВЫЕ БЛОКИ - GET ============
app.get('/api/game-blocks', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('game_blocks')
            .select('*')
            .order('created_at');
        
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ ТЕСТ БАЗЫ ============
app.get('/api/test-db', async (req, res) => {
    try {
        const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
        
        const { count: pendingCount } = await supabase
            .from('pending_products')
            .select('*', { count: 'exact', head: true });
        
        res.json({
            success: true,
            products_count: productsCount || 0,
            pending_count: pendingCount || 0
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============ OPTIONS ============
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
});

// ============ ВСЕ ОСТАЛЬНЫЕ МАРШРУТЫ ============
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ ЗАПУСК ============
const server = app.listen(PORT, HOST, () => {
    console.log(`✅ Сервер запущен на http://${HOST}:${PORT}`);
    console.log(`📦 GET /api/products - одобренные товары`);
    console.log(`📦 GET /api/pending-products - товары на модерации`);
    console.log(`✅ POST /api/approve-product/:id - одобрить товар`);
});

server.timeout = 120000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;