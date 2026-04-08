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

// Trust proxy - важно для Cloudflare
app.set('trust proxy', true);

// Парсинг JSON и URL-encoded
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============ Логирование ВСЕХ запросов ============
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log(`  Headers:`, {
        'user-agent': req.headers['user-agent']?.substring(0, 50),
        'cf-ray': req.headers['cf-ray'],
        'x-forwarded-for': req.headers['x-forwarded-for']
    });
    next();
});

// ============ Статические файлы ============
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        // Кэширование для статики
        if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
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

// ============ HEALTH CHECK (важно для Cloudflare) ============
app.get('/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// ============ ROOT - проверка работы ============
app.get('/', (req, res) => {
    console.log('🏠 Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ API МАРШРУТЫ ============

// ТОВАРЫ - GET
app.get('/api/products', async (req, res) => {
    console.log('📦 GET /api/products');
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.setHeader('Content-Type', 'application/json');
        res.json(data || []);
    } catch (err) {
        console.error('❌ GET products error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ТОВАРЫ - POST
app.post('/api/products', async (req, res) => {
    console.log('📦 POST /api/products');
    try {
        const product = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            title: req.body.title,
            price: req.body.price,
            seller: req.body.seller || 'Admin',
            keyword: req.body.keyword || 'Без категории',
            image_url: req.body.image_url || 'https://picsum.photos/id/42/400/200',
            description: req.body.description || '',
            discount: req.body.discount || null,
            original_price: req.body.originalPrice || null,
            created_at: new Date().toISOString()
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

// ТОВАРЫ - DELETE
app.delete('/api/products/:id', async (req, res) => {
    console.log('📦 DELETE /api/products/' + req.params.id);
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

// КЛЮЧЕВЫЕ СЛОВА - GET
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

// КЛЮЧЕВЫЕ СЛОВА - POST
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

// КЛЮЧЕВЫЕ СЛОВА - DELETE
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

// ТЕСТ БАЗЫ ДАННЫХ
app.get('/api/test-db', async (req, res) => {
    console.log('🔧 GET /api/test-db');
    try {
        const { count: productsCount, error: productsError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
        
        const { count: keywordsCount, error: keywordsError } = await supabase
            .from('keywords')
            .select('*', { count: 'exact', head: true });
        
        res.json({
            success: true,
            products_count: productsCount || 0,
            keywords_count: keywordsCount || 0,
            products_error: productsError?.message || null,
            keywords_error: keywordsError?.message || null
        });
    } catch (err) {
        console.error('❌ Test DB error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============ Обработка OPTIONS запросов (CORS preflight) ============
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
});

// ============ ВСЕ ОСТАЛЬНЫЕ МАРШРУТЫ ============
app.get('*', (req, res) => {
    console.log('📄 Serving index.html for:', req.url);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ Обработка ошибок ============
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============ ЗАПУСК СЕРВЕРА ============
const server = app.listen(PORT, HOST, () => {
    console.log(`✅ Сервер запущен на http://${HOST}:${PORT}`);
    console.log(`📋 Health check: /health`);
    console.log(`📦 API products: /api/products`);
    console.log(`🏷️ API keywords: /api/keywords`);
    console.log(`🔧 Test DB: /api/test-db`);
});

// Таймаут соединения - важно для Cloudflare
server.timeout = 120000; // 2 минуты
server.keepAliveTimeout = 65000; // 65 секунд
server.headersTimeout = 66000; // 66 секунд

// Обработка ошибок сервера
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});