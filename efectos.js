// Efecto de visibilidad para imágenes de arte
function mostrarImagenesVisibles() {
    const imagenesArte = document.querySelectorAll('.imagen-arte');
    
    imagenesArte.forEach(imagen => {
        const rect = imagen.getBoundingClientRect();
        const estaVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (estaVisible) {
            imagen.classList.add('visible');
            imagen.style.transform = 'scale(1.08)';
        } else {
            imagen.classList.remove('visible');
            imagen.style.transform = 'scale(1)';
        }
    });
}

// Ejecutar la función al cargar la página
document.addEventListener('DOMContentLoaded', mostrarImagenesVisibles);

// Ejecutar la función cuando se hace scroll
window.addEventListener('scroll', mostrarImagenesVisibles);
