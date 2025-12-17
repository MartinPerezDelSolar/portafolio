// Efecto de blur dinámico en scroll
// Efecto de blur dinámico y centrado en scroll
function mostrarImagenesVisibles() {
    const imagenes = document.querySelectorAll('.imagen-arte');
    const centroVentana = window.innerHeight / 2;
    let minDist = Infinity;
    let masCentrada = null;
    imagenes.forEach(img => {
        const rect = img.getBoundingClientRect();
        const centroImg = rect.top + rect.height / 2;
        const distancia = Math.abs(centroImg - centroVentana);
        if (distancia < minDist) {
            minDist = distancia;
            masCentrada = img;
        }
        img.classList.remove('visible');
        img.style.transform = '';
    });
    if (masCentrada) {
        masCentrada.classList.add('visible');
        const rect = masCentrada.getBoundingClientRect();
        const centroImg = rect.top + rect.height / 2;
        const desplazamiento = centroVentana - centroImg;
        masCentrada.style.transform = `scale(1.08) translateY(${desplazamiento}px)`;
    }
}

document.addEventListener('scroll', mostrarImagenesVisibles);
document.addEventListener('DOMContentLoaded', mostrarImagenesVisibles);
window.addEventListener('resize', mostrarImagenesVisibles);

// Ocultar header al hacer scroll
let header = document.querySelector('header');
let scrollDetectado = false;
window.addEventListener('scroll', function() {
    if (!scrollDetectado && window.scrollY > 10) {
        header.classList.add('header-oculto');
        scrollDetectado = true;
    } else if (scrollDetectado && window.scrollY <= 10) {
        header.classList.remove('header-oculto');
        scrollDetectado = false;
    }
});


// Zoom real al hacer click/tap y mover imagen
function crearZoomReal(img) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'zoom-real-overlay';
    // Crear imagen clonada
    const imgZoom = document.createElement('img');
    imgZoom.src = img.src;
    imgZoom.alt = img.alt;
    imgZoom.className = 'zoom-real-img';
    overlay.appendChild(imgZoom);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Centrar la imagen
    let offsetX = 0, offsetY = 0, startX = 0, startY = 0, dragging = false, moved = false;

    function startDrag(e) {
        dragging = true;
        moved = false;
        overlay.style.cursor = 'grabbing';
        if (e.type.startsWith('touch')) {
            startX = e.touches[0].clientX - offsetX;
            startY = e.touches[0].clientY - offsetY;
        } else {
            startX = e.clientX - offsetX;
            startY = e.clientY - offsetY;
        }
        e.preventDefault();
    }
    function onDrag(e) {
        if (!dragging) return;
        let x, y;
        if (e.type.startsWith('touch')) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        offsetX = x - startX;
        offsetY = y - startY;
        imgZoom.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        moved = true;
    }
    function endDrag() {
        dragging = false;
        overlay.style.cursor = 'grab';
    }

    imgZoom.addEventListener('mousedown', startDrag);
    imgZoom.addEventListener('touchstart', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, {passive:false});
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    // Cerrar con click/tap si no se movió (en overlay o imagen)
    function cerrarSiNoMovio() {
        if (!moved) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    }
    overlay.addEventListener('click', cerrarSiNoMovio);
    imgZoom.addEventListener('click', cerrarSiNoMovio);
    overlay.addEventListener('touchend', cerrarSiNoMovio);
    imgZoom.addEventListener('touchend', cerrarSiNoMovio);
    // Prevenir scroll en overlay
    overlay.addEventListener('wheel', e => e.preventDefault(), {passive:false});
}

document.querySelectorAll('.imagen-arte').forEach(img => {
    img.addEventListener('click', function(e) {
        crearZoomReal(img);
    });
    img.addEventListener('touchend', function(e) {
        // Solo abrir si no hubo scroll
        if (e.changedTouches && e.changedTouches.length === 1 && !img.classList.contains('zoom-real-img')) {
            crearZoomReal(img);
        }
    });
});
