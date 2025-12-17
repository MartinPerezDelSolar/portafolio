// Image focusing and centering functionality
function setupImageFocus() {
  const images = document.querySelectorAll('.imagen-arte');
  
  images.forEach(image => {
    image.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Remove focus from any previously focused image
      const previouslyFocused = document.querySelector('.imagen-arte.focused');
      if (previouslyFocused && previouslyFocused !== this) {
        previouslyFocused.classList.remove('focused');
      }
      
      // Toggle focus on current image
      this.classList.toggle('focused');
      
      if (this.classList.contains('focused')) {
        // Center the image in viewport
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hideHeader();
      } else {
        showHeader();
      }
    });
  });
  
  // Click outside to unfocus
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.imagen-arte')) {
      const focusedImage = document.querySelector('.imagen-arte.focused');
      if (focusedImage) {
        focusedImage.classList.remove('focused');
        showHeader();
      }
    }
  });
}

// Header visibility control
function hideHeader() {
  const header = document.querySelector('.header');
  if (header) {
    header.style.display = 'none';
  }
}

function showHeader() {
  const header = document.querySelector('.header');
  if (header) {
    header.style.display = '';
  }
}

// Smooth scrolling for gallery scroll container
function setupGalleryScroll() {
  const scrollContainer = document.querySelector('.galeria-scroll');
  
  if (!scrollContainer) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
  scrollContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
    scrollContainer.style.cursor = 'grabbing';
  });
  
  scrollContainer.addEventListener('mouseleave', () => {
    isDown = false;
    scrollContainer.style.cursor = 'grab';
  });
  
  scrollContainer.addEventListener('mouseup', () => {
    isDown = false;
    scrollContainer.style.cursor = 'grab';
  });
  
  scrollContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });
  
  // Touch support for mobile devices
  scrollContainer.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });
  
  scrollContainer.addEventListener('touchend', () => {
    isDown = false;
  });
  
  scrollContainer.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });
}

// iPhone scroll optimization
function optimizeIPhoneScroll() {
  const iPhoneDetected = /iPhone|iPod/.test(navigator.userAgent);
  
  if (iPhoneDetected) {
    document.addEventListener('touchmove', function(e) {
      const scrollContainer = document.querySelector('.galeria-scroll');
      
      if (scrollContainer && scrollContainer.contains(e.target)) {
        // Allow default behavior for gallery scroll
        return;
      }
      
      // Prevent default bounce scroll for other elements
      if (e.target.closest('.imagen-arte')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Add -webkit-overflow-scrolling for smooth momentum scrolling
    const scrollableElements = document.querySelectorAll('.galeria-scroll');
    scrollableElements.forEach(element => {
      element.style.webkitOverflowScrolling = 'touch';
    });
  }
}

// Initialize all effects when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  setupImageFocus();
  setupGalleryScroll();
  optimizeIPhoneScroll();
  
  // Re-initialize if DOM changes
  const observer = new MutationObserver(function() {
    setupImageFocus();
    setupGalleryScroll();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// Cleanup function for removing focus
function clearImageFocus() {
  const focusedImage = document.querySelector('.imagen-arte.focused');
  if (focusedImage) {
    focusedImage.classList.remove('focused');
    showHeader();
  }
}