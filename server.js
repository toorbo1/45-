const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: SUPABASE_URL или SUPABASE_KEY не найдены');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase подключён');

// ============ API ТОВАРЫ ============

// Получить все товары
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Ошибка GET /products:', err);
    res.status(500).json({ error: err.message });
  }
});

// Добавить товар
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = {
      id: uuidv4(),
      title: req.body.title,
      price: req.body.price,
      seller: req.body.seller || 'Гость',
      seller_id: req.body.seller_id || 'guest',
      keyword: req.body.keyword || '',
      keyword_id: req.body.keyword_id || '',
      image_url: req.body.image_url || '',
      description: req.body.description || '',
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Ошибка POST /products:', err);
    res.status(500).json({ error: err.message });
  }
});

// Удалить товар
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ API КЛЮЧЕВЫЕ СЛОВА ============

app.get('/api/keywords', async (req, res) => {
  try {
    const { data, error } = await supabase.from('keywords').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/keywords', async (req, res) => {
  try {
    const newKeyword = {
      id: uuidv4(),
      name: req.body.name,
      type: req.body.type || 'Стандарт'
    };
    
    const { data, error } = await supabase.from('keywords').insert([newKeyword]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ API ПОЛЬЗОВАТЕЛИ ============

app.post('/api/users/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (!user) {
      const newUser = {
        id: uuidv4(),
        username: username,
        balance: 0,
        joined_date: new Date().toISOString(),
        rating: 5.0,
        reviews_count: 0
      };
      
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select();
      
      if (insertError) throw insertError;
      user = data[0];
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('balance')
      .eq('id', req.params.id)
      .single();
    
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', req.params.id);
    
    res.json({
      balance: user?.balance || 0,
      productsCount: productsCount || 0,
      purchasesCount: 0,
      salesCount: 0,
      rating: 5.0,
      reviewsCount: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ API ИГРЫ И ПРИЛОЖЕНИЯ ============

app.get('/api/game-blocks', async (req, res) => {
  try {
    const { data, error } = await supabase.from('game_blocks').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/app-blocks', async (req, res) => {
  try {
    const { data, error } = await supabase.from('app_blocks').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ТЕСТОВЫЙ МАРШРУТ ============

app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('keywords').select('*');
    if (error) throw error;
    res.json({ 
      success: true, 
      message: 'База данных работает!',
      count: data.length,
      keywords: data 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ЗАПУСК СЕРВЕРА ============
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🔗 Ссылка: http://localhost:${PORT}`);
});