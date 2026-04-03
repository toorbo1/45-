// Управление чатами - только Поддержка (всегда онлайн)
let dialogs = [];
let currentDialogId = null;
let currentUser = null;

// Функция инициализации чатов
function initChats() {
  // Получаем текущего пользователя
  currentUser = localStorage.getItem("apex_user") || "Гость";
  
  const stored = localStorage.getItem("apex_dialogs");
  if (stored) {
    dialogs = JSON.parse(stored);
    // Проверяем, что диалог с поддержкой существует и корректен
    const supportExists = dialogs.find(d => d.id === "support");
    if (!supportExists) {
      dialogs = [createSupportDialog()];
      localStorage.setItem("apex_dialogs", JSON.stringify(dialogs));
    }
  } else {
    // Только диалог с поддержкой
    dialogs = [createSupportDialog()];
    localStorage.setItem("apex_dialogs", JSON.stringify(dialogs));
  }
  
  renderDialogsList();
  
  // Открываем диалог с поддержкой автоматически
  if (dialogs.length > 0 && !currentDialogId) {
    openDialog("support");
  }
}

// Создание диалога с поддержкой
function createSupportDialog() {
  return { 
    id: "support", 
    name: "Поддержка", 
    avatar: "🎧", 
    preview: "Чем можем помочь? Мы на связи 24/7", 
    date: "сегодня", 
    unread: 0,
    online: true,  // Всегда онлайн
    messages: [
      { 
        user: "Support", 
        text: "✨ Добро пожаловать в службу поддержки Плейнексис!\n\nЯ здесь, чтобы помочь вам с любыми вопросами:\n• Покупка и оплата товаров\n• Проблемы с получением товара\n• Возврат средств\n• Вопросы по аккаунту\n\nНапишите ваш вопрос, и я отвечу как можно быстрее! 💬", 
        time: getCurrentTime(), 
        timestamp: new Date().toISOString(),
        isRead: true 
      }
    ] 
  };
}

// Получение текущего времени
function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Рендер списка диалогов (только поддержка)
function renderDialogsList(searchTerm = "") {
  const container = document.getElementById("dialogsList");
  if (!container) return;
  
  // Всегда показываем только поддержку
  const supportDialog = dialogs.find(d => d.id === "support");
  if (!supportDialog) return;
  
  const lastMessage = supportDialog.messages && supportDialog.messages.length > 0 ? 
    supportDialog.messages[supportDialog.messages.length - 1] : null;
  const previewText = lastMessage ? 
    (lastMessage.user === "system" ? "📢 " + lastMessage.text : 
     (lastMessage.user === currentUser ? "Вы: " + lastMessage.text : lastMessage.text)) : 
    "Напишите ваш вопрос";
  
  container.innerHTML = `
    <div class="dialog-item ${currentDialogId === supportDialog.id ? 'active' : ''}" data-dialog-id="support">
      <div class="dialog-avatar" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
        ${supportDialog.avatar || "🎧"}
        <span class="online-indicator"></span>
      </div>
      <div class="dialog-info">
        <div class="dialog-name">
          <span>${escapeHtml(supportDialog.name)}</span>
          <span class="dialog-date">${supportDialog.date || "онлайн"}</span>
        </div>
        <div class="dialog-preview">
          ${escapeHtml(previewText.substring(0, 45))}
          ${supportDialog.unread > 0 ? `<span class="unread-badge">${supportDialog.unread}</span>` : ''}
        </div>
      </div>
    </div>
  `;
  
  // Добавляем обработчик клика
  const dialogEl = container.querySelector('.dialog-item');
  if (dialogEl) {
    dialogEl.addEventListener('click', () => {
      openDialog("support");
      if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("chatsSidebar");
        const chatWindow = document.getElementById("chatWindow");
        if (sidebar && chatWindow) {
          sidebar.classList.add("hidden-mobile");
          chatWindow.classList.add("active-mobile");
        }
      }
    });
  }
  
  updateUnreadCount();
}

// Открытие диалога (всегда поддержка)
function openDialog(id) {
  if (id !== "support") return; // Только поддержка доступна
  
  const dialog = dialogs.find(d => d.id === "support");
  if (!dialog) return;
  
  currentDialogId = "support";
  
  // Сбрасываем непрочитанные
  if (dialog.unread > 0) {
    dialog.unread = 0;
    localStorage.setItem("apex_dialogs", JSON.stringify(dialogs));
    renderDialogsList();
  }
  
  // Обновляем заголовок чата
  const partnerNameEl = document.getElementById("chatPartnerName");
  const partnerAvatarEl = document.getElementById("chatPartnerAvatar");
  const partnerStatusEl = document.getElementById("chatPartnerStatus");
  
  if (partnerNameEl) partnerNameEl.innerText = dialog.name;
  if (partnerAvatarEl) partnerAvatarEl.innerHTML = dialog.avatar || "🎧";
  if (partnerStatusEl) {
    partnerStatusEl.innerHTML = '<span class="status-online"></span> онлайн (отвечаем 24/7)';
  }
  
  renderMessages("support");
  markMessagesAsRead("support");
}

