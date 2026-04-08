const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;
// ПОДАЧА СТАТИЧЕСКИХ ФАЙЛОВ (HTML, CSS, JS)
app.use(express.static('public'));

// ОБРАБОТКА ГЛАВНОЙ СТРАНИЦЫ
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Создаём папки
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// ========== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype));
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// ========== ИНИЦИАЛИЗАЦИЯ ТАБЛИЦ В SUPABASE ==========
async function initSupabaseTables() {
  // Проверяем и создаем таблицы через SQL (нужно выполнить один раз в Supabase SQL Editor)
  console.log('✅ Используется Supabase');
  
  // Проверяем наличие данных
  const { data: keywords } = await supabase.from('keywords').select('*');
  
  if (!keywords || keywords.length === 0) {
    console.log('📦 Загрузка демо-данных в Supabase...');
    
    // Добавляем ключевые слова
    const demoKeywords = [
      { id: uuidv4(), name: "Steam", type: "Premium" },
      { id: uuidv4(), name: "Discord", type: "Nitro" },
      { id: uuidv4(), name: "Netflix", type: "4K" },
      { id: uuidv4(), name: "Spotify", type: "Premium" },
      { id: uuidv4(), name: "YouTube", type: "Premium" }
    ];
    
    for (const kw of demoKeywords) {
      await supabase.from('keywords').insert(kw);
    }
    
    // Добавляем блоки игр
    const gameBlocks = [
      { id: uuidv4(), name: "Steam", keyword_id: demoKeywords[0].id, icon: "fab fa-steam", image_url: "" },
      { id: uuidv4(), name: "Discord", keyword_id: demoKeywords[1].id, icon: "fab fa-discord", image_url: "" },
      { id: uuidv4(), name: "Netflix", keyword_id: demoKeywords[2].id, icon: "fas fa-tv", image_url: "" },
      { id: uuidv4(), name: "Roblox", keyword_id: "", icon: "fab fa-fort-awesome", image_url: "" },
      { id: uuidv4(), name: "Minecraft", keyword_id: "", icon: "fas fa-cube", image_url: "" },
      { id: uuidv4(), name: "Valorant", keyword_id: "", icon: "fas fa-crosshairs", image_url: "" }
    ];
    
    for (const block of gameBlocks) {
      await supabase.from('game_blocks').insert(block);
    }
    
    // Добавляем блоки приложений
    const appBlocks = [
      { id: uuidv4(), name: "Telegram", keyword_id: "", icon: "fab fa-telegram", image_url: "" },
      { id: uuidv4(), name: "WhatsApp", keyword_id: "", icon: "fab fa-whatsapp", image_url: "" },
      { id: uuidv4(), name: "Instagram", keyword_id: "", icon: "fab fa-instagram", image_url: "" },
      { id: uuidv4(), name: "TikTok", keyword_id: "", icon: "fab fa-tiktok", image_url: "" },
      { id: uuidv4(), name: "YouTube", keyword_id: "", icon: "fab fa-youtube", image_url: "" }
    ];
    
    for (const block of appBlocks) {
      await supabase.from('app_blocks').insert(block);
    }
    
    // Добавляем товары
    const products = [
      { 
        id: uuidv4(), 
        title: "Steam Gift Card 1000₽", 
        price: "1000 ₽", 
        seller: "Admin", 
        seller_id: "admin",
        keyword_id: demoKeywords[0].id,
        keyword: "Steam",
        image_url: "https://picsum.photos/id/104/400/200",
        full_desc: "Моментальная выдача. Гарантия качества.",
        sales: 1250,
        rating: 5.0,
        created_at: new Date().toISOString()
      },
      { 
        id: uuidv4(), 
        title: "Discord Nitro 1 месяц", 
        price: "450 ₽", 
        seller: "Admin", 
        seller_id: "admin",
        keyword_id: demoKeywords[1].id,
        keyword: "Discord",
        image_url: "https://picsum.photos/id/106/400/200",
        full_desc: "Подписка на месяц. Моментальная выдача.",
        sales: 3420,
        rating: 4.9,
        created_at: new Date().toISOString()
      }
    ];
    
    for (const product of products) {
      await supabase.from('products').insert(product);
    }
    
    console.log('✅ Демо-данные загружены в Supabase');
  }
}

// Запускаем инициализацию
initSupabaseTables().catch(console.error);

