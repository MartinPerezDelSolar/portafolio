// ============================================
// EFECTOS.JS - Complete Portfolio Effects System
// Includes: Image focusing, zoom, header hiding, parallax, and fade animations
// Optimized for desktop and mobile (iPhone) devices
// ============================================

// Configuration
const CONFIG = {
  SCROLL_DEBOUNCE_MS: 16, // ~60fps on desktop, ~40fps on mobile
  HEADER_HIDE_THRESHOLD: 50,
  IMAGE_CENTER_THRESHOLD: 0.5,
  PARALLAX_SPEED: 0.5,
  ZOOM_MIN: 1,
  ZOOM_MAX: 3,
  ZOOM_STEP: 0.2,
  FADE_DURATION_MS: 600,
  SCROLL_SMOOTH_DURATION: 300,
};

// State Management
const state = {
  isHeaderVisible: true,
  lastScrollY: 0,
  scrollDirection: 'down',
  isZooming: false,
  currentZoom: 1,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragOffsetX: 0,
  dragOffsetY: 0,
  isScrolling: false,
  scrollTimeout: null,
  lastZoomEvent: 0,
};

// ============================================
// 1. IMAGE FOCUSING AND CENTERING ON SCROLL
// ============================================

/**
 * Mostrar imágenes visibles con efecto de enfoque y centrado
 */
function mostrarImagenesVisibles() {
  const imagenes = document.querySelectorAll('.imagen, [data-imagen], .portfolio-item img');
  
  imagenes.forEach((imagen) => {
    const rect = imagen.getBoundingClientRect();
    const elementHeight = rect.height;
    const viewportHeight = window.innerHeight;
    const elementCenter = rect.top + elementHeight / 2;
    const viewportCenter = viewportHeight / 2;
    
    // Calculate distance from viewport center (0 = perfectly centered)
    const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
    const maxDistance = viewportHeight / 2 + elementHeight / 2;
    const proximidad = Math.max(0, 1 - distanceFromCenter / maxDistance);
    
    // Apply focusing effect
    if (proximidad > CONFIG.IMAGE_CENTER_THRESHOLD) {
      // Image is near center - apply focus effect
      const scale = 0.95 + proximidad * 0.1; // Scale from 0.95 to 1.05
      const opacity = 0.7 + proximidad * 0.3; // Opacity from 0.7 to 1.0
      
      imagen.style.transform = `scale(${scale}) translateZ(0)`;
      imagen.style.opacity = opacity;
      imagen.style.filter = `brightness(${0.85 + proximidad * 0.15})`;
      
      // Add class for centering
      if (proximidad > 0.8) {
        imagen.classList.add('centered-imagen');
        imagen.style.zIndex = 10;
      } else {
        imagen.classList.remove('centered-imagen');
        imagen.style.zIndex = 1;
      }
    } else {
      // Image is away from center
      imagen.style.transform = 'scale(1) translateZ(0)';
      imagen.style.opacity = 0.6;
      imagen.style.filter = 'brightness(0.75)';
      imagen.classList.remove('centered-imagen');
      imagen.style.zIndex = 1;
    }
  });
}

// ============================================
// 2. HEADER HIDING ON SCROLL
// ============================================

/**
 * Mostrar u ocultar header basado en dirección del scroll
 */
function actualizarHeader() {
  const header = document.querySelector('header, .header, nav');
  
  if (!header) return;
  
  const currentScrollY = window.scrollY || window.pageYOffset;
  const isScrollingDown = currentScrollY > state.lastScrollY;
  const scrollDistance = Math.abs(currentScrollY - state.lastScrollY);
  
  // Only update if scroll distance is significant
  if (scrollDistance < 5) return;
  
  state.lastScrollY = currentScrollY;
  state.scrollDirection = isScrollingDown ? 'down' : 'up';
  
  // Hide header when scrolling down past threshold
  if (isScrollingDown && currentScrollY > CONFIG.HEADER_HIDE_THRESHOLD) {
    if (state.isHeaderVisible) {
      header.style.transform = 'translateY(-100%)';
      header.style.opacity = '0';
      header.style.pointerEvents = 'none';
      state.isHeaderVisible = false;
    }
  } 
  // Show header when scrolling up
  else if (!isScrollingDown) {
    if (!state.isHeaderVisible) {
      header.style.transform = 'translateY(0)';
      header.style.opacity = '1';
      header.style.pointerEvents = 'auto';
      state.isHeaderVisible = true;
    }
  }
}

// ============================================
// 3. REAL ZOOM FUNCTIONALITY WITH DRAGGING
// ============================================