// Отметить сообщения как прочитанные
function markMessagesAsRead(dialogId) {
  const dialog = dialogs.find(d => d.id === dialogId);
  if (dialog && dialog.messages) {
    let updated = false;
    dialog.messages.forEach(msg => {
      if (msg.user !== currentUser && !msg.isRead) {
        msg.isRead = true;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem("apex_dialogs", JSON.stringify(dialogs));
    }
  }
}

// Замените функцию renderMessages в chats.js на эту:

function renderMessages(dialogId) {
  const dialog = dialogs.find(d => d.id === dialogId);
  const area = document.getElementById("chatMessagesArea");
  if (!area || !dialog) return;
  
  if (!dialog.messages || dialog.messages.length === 0) {
    area.innerHTML = `
      <div class="empty-messages">
        <i class="fas fa-headset"></i>
        <p>Чат с поддержкой</p>
        <span>Напишите ваш вопрос, и мы поможем!</span>
      </div>
    `;
    return;
  }
  
  // Группируем сообщения по датам
  let lastDate = null;
  let messagesHtml = '';
  
  dialog.messages.forEach((msg, idx) => {
    const msgDate = new Date(msg.timestamp || Date.now());
    const today = new Date();
    const isToday = msgDate.toDateString() === today.toDateString();
    const dateStr = isToday ? 'Сегодня' : 
                    (msgDate.toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Вчера' :
                    msgDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }));
    
    if (dateStr !== lastDate) {
      messagesHtml += `<div class="date-divider"><span>${dateStr}</span></div>`;
      lastDate = dateStr;
    }
    
    const isOut = msg.user === currentUser;
    const bubbleClass = isOut ? "out" : "in";
    const alignClass = isOut ? "outgoing" : "incoming";
    const showAvatar = !isOut && (idx === 0 || dialog.messages[idx-1]?.user !== msg.user);
    
    // Экранируем и обрабатываем переносы строк, но сохраняем пробелы
    let formattedText = escapeHtml(msg.text);
    // Заменяем переносы строк на <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    // Добавляем перенос для очень длинных слов (CSS уже справится)
    
    messagesHtml += `
      <div class="message-group ${alignClass}" data-message-idx="${idx}">
        ${!isOut && showAvatar ? `<div class="message-avatar">${dialog.avatar || "🎧"}</div>` : ''}
        <div class="message-content" style="max-width: 100%; min-width: 0;">
          <div class="message-bubble ${bubbleClass}" style="word-break: break-word; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">
            ${msg.user === "system" ? '<i class="fas fa-info-circle"></i> ' : ''}
            ${formattedText}
          </div>
          <div class="message-time">
            ${msg.time || msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            ${isOut ? (msg.isRead ? '<i class="fas fa-check-double read-icon"></i>' : '<i class="fas fa-check sent-icon"></i>') : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  area.innerHTML = messagesHtml;
  area.scrollTop = area.scrollHeight;
}
// Отправка сообщения в поддержку
function sendChatMessage() {
  const input = document.getElementById("chatMessageInput");
  const text = input.value.trim();
  if (!text) return;
  
  const dialog = dialogs.find(d => d.id === "support");
  if (!dialog) return;
  
  if (!dialog.messages) dialog.messages = [];
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMessage = {
    user: currentUser,
    text: text,
    time: timeStr,
    timestamp: now.toISOString(),
    isRead: false
  };
  
  dialog.messages.push(newMessage);
  dialog.preview = text.substring(0, 40);
  dialog.date = "сегодня";
  
  localStorage.setItem("apex_dialogs", JSON.stringify(dialogs));
  renderMessages("support");
  renderDialogsList();
  input.value = "";
  
  // Эффект пульсации при отправке
  const sendBtn = document.getElementById("sendChatMsgBtn");
  if (sendBtn) {
    sendBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { if(sendBtn) sendBtn.style.transform = ''; }, 150);
  }
  
  // Эмулируем ответ поддержки (автоответ через 2-3 секунды)
  setTimeout(() => {
    simulateSupportResponse(text);
  }, 2000 + Math.random() * 2000);
}

// Автоответ поддержки
function simulateSupportResponse(userMessage) {
  const dialog = dialogs.find(d => d.id === "support");
  if (!dialog) return;
  
  // Разные варианты ответов в зависимости от вопроса
  let responseText = "";
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes("привет") || lowerMessage.includes("здравствуй") || lowerMessage.includes("добрый")) {
    responseText = "Здравствуйте! 👋 Рады вас видеть в Плейнексис. Чем могу помочь?";
  } 
  else if (lowerMessage.includes("цена") || lowerMessage.includes("стоимость") || lowerMessage.includes("сколько")) {
    responseText = "💰 Все цены указаны на карточках товаров. Если нужна скидка — напишите, возможно, мы сможем предложить персональное предложение!";
  }
  else if (lowerMessage.includes("доставка") || lowerMessage.includes("получить") || lowerMessage.includes("когда")) {
    responseText = "🚀 Доставка товаров происходит моментально после оплаты. Если вы не получили товар в течение 5 минут — обратитесь к нам, и мы решим проблему!";
  }
  else if (lowerMessage.includes("возврат") || lowerMessage.includes("вернуть")) {
    responseText = "🔄 Гарантия возврата действует 24 часа после покупки. Если товар не соответствует описанию или вы его не получили — мы вернём полную сумму. Напишите номер заказа, и я помогу!";
  }
  else if (lowerMessage.includes("скидка") || lowerMessage.includes("акция") || lowerMessage.includes("промокод")) {
    responseText = "🏷️ Подпишитесь на наш Telegram-канал, чтобы получать промокоды на скидку! Актуальные акции всегда на главной странице.";
  }
  else if (lowerMessage.includes("спасибо") || lowerMessage.includes("благодарю")) {
    responseText = "Пожалуйста! 😊 Рады помочь. Обращайтесь, если будут ещё вопросы!";
  }
  else if (lowerMessage.includes("как дела") || lowerMessage.includes("как ты")) {
    responseText = "У нас всё отлично! 💪 Стараемся работать для вас 24/7. Чем могу помочь?";
  }
  else {
    responseText = "Спасибо за обращение! 🙏 Наш специалист скоро свяжется с вами. Если вопрос срочный, напишите 'срочно', и мы ускорим ответ.";
    
    if (lowerMessage.includes("срочно")) {
      responseText = "🚨 Срочный запрос принят! Передаю оператору. Пожалуйста, ожидайте, ответим в течение минуты!";
    }
  }
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  dialog.messages.push({
    user: "Support",
    text: responseText,
    time: timeStr,
    timestamp: now.toISOString(),
    isRead: false
  });
  
  dialog.unread = (dialog.unread || 0) + 1;
  localStorage.setItem("apex_dialogs", JSON.stringify(dialogs));
  
  if (currentDialogId === "support") {
    renderMessages("support");
    // Прокрутка вниз
    const area = document.getElementById("chatMessagesArea");
    if (area) area.scrollTop = area.scrollHeight;
  }
  renderDialogsList();
  
  // Воспроизводим звук уведомления (если поддерживается)
  try {
    const audio = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch(e) {}
}

// Обновление счетчика непрочитанных
function updateUnreadCount() {
  const totalUnread = dialogs.reduce((sum, d) => sum + (d.unread || 0), 0);
  const unreadBadge = document.querySelector('.unread-total-badge');
  if (unreadBadge) {
    if (totalUnread > 0) {
      unreadBadge.style.display = 'flex';
      unreadBadge.textContent = totalUnread > 99 ? '99+' : totalUnread;
    } else {
      unreadBadge.style.display = 'none';
    }
  }
}

// Поиск диалогов (но у нас только поддержка, поэтому скрываем поиск)
function setupChatSearch() {
  const searchInput = document.getElementById("chatSearchInput");
  if (searchInput) {
    // Скрываем поиск, так как только один диалог
    const searchContainer = searchInput.closest('.chat-search');
    if (searchContainer) searchContainer.style.display = 'none';
  }
}

// Мобильная навигация
function setupMobileChat() {
  const backBtn = document.getElementById("backToChatList");
  const sidebar = document.getElementById("chatsSidebar");
  const chatWindow = document.getElementById("chatWindow");
  
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (sidebar && chatWindow) {
        sidebar.classList.remove("hidden-mobile");
        chatWindow.classList.remove("active-mobile");
      }
    });
  }
}

// Замените функцию escapeHtml в chats.js на эту:

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/ /g, ' ')  // Сохраняем пробелы
    .replace(/\t/g, '    '); // Заменяем табуляцию на пробелы
}

// Экспорт в глобальный объект
window.initChats = initChats;
window.openDialog = openDialog;
window.sendChatMessage = sendChatMessage;
window.renderDialogsList = renderDialogsList;