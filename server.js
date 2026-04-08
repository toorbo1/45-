const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ============ КРИТИЧЕСКИ ВАЖНО: порт для Render ============
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0'; // Важно для Render

// ============ Middleware ============
app.use(cors({
    origin: '*', // Для тестирования, в продакшене ограничить
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============ Логирование запросов ============
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ============ Статические файлы ============
app.use(express.static(path.join(__dirname, 'public')));

// ============ Supabase ============
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ОШИБКА: SUPABASE_URL или SUPABASE_KEY не заданы в переменных окружения!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase подключен');

// ============ HEALTH CHECK (важно для Render) ============
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============ ROOT - проверка работы ============
app.get('/', (req, res) => {
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
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        console.log(`✅ Отправлено ${data?.length || 0} товаров`);
        res.json(data || []);
    } catch (err) {
        console.error('❌ GET products error:', err);
        res.status(500).json({ error: err.message, products: [] });
    }
});

// ТОВАРЫ - POST
app.post('/api/products', async (req, res) => {
    console.log('📦 POST /api/products, body:', req.body);
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
        
        console.log('✅ Товар создан:', data[0].id);
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
        
        console.log('✅ Товар удален:', req.params.id);
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
        
        console.log(`✅ Отправлено ${data?.length || 0} ключевых слов`);
        res.json(data || []);
    } catch (err) {
        console.error('❌ GET keywords error:', err);
        res.status(500).json({ error: err.message, keywords: [] });
    }
});

// КЛЮЧЕВЫЕ СЛОВА - POST
app.post('/api/keywords', async (req, res) => {
    console.log('🏷️ POST /api/keywords, body:', req.body);
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
        
        console.log('✅ Ключевое слово создано:', data[0].id);
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
        
        console.log('✅ Ключевое слово удалено:', req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ DELETE keyword error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============ ТЕСТ БАЗЫ ДАННЫХ ============
app.get('/api/test-db', async (req, res) => {
    console.log('🔧 GET /api/test-db');
    try {
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('count');
        
        const { data: keywords, error: keywordsError } = await supabase
            .from('keywords')
            .select('count');
        
        res.json({
            success: true,
            products_count: products?.[0]?.count || 0,
            keywords_count: keywords?.[0]?.count || 0,
            products_error: productsError?.message || null,
            keywords_error: keywordsError?.message || null
        });
    } catch (err) {
        console.error('❌ Test DB error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============ ВСЕ ОСТАЛЬНЫЕ МАРШРУТЫ ============
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ ЗАПУСК СЕРВЕРА ============
const server = app.listen(PORT, HOST, () => {
    console.log(`✅ Сервер запущен на http://${HOST}:${PORT}`);
    console.log(`📋 Health check: http://${HOST}:${PORT}/health`);
    console.log(`📦 API products: http://${HOST}:${PORT}/api/products`);
    console.log(`🏷️ API keywords: http://${HOST}:${PORT}/api/keywords`);
});

// Обработка ошибок сервера
server.on('error', (error) => {
    console.error('❌ Сервер ошибка:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Порт ${PORT} уже используется`);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM получен, закрываем сервер...');
    server.close(() => {
        console.log('Сервер закрыт');
        process.exit(0);
    });
});