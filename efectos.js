// Zoom overlay functionality
const zoomOverlay = document.querySelector('.zoom-overlay');
const zoomImage = document.querySelector('.zoom-overlay img');
const zoomCloseBtn = document.querySelector('.zoom-overlay .close-btn');

let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let scale = 1;

// Open zoom
document.querySelectorAll('img[data-zoomable="true"]').forEach(img => {
  img.addEventListener('click', function(e) {
    zoomImage.src = this.src;
    zoomOverlay.classList.add('active');
    scale = 1;
    currentX = 0;
    currentY = 0;
    updateImageTransform();
  });
});

// Close zoom
zoomCloseBtn?.addEventListener('click', () => {
  zoomOverlay.classList.remove('active');
});

zoomOverlay?.addEventListener('click', (e) => {
  if (e.target === zoomOverlay) {
    zoomOverlay.classList.remove('active');
  }
});

// Touch events for zoom overlay
zoomOverlay?.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX - currentX;
    startY = e.touches[0].clientY - currentY;
  } else if (e.touches.length === 2) {
    isDragging = false;
  }
}, { passive: true });

zoomOverlay?.addEventListener('touchmove', (e) => {
  if (isDragging && e.touches.length === 1) {
    currentX = e.touches[0].clientX - startX;
    currentY = e.touches[0].clientY - startY;
    updateImageTransform();
    // Only prevent default if there's actual dragging happening
    if (Math.abs(currentX) > 5 || Math.abs(currentY) > 5) {
      e.preventDefault();
    }
  }
}, { passive: false });

zoomOverlay?.addEventListener('touchend', () => {
  isDragging = false;
}, { passive: true });

// Mouse events for zoom overlay
zoomOverlay?.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDragging && zoomOverlay?.classList.contains('active')) {
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    updateImageTransform();
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Zoom with mouse wheel
zoomOverlay?.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomSpeed = 0.1;
  const oldScale = scale;
  scale += e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
  scale = Math.max(1, Math.min(scale, 3));
  
  if (scale !== oldScale) {
    updateImageTransform();
  }
}, { passive: false });

// Update image transform
function updateImageTransform() {
  zoomImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
}

// Smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Add active state to nav links on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

function updateActiveNavLink() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.pageYOffset >= sectionTop - 60) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNavLink);
updateActiveNavLink();

// Fade in elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// Parallax effect
window.addEventListener('scroll', () => {
  document.querySelectorAll('[data-parallax]').forEach(element => {
    const speed = element.dataset.parallax;
    element.style.transform = `translateY(${window.scrollY * speed}px)`;
  });
});
