const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ API МАРШРУТЫ ============

// Получить все товары
app.get('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
});

// Добавить товар
app.post('/api/products', async (req, res) => {
    try {
        const product = {
            id: Date.now().toString(),
            title: req.body.title,
            price: req.body.price,
            seller: req.body.seller || 'Admin',
            keyword: req.body.keyword || 'Без категории',
            image_url: req.body.image_url || 'https://picsum.photos/id/42/400/200',
            description: req.body.description || '',
            created_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from('products').insert(product).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удалить товар
app.delete('/api/products/:id', async (req, res) => {
    try {
        await supabase.from('products').delete().eq('id', req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получить ключевые слова
app.get('/api/keywords', async (req, res) => {
    try {
        const { data, error } = await supabase.from('keywords').select('*');
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
});

// Добавить ключевое слово
app.post('/api/keywords', async (req, res) => {
    try {
        const keyword = {
            id: Date.now().toString(),
            name: req.body.name,
            type: req.body.type || 'Стандарт'
        };
        const { data, error } = await supabase.from('keywords').insert(keyword).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удалить ключевое слово
app.delete('/api/keywords/:id', async (req, res) => {
    try {
        await supabase.from('keywords').delete().eq('id', req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Блоки игр
app.get('/api/game-blocks', async (req, res) => {
    try {
        const { data, error } = await supabase.from('game_blocks').select('*');
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/game-blocks', async (req, res) => {
    try {
        const block = {
            id: Date.now().toString(),
            name: req.body.name,
            keyword_id: req.body.keyword_id || '',
            icon: req.body.icon || 'fas fa-gamepad',
            image_url: req.body.image_url || ''
        };
        const { data, error } = await supabase.from('game_blocks').insert(block).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/game-blocks/:id', async (req, res) => {
    try {
        await supabase.from('game_blocks').delete().eq('id', req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Блоки приложений
app.get('/api/app-blocks', async (req, res) => {
    try {
        const { data, error } = await supabase.from('app_blocks').select('*');
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/app-blocks', async (req, res) => {
    try {
        const block = {
            id: Date.now().toString(),
            name: req.body.name,
            keyword_id: req.body.keyword_id || '',
            icon: req.body.icon || 'fab fa-android',
            image_url: req.body.image_url || ''
        };
        const { data, error } = await supabase.from('app_blocks').insert(block).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/app-blocks/:id', async (req, res) => {
    try {
        await supabase.from('app_blocks').delete().eq('id', req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Тест базы данных
app.get('/api/test-db', async (req, res) => {
    try {
        const { data, error } = await supabase.from('keywords').select('*');
        if (error) throw error;
        res.json({ success: true, count: data.length, keywords: data });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Сервер на порту ${PORT}`);
});