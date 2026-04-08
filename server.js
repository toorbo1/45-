const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());  
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Создаём папки
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Загрузка/сохранение БД
function loadDB() {
  try {
    return JSON.parse(fs.readFileSync('./database.json', 'utf8'));
  } catch {
    const defaultDB = {
      users: [],
      products: [],
      keywords: [],
      gameBlocks: [],
      appBlocks: [],
      messages: []
    };
    saveDB(defaultDB);
    return defaultDB;
  }
}

function saveDB(data) {
  fs.writeFileSync('./database.json', JSON.stringify(data, null, 2));
}

// Инициализация демо-данных
function initDemoData() {
  const db = loadDB();
  
  if (db.keywords.length === 0) {
    db.keywords = [
      { id: uuidv4(), name: "Steam", type: "Premium" },
      { id: uuidv4(), name: "Discord", type: "Nitro" },
      { id: uuidv4(), name: "Netflix", type: "4K" },
      { id: uuidv4(), name: "Spotify", type: "Premium" },
      { id: uuidv4(), name: "YouTube", type: "Premium" }
    ];
  }
  
  if (db.gameBlocks.length === 0) {
    db.gameBlocks = [
      { id: uuidv4(), name: "Steam", keywordId: db.keywords[0]?.id || "", icon: "fab fa-steam", imageUrl: "" },
      { id: uuidv4(), name: "Discord", keywordId: db.keywords[1]?.id || "", icon: "fab fa-discord", imageUrl: "" },
      { id: uuidv4(), name: "Netflix", keywordId: db.keywords[2]?.id || "", icon: "fas fa-tv", imageUrl: "" }
    ];
  }
  
  if (db.products.length === 0) {
    db.products = [
      { id: uuidv4(), title: "Steam Gift Card 1000₽", price: "1000 ₽", seller: "Admin", sellerId: "admin", keywordId: db.keywords[0]?.id, keyword: "Steam", imageUrl: "https://picsum.photos/id/104/400/200", fullDesc: "Моментальная выдача" },
      { id: uuidv4(), title: "Discord Nitro 1 месяц", price: "450 ₽", seller: "Admin", sellerId: "admin", keywordId: db.keywords[1]?.id, keyword: "Discord", imageUrl: "https://picsum.photos/id/106/400/200", fullDesc: "Подписка на месяц" }
    ];
  }
  
  saveDB(db);
}

initDemoData();

// ========== API ==========

// Загрузка изображений
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

// Ключевые слова
app.get('/api/keywords', (req, res) => {
  const db = loadDB();
  res.json(db.keywords);
});

app.post('/api/keywords', (req, res) => {
  const db = loadDB();
  const newKeyword = { id: uuidv4(), name: req.body.name, type: req.body.type || 'Стандарт' };
  db.keywords.push(newKeyword);
  saveDB(db);
  res.json(newKeyword);
});