// ========== API КЛЮЧЕВЫЕ СЛОВА ==========
app.get('/api/keywords', async (req, res) => {
  try {
    const { data, error } = await supabase.from('keywords').select('*').order('name');
    if (error) throw error;
    res.json(data);
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
    const { data, error } = await supabase.from('keywords').insert(newKeyword).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/keywords/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('keywords').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== API БЛОКИ ИГР ==========
app.get('/api/game-blocks', async (req, res) => {
  try {
    const { data, error } = await supabase.from('game_blocks').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/game-blocks', async (req, res) => {
  try {
    const newBlock = {
      id: uuidv4(),
      name: req.body.name,
      keyword_id: req.body.keywordId || '',
      icon: req.body.icon || 'fas fa-gamepad',
      image_url: req.body.imageUrl || ''
    };
    const { data, error } = await supabase.from('game_blocks').insert(newBlock).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/game-blocks/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('game_blocks')
      .update({
        name: req.body.name,
        keyword_id: req.body.keywordId,
        icon: req.body.icon,
        image_url: req.body.imageUrl
      })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/game-blocks/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('game_blocks').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== API БЛОКИ ПРИЛОЖЕНИЙ ==========
app.get('/api/app-blocks', async (req, res) => {
  try {
    const { data, error } = await supabase.from('app_blocks').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/app-blocks', async (req, res) => {
  try {
    const newBlock = {
      id: uuidv4(),
      name: req.body.name,
      keyword_id: req.body.keywordId || '',
      icon: req.body.icon || 'fab fa-android',
      image_url: req.body.imageUrl || ''
    };
    const { data, error } = await supabase.from('app_blocks').insert(newBlock).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/app-blocks/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('app_blocks')
      .update({
        name: req.body.name,
        keyword_id: req.body.keywordId,
        icon: req.body.icon,
        image_url: req.body.imageUrl
      })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/app-blocks/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('app_blocks').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== API ТОВАРЫ ==========
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = {
      id: uuidv4(),
      title: req.body.title,
      price: req.body.price,
      original_price: req.body.originalPrice || null,
      discount: req.body.discount || null,
      seller: req.body.seller,
      seller_id: req.body.sellerId,
      keyword_id: req.body.keywordId,
      keyword: req.body.keyword,
      type: req.body.type || 'Стандарт',
      image_url: req.body.imageUrl || 'https://picsum.photos/id/42/400/200',
      full_desc: req.body.fullDesc,
      sales: 0,
      rating: 5.0,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    const { data, error } = await supabase.from('products').insert(newProduct).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        title: req.body.title,
        price: req.body.price,
        original_price: req.body.originalPrice,
        discount: req.body.discount,
        full_desc: req.body.fullDesc,
        image_url: req.body.imageUrl,
        keyword_id: req.body.keywordId,
        keyword: req.body.keyword
      })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== API ПОЛЬЗОВАТЕЛИ ==========
app.post('/api/users/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Ищем пользователя
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (!user) {
      // Создаем нового пользователя
      const newUser = {
        id: uuidv4(),
        username: username,
        balance: 0,
        joined_date: new Date().toISOString(),
        rating: 5.0,
        reviews_count: 0,
        products_count: 0,
        purchases_count: 0,
        sales_count: 0
      };
      
      const { data, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();
      
      if (insertError) throw insertError;
      user = data;
    }
    
    // Получаем количество товаров пользователя
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id);
    
    user.products_count = productsCount;
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', req.params.username)
      .single();
    
    if (error) throw error;
    
    // Получаем товары пользователя
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id);
    
    res.json({
      ...user,
      products_count: products?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/balance', async (req, res) => {
  try {
    const { username, balance } = req.body;
    const { error } = await supabase
      .from('users')
      .update({ balance })
      .eq('username', username);
    
    if (error) throw error;
    res.json({ success: true, balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Auth
app.post('/api/users/google-auth', async (req, res) => {
  try {
    const { id, email, username, picture } = req.body;
    
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!user) {
      const newUser = {
        id: uuidv4(),
        username: username,
        email: email,
        google_id: id,
        picture: picture,
        balance: 0,
        joined_date: new Date().toISOString(),
        rating: 5.0,
        reviews_count: 0,
        products_count: 0
      };
      
      const { data, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();
      
      if (insertError) throw insertError;
      user = data;
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ТЕСТОВЫЙ МАРШРУТ ==========
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

// ========== WEBSOCKET ДЛЯ ЧАТА ==========
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('user-connected', (username) => {
    connectedUsers.set(socket.id, username);
    io.emit('users-online', Array.from(connectedUsers.values()));
  });
  
  socket.on('send-message', async (data) => {
    const { to, message, from, fromName } = data;
    const messageData = {
      id: uuidv4(),
      from_user_id: from,
      from_name: fromName,
      to_user_id: to,
      text: message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Сохраняем в Supabase
    await supabase.from('messages').insert(messageData);
    
    io.emit('new-message', messageData);
  });
  
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    io.emit('users-online', Array.from(connectedUsers.values()));
  });
});

// ========== ЗАПУСК СЕРВЕРА ==========
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://0.0.0.0:${PORT}`);
  console.log(`📁 uploads: ./uploads`);
  console.log(`🗄️ Supabase подключен`);
});