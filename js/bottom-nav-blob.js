// ========== НИЖНЯЯ ПАНЕЛЬ С LIQUID BLOB ЭФФЕКТОМ ==========

(function() {
    let navItems = null;
    let mainBlob = null;
    let container = null;
    let particlesContainer = null;
    let currentTab = 'home';
    let isAnimating = false;
    let animTimer = null;

    // Функция для получения позиции кнопки
    function getButtonPos(tabId) {
        const btn = document.querySelector(`.nav-item[data-nav="${tabId}"]`);
        if (!btn) return null;
        const containerRect = container.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        return {
            left: btnRect.left - containerRect.left,
            width: btnRect.width,
            center: (btnRect.left - containerRect.left) + btnRect.width / 2
        };
    }

    // Установка позиции блоба
    function setBlobPos(left, width, withTransition = true) {
        if (!mainBlob) return;
        if (withTransition) {
            mainBlob.style.transition = 'left 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), width 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        } else {
            mainBlob.style.transition = 'none';
        }
        mainBlob.style.left = left + 'px';
        mainBlob.style.width = width + 'px';
        if (!withTransition) {
            void mainBlob.offsetHeight;
        }
    }

    // Создание частиц при клике
    function createParticles(x, y, count = 6) {
        if (!particlesContainer) return;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.background = '#0A5C3E';
            p.style.borderRadius = '50%';
            p.style.pointerEvents = 'none';
            const size = 2 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            const dist = 12 + Math.random() * 30;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist - 8;
            
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = (x - size/2) + 'px';
            p.style.top = (y - size/2) + 'px';
            p.style.opacity = '0.5';
            
            particlesContainer.appendChild(p);
            
            requestAnimationFrame(() => {
                p.style.transition = 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.2)';
                p.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.1)';
                p.style.opacity = '0';
            });
            
            setTimeout(() => p.remove(), 400);
        }
    }

    // Анимация перехода между вкладками
    function animateToTab(newTabId) {
        if (isAnimating) return;
        if (currentTab === newTabId) return;
        
        isAnimating = true;
        
        const fromPos = getButtonPos(currentTab);
        const toPos = getButtonPos(newTabId);
        if (!fromPos || !toPos) {
            isAnimating = false;
            return;
        }
        
        const fromCenter = fromPos.center;
        const toCenter = toPos.center;
        
        // Частицы на старте
        createParticles(fromCenter, 28, 5);
        
        // Анимация блоба
        mainBlob.style.transition = 'left 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), width 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        mainBlob.style.left = toPos.left + 'px';
        mainBlob.style.width = toPos.width + 'px';
        
        // Частицы в конце
        createParticles(toCenter, 28, 6);
        
        if (animTimer) clearTimeout(animTimer);
        animTimer = setTimeout(() => {
            // Пульсация
            mainBlob.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.25s ease';
            mainBlob.style.transform = 'scale(1.04)';
            mainBlob.style.boxShadow = '0 12px 28px rgba(6, 78, 52, 0.6)';
            
            setTimeout(() => {
                mainBlob.style.transform = 'scale(1)';
                mainBlob.style.boxShadow = '0 8px 20px rgba(6, 78, 52, 0.5)';
            }, 250);
            
            setTimeout(() => {
                mainBlob.style.transition = '';
            }, 300);
            
            // Обновляем активные кнопки
            if (navItems) {
                navItems.forEach(item => {
                    const tab = item.getAttribute('data-nav');
                    if (tab === newTabId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
            
            currentTab = newTabId;
            isAnimating = false;
            animTimer = null;
        }, 400);
    }

    // Переключение страницы (интеграция с существующей навигацией)
    function switchToPage(pageId) {
        if (typeof window.navigate === 'function') {
            window.navigate(pageId);
        } else if (typeof window.showPage === 'function') {
            window.showPage(pageId);
        } else {
            console.warn('Navigation function not found');
        }
    }

    // Инициализация blob навигации
    function initBlobNavigation() {
        navItems = document.querySelectorAll('.nav-item');
        mainBlob = document.getElementById('mainBlob');
        container = document.getElementById('navContainer');
        particlesContainer = document.getElementById('particlesContainer');
        
        if (!mainBlob || !container) {
            console.warn('Blob navigation elements not found');
            return;
        }
        
        // Устанавливаем начальную позицию блоба
        const homePos = getButtonPos('home');
        if (homePos) {
            mainBlob.style.left = homePos.left + 'px';
            mainBlob.style.width = homePos.width + 'px';
        }
        
        // Устанавливаем активную кнопку
        const activeBtn = document.querySelector('.nav-item.active');
        if (activeBtn && activeBtn.getAttribute('data-nav')) {
            currentTab = activeBtn.getAttribute('data-nav');
        } else {
            document.querySelector('.nav-item[data-nav="home"]')?.classList.add('active');
        }
        
        // Добавляем обработчики
        navItems.forEach(item => {
            // Удаляем старые обработчики, если есть
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabId = newItem.getAttribute('data-nav');
                if (tabId && tabId !== 'plus') {
                    animateToTab(tabId);
                    switchToPage(tabId);
                }
            });
        });
        
        // Обновляем navItems
        navItems = document.querySelectorAll('.nav-item');
        
        // Обработчик ресайза
        let resizeTimer;
        window.addEventListener('resize', () => {
            if (isAnimating) return;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const pos = getButtonPos(currentTab);
                if (pos) {
                    mainBlob.style.transition = 'none';
                    mainBlob.style.left = pos.left + 'px';
                    mainBlob.style.width = pos.width + 'px';
                    void mainBlob.offsetHeight;
                }
            }, 100);
        });
        
        // Начальная анимация
        setTimeout(() => {
            const pos = getButtonPos(currentTab);
            if (pos) {
                mainBlob.style.transition = 'transform 0.25s ease';
                mainBlob.style.transform = 'scale(1.02)';
                setTimeout(() => mainBlob.style.transform = 'scale(1)', 200);
                setTimeout(() => mainBlob.style.transition = '', 250);
            }
        }, 300);
    }

    // Экспортируем функцию
    window.initBlobNavigation = initBlobNavigation;
    
    // Автоматическая инициализация после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlobNavigation);
    } else {
        initBlobNavigation();
    }
})();