/**
 * Initialize zoom functionality for images
 */
function inicializarZoom() {
  const imagenes = document.querySelectorAll('.imagen, [data-imagen], .portfolio-item img');
  
  imagenes.forEach((imagen) => {
    // Create zoom wrapper if not exists
    if (!imagen.parentElement.classList.contains('zoom-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'zoom-wrapper';
      wrapper.style.cssText = `
        position: relative;
        overflow: hidden;
        cursor: zoom-in;
        width: 100%;
      `;
      imagen.parentElement.insertBefore(wrapper, imagen);
      wrapper.appendChild(imagen);
    }
    
    const wrapper = imagen.parentElement;
    
    // Touch support for mobile
    if (isMobileDevice()) {
      wrapper.addEventListener('touchstart', handleZoomTouchStart, { passive: false });
      wrapper.addEventListener('touchmove', handleZoomTouchMove, { passive: false });
      wrapper.addEventListener('touchend', handleZoomTouchEnd, { passive: false });
    }
    
    // Mouse support for desktop
    wrapper.addEventListener('mousedown', handleZoomMouseDown);
    wrapper.addEventListener('mousemove', handleZoomMouseMove);
    wrapper.addEventListener('mouseup', handleZoomMouseUp);
    wrapper.addEventListener('mouseleave', handleZoomMouseUp);
    wrapper.addEventListener('wheel', handleZoomWheel, { passive: false });
  });
}

/**
 * Handle zoom wheel event
 */
function handleZoomWheel(e) {
  if (!e.ctrlKey && !e.metaKey) return;
  
  e.preventDefault();
  
  const now = Date.now();
  if (now - state.lastZoomEvent < 100) return;
  state.lastZoomEvent = now;
  
  const imagen = e.target.closest('.zoom-wrapper')?.querySelector('img') || e.target;
  const zoomDirection = e.deltaY > 0 ? -1 : 1;
  const newZoom = Math.max(CONFIG.ZOOM_MIN, Math.min(CONFIG.ZOOM_MAX, 
    state.currentZoom + zoomDirection * CONFIG.ZOOM_STEP));
  
  applyZoom(imagen, newZoom);
}

/**
 * Handle touch zoom start
 */
function handleZoomTouchStart(e) {
  if (e.touches.length === 2) {
    state.isDragging = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    state.dragStartX = (touch1.clientX + touch2.clientX) / 2;
    state.dragStartY = (touch1.clientY + touch2.clientY) / 2;
    
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    state.initialDistance = distance;
  }
}

/**
 * Handle touch zoom move
 */
function handleZoomTouchMove(e) {
  if (e.touches.length === 2 && state.isDragging) {
    e.preventDefault();
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    const scale = distance / (state.initialDistance || distance);
    const newZoom = Math.max(CONFIG.ZOOM_MIN, Math.min(CONFIG.ZOOM_MAX, 
      state.currentZoom * scale));
    
    const imagen = e.target.closest('.zoom-wrapper')?.querySelector('img') || e.target;
    applyZoom(imagen, newZoom);
  }
}

/**
 * Handle touch zoom end
 */
function handleZoomTouchEnd(e) {
  state.isDragging = false;
  state.initialDistance = 0;
}

/**
 * Handle mouse zoom start
 */
function handleZoomMouseDown(e) {
  if (e.button !== 0) return;
  
  state.isDragging = true;
  state.dragStartX = e.clientX;
  state.dragStartY = e.clientY;
}

/**
 * Handle mouse zoom move
 */
function handleZoomMouseMove(e) {
  if (!state.isDragging) return;
  
  const deltaX = e.clientX - state.dragStartX;
  const deltaY = e.clientY - state.dragStartY;
  const distance = Math.hypot(deltaX, deltaY);
  
  if (distance > 10) {
    state.dragOffsetX = deltaX;
    state.dragOffsetY = deltaY;
  }
}

/**
 * Handle mouse zoom end
 */
function handleZoomMouseUp(e) {
  state.isDragging = false;
  state.dragOffsetX = 0;
  state.dragOffsetY = 0;
}

/**
 * Apply zoom transformation to image
 */
function applyZoom(imagen, zoomLevel) {
  if (!imagen) return;
  
  state.currentZoom = zoomLevel;
  
  const offsetX = state.dragOffsetX * (zoomLevel - 1) / zoomLevel;
  const offsetY = state.dragOffsetY * (zoomLevel - 1) / zoomLevel;
  
  imagen.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px) translateZ(0)`;
  imagen.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
  
  if (zoomLevel > 1) {
    imagen.classList.add('zoomed');
  } else {
    imagen.classList.remove('zoomed');
  }
}

// ============================================
// 4. SMOOTH SCROLL WITH DEBOUNCING
// ============================================

/**
 * Debounced scroll handler to prevent flickering on iPhone
 */
function crearHandlerScroll() {
  let scrollTimer = null;
  
  return function() {
    // Mark that we're scrolling
    state.isScrolling = true;
    document.documentElement.classList.add('is-scrolling');
    
    // Clear previous timer
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
    
    // Debounce actual scroll effects
    clearTimeout(state.scrollTimeout);
    state.scrollTimeout = setTimeout(() => {
      // Update header visibility
      actualizarHeader();
      
      // Update image focusing
      mostrarImagenesVisibles();
      
      // Update parallax
      actualizarParallax();
      
      // Mark scroll as ended
      state.isScrolling = false;
      document.documentElement.classList.remove('is-scrolling');
    }, CONFIG.SCROLL_DEBOUNCE_MS);
  };
}

/**
 * Initialize smooth scrolling behavior
 */
function inicializarScrollSuave() {
  // Use passive event listener for better scroll performance
  const scrollHandler = crearHandlerScroll();
  
  window.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('touchmove', scrollHandler, { passive: true });
  
  // Initial call to set up state
  actualizarHeader();
  mostrarImagenesVisibles();
  actualizarParallax();
}

// ============================================
// 5. PARALLAX EFFECTS
// ============================================

/**
 * Apply parallax effects to elements
 */
function actualizarParallax() {
  const elementos = document.querySelectorAll('[data-parallax], .parallax-element');
  const scrollY = window.scrollY || window.pageYOffset;
  
  elementos.forEach((elemento) => {
    const velocidad = elemento.dataset.parallax || CONFIG.PARALLAX_SPEED;
    const offset = scrollY * velocidad;
    
    elemento.style.transform = `translateY(${offset}px) translateZ(0)`;
  });
}

// ============================================
// 6. FADE-IN ANIMATIONS
// ============================================

/**
 * Initialize fade-in animations for elements
 */
function inicializarAnimacionesFadeIn() {
  const elementos = document.querySelectorAll(
    '[data-fade-in], .fade-in-element, .portfolio-item, article, section'
  );
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) translateZ(0)';
        
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  elementos.forEach((elemento) => {
    // Set initial state
    if (!elemento.classList.contains('fade-in-visible')) {
      elemento.style.opacity = '0';
      elemento.style.transform = 'translateY(20px) translateZ(0)';
      elemento.style.transition = `opacity ${CONFIG.FADE_DURATION_MS}ms ease-out, 
                                    transform ${CONFIG.FADE_DURATION_MS}ms ease-out`;
    }
    
    observer.observe(elemento);
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Detect if device is mobile
 */
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  return mobileRegex.test(userAgent.toLowerCase());
}

/**
 * Request animation frame shim for better performance
 */
function requestAnimationFrameShim(callback) {
  if (window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 1000 / 60);
}

/**
 * Cancel animation frame shim
 */
function cancelAnimationFrameShim(id) {
  if (window.cancelAnimationFrame) {
    return window.cancelAnimationFrame(id);
  }
  return clearTimeout(id);
}

// ============================================
// HEADER STYLES
// ============================================

/**
 * Apply smooth transition styles to header
 */
function aplicarEstilosHeader() {
  const header = document.querySelector('header, .header, nav');
  
  if (header) {
    header.style.transition = 'all 0.3s ease-out';
    header.style.willChange = 'transform, opacity';
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all effects
 */
function inicializarEfectos() {
  // Apply styles
  aplicarEstilosHeader();
  
  // Initialize features
  inicializarScrollSuave();
  inicializarZoom();
  inicializarAnimacionesFadeIn();
  
  // Performance: Use requestAnimationFrame for initial render
  requestAnimationFrameShim(() => {
    mostrarImagenesVisibles();
    actualizarParallax();
  });
}

// ============================================
// AUTO-INITIALIZATION
// ============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarEfectos);
} else {
  // DOM is already loaded
  inicializarEfectos();
}

// Re-initialize on window resize with debouncing
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    mostrarImagenesVisibles();
    actualizarParallax();
  }, 250);
}, { passive: true });

// ============================================
// EXPORTS FOR EXTERNAL USE
// ============================================

// Export functions for external use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mostrarImagenesVisibles,
    actualizarHeader,
    inicializarZoom,
    inicializarScrollSuave,
    actualizarParallax,
    inicializarAnimacionesFadeIn,
    inicializarEfectos,
    isMobileDevice,
    CONFIG,
    state,
  };
}