app.delete('/api/keywords/:id', (req, res) => {
  const db = loadDB();
  db.keywords = db.keywords.filter(k => k.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Блоки игр
app.get('/api/game-blocks', (req, res) => {
  const db = loadDB();
  res.json(db.gameBlocks);
});

app.post('/api/game-blocks', (req, res) => {
  const db = loadDB();
  const newBlock = {
    id: uuidv4(),
    name: req.body.name,
    keywordId: req.body.keywordId || '',
    icon: req.body.icon || 'fas fa-gamepad',
    imageUrl: req.body.imageUrl || ''
  };
  db.gameBlocks.push(newBlock);
  saveDB(db);
  res.json(newBlock);
});

app.delete('/api/game-blocks/:id', (req, res) => {
  const db = loadDB();
  db.gameBlocks = db.gameBlocks.filter(b => b.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.put('/api/game-blocks/:id', (req, res) => {
  const db = loadDB();
  const index = db.gameBlocks.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    db.gameBlocks[index] = { ...db.gameBlocks[index], ...req.body };
    saveDB(db);
    res.json(db.gameBlocks[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Блоки приложений
app.get('/api/app-blocks', (req, res) => {
  const db = loadDB();
  res.json(db.appBlocks);
});

app.post('/api/app-blocks', (req, res) => {
  const db = loadDB();
  const newBlock = {
    id: uuidv4(),
    name: req.body.name,
    keywordId: req.body.keywordId || '',
    icon: req.body.icon || 'fab fa-android',
    imageUrl: req.body.imageUrl || ''
  };
  db.appBlocks.push(newBlock);
  saveDB(db);
  res.json(newBlock);
});

app.delete('/api/app-blocks/:id', (req, res) => {
  const db = loadDB();
  db.appBlocks = db.appBlocks.filter(b => b.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.put('/api/app-blocks/:id', (req, res) => {
  const db = loadDB();
  const index = db.appBlocks.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    db.appBlocks[index] = { ...db.appBlocks[index], ...req.body };
    saveDB(db);
    res.json(db.appBlocks[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Товары
app.get('/api/products', (req, res) => {
  const db = loadDB();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = loadDB();
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    sales: 0,
    rating: 5.0
  };
  db.products.unshift(newProduct);
  saveDB(db);
  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = loadDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    saveDB(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const db = loadDB();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Пользователи
app.post('/api/users/login', (req, res) => {
  const db = loadDB();
  const { username } = req.body;
  let user = db.users.find(u => u.username === username);
  
  if (!user) {
    user = {
      id: uuidv4(),
      username,
      balance: 0,
      joinedDate: new Date().toISOString(),
      rating: 5.0,
      reviewsCount: 0,
      productsCount: 0
    };
    db.users.push(user);
    saveDB(db);
  }
  
  res.json(user);
});

// WebSocket чат
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('user-connected', (username) => {
    connectedUsers.set(socket.id, username);
    io.emit('users-online', Array.from(connectedUsers.values()));
  });
  
  socket.on('send-message', (data) => {
    const { to, message, from, fromName } = data;
    const messageData = {
      id: uuidv4(),
      from,
      fromName,
      to,
      text: message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const db = loadDB();
    if (!db.messages) db.messages = [];
    db.messages.push(messageData);
    saveDB(db);
    
    io.emit('new-message', messageData);
  });
  
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    io.emit('users-online', Array.from(connectedUsers.values()));
  });
});
// Google Auth - регистрация/вход через Google
app.post('/api/users/google-auth', (req, res) => {
  const db = loadDB();
  const { id, email, username, picture } = req.body;
  
  let user = db.users.find(u => u.email === email || u.googleId === id);
  
  if (!user) {
    user = {
      id: uuidv4(),
      username: username,
      email: email,
      googleId: id,
      picture: picture,
      balance: 0,
      joinedDate: new Date().toISOString(),
      rating: 5.0,
      reviewsCount: 0,
      productsCount: 0
    };
    db.users.push(user);
    saveDB(db);
  } else {
    // Обновляем данные пользователя если нужно
    user.username = username;
    user.picture = picture;
    saveDB(db);
  }
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    balance: user.balance,
    joinedDate: user.joinedDate
  });
});
app.get('/api/messages/:userId/:partnerId', (req, res) => {
  const db = loadDB();
  const messages = (db.messages || []).filter(m => 
    (m.from === req.params.userId && m.to === req.params.partnerId) ||
    (m.from === req.params.partnerId && m.to === req.params.userId)
  );
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  const db = loadDB();
  res.json(db.users.map(u => ({ id: u.id, username: u.username })));
});

// Статистика пользователя
app.get('/api/users/:id/stats', (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.params.id);
  const userProducts = db.products.filter(p => p.sellerId === req.params.id);
  
  res.json({
    balance: user?.balance || 0,
    productsCount: userProducts.length,
    purchasesCount: user?.purchasesCount || 0,
    salesCount: user?.salesCount || 0,
    rating: user?.rating || 5.0,
    reviewsCount: user?.reviewsCount || 0
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://0.0.0.0:${PORT}`);
  console.log(`📁 uploads: ./uploads`);
  console.log(`💾 database: ./database.json`);
});