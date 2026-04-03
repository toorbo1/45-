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