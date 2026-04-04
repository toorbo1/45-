// slider.js (необязательно, но добавим более красивые картинки для слайдера)
let currentSlide = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide-img');
const sliderImages = document.getElementById('sliderImages');
const totalSlides = slides.length;

// Заменяем стандартные изображения на более привлекательные (можно оставить свои)
if (slides.length >= 3) {
  slides[0].src = "https://picsum.photos/id/106/800/300";
  slides[1].src = "https://picsum.photos/id/20/800/300";
  slides[2].src = "https://picsum.photos/id/104/800/300";
}

function updateSlider() {
  sliderImages.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function createDots() {
  const container = document.getElementById('sliderDots');
  container.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      currentSlide = i;
      updateSlider();
      resetInterval();
    });
    container.appendChild(dot);
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlider();
}

function resetInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 4000);
}

createDots();
slideInterval = setInterval(nextSlide, 4000);


// Мини-слайдеры с кнопками управления
let sliders = [];

function initMiniSliders() {
  const slidersConfig = [
    { id: 0, imagesId: 'slider0Images', dotsId: 'slider0Dots', totalSlides: 4 },
    { id: 1, imagesId: 'slider1Images', dotsId: 'slider1Dots', totalSlides: 4 },
    { id: 2, imagesId: 'slider2Images', dotsId: 'slider2Dots', totalSlides: 4 },
    { id: 3, imagesId: 'slider3Images', dotsId: 'slider3Dots', totalSlides: 4 }
  ];
  
  slidersConfig.forEach(config => {
    initSlider(config.id, config.imagesId, config.dotsId, config.totalSlides);
  });
}

function initSlider(sliderId, imagesId, dotsId, totalSlides) {
  let currentSlide = 0;
  let slideInterval;
  const sliderImages = document.getElementById(imagesId);
  const dotsContainer = document.getElementById(dotsId);
  
  if (!sliderImages || !dotsContainer) return;
  
  // Создаем точки
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('mini-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      currentSlide = i;
      updateSlider();
      resetInterval();
    });
    dotsContainer.appendChild(dot);
  }
  
  function updateSlider() {
    sliderImages.style.transform = `translateX(-${currentSlide * 100}%)`;
    const dots = dotsContainer.querySelectorAll('.mini-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
  }
  
  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 4000);
  }
  
  // Добавляем обработчики для кнопок
  const prevBtn = document.querySelector(`.slider-nav-btn.prev[data-slider="${sliderId}"]`);
  const nextBtn = document.querySelector(`.slider-nav-btn.next[data-slider="${sliderId}"]`);
  
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      resetInterval();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      resetInterval();
    });
  }
  
  // Автоматическая прокрутка
  resetInterval();
  
  // Пауза при наведении
  const container = document.querySelector(`.slider-card:has([data-slider="${sliderId}"])`);
  if (container) {
    container.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
    });
    container.addEventListener('mouseleave', () => {
      slideInterval = setInterval(nextSlide, 4000);
    });
  }
}

// Запускаем инициализацию
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initMiniSliders, 100);
});

// Применение object-fit: contain ко всем изображениям в слайдерах
function fixSliderImages() {
  const images = document.querySelectorAll('.mini-slide-img, .slide-img');
  images.forEach(img => {
    img.style.objectFit = 'contain';
    img.style.aspectRatio = '4/3';
    img.style.background = '#0a0a0a';
  });
}

// ========== ПРИНУДИТЕЛЬНОЕ ИСПРАВЛЕНИЕ ИЗОБРАЖЕНИЙ В СЛАЙДЕРАХ ==========
(function() {
  // Проверяем и исправляем все изображения в слайдерах
  function fixAllSliderImages() {
    // Находим все изображения в мини-слайдерах
    const allSliderImages = document.querySelectorAll('.mini-slide-img, .slide-img');
    
    allSliderImages.forEach(img => {
      // Принудительно применяем стили
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.aspectRatio = '4/3';
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.backgroundColor = '#0a0a0a';
      
      // Если изображение загружено, проверяем его пропорции
      if (img.complete) {
        adjustImageByRatio(img);
      } else {
        img.onload = function() {
          adjustImageByRatio(img);
        };
      }
    });
  }
  
  // Функция для подстройки под соотношение
  function adjustImageByRatio(img) {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      
      // Если изображение слишком узкое (вертикальное)
      if (ratio < 0.8) {
        img.style.objectFit = 'contain';
        img.style.padding = '20% 0';
      }
      // Если изображение слишком широкое (горизонтальное)
      else if (ratio > 1.6) {
        img.style.objectFit = 'contain';
        img.style.padding = '0 10%';
      }
      // Нормальное изображение
      else {
        img.style.objectFit = 'contain';
        img.style.padding = '0';
      }
    }
  }
  
  // Заменяем изображения на корректные (с подходящим форматом)
  function replaceWithGoodImages() {
    // Список хороших изображений с форматом ~16:9 или 4:3
    const goodImages = [
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=800&h=600&fit=crop'
    ];
    
    // Заменяем все изображения в слайдерах
    const sliderImages = document.querySelectorAll('.mini-slide-img');
    let imgIndex = 0;
    
    sliderImages.forEach(img => {
      const newSrc = goodImages[imgIndex % goodImages.length];
      if (newSrc) {
        img.src = newSrc;
        img.style.aspectRatio = '4/3';
        img.style.objectFit = 'cover';
      }
      imgIndex++;
    });
  }
  
  // Запускаем исправления
  setTimeout(function() {
    fixAllSliderImages();
    // Если хотите заменить изображения на хорошие - раскомментируйте следующую строку
    // replaceWithGoodImages();
  }, 100);
  
  // Следим за изменениями в DOM
  const observer = new MutationObserver(function() {
    fixAllSliderImages();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

// Запускаем после загрузки и при каждой смене слайда
setTimeout(fixSliderImages, 100);
setInterval(fixSliderImages, 500);

// Фикс для мини-слайдеров на мобильных
function fixMiniSlidersOnMobile() {
  const isMobile = window.innerWidth <= 768;
  const slides = document.querySelectorAll('.mini-slide-img');
  
  slides.forEach(img => {
    if (isMobile) {
      img.style.objectFit = 'contain';
      img.style.aspectRatio = '4/3';
      img.style.backgroundColor = '#0a0a0a';
      img.style.padding = '4px';
    } else {
      img.style.objectFit = 'cover';
      img.style.padding = '0';
    }
  });
}

// Запускаем при загрузке и изменении размера
window.addEventListener('load', fixMiniSlidersOnMobile);
window.addEventListener('resize', fixMiniSlidersOnMobile);