// Debounce timeout variable
let scrollTimeout;

// Function to show visible images with original funcionamiento code
function mostrarImagenesVisibles() {
    const imagenes = document.querySelectorAll('img[data-src]');
    
    imagenes.forEach(img => {
        const rect = img.getBoundingClientRect();
        const isVisible = (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
        );
        
        if (isVisible && !img.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            
            // Image focusing and centering
            img.style.objectFit = 'cover';
            img.style.objectPosition = 'center';
        }
    });
}

// Debounced scroll event handler
function debouncedMostrarImagenesVisibles() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        mostrarImagenesVisibles();
    }, 16); // 16ms timeout for smooth scrolling (60fps)
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', mostrarImagenesVisibles);

// Add debounced scroll listener
window.addEventListener('scroll', debouncedMostrarImagenesVisibles, { passive: true });

// Optional: Also call on resize
window.addEventListener('resize', debouncedMostrarImagenesVisibles);