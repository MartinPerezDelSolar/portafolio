
// --- Carrusel 3D robusto ---
const imagenes = [
    "imagenes/imagen1.jpg",
    "imagenes/imagen2.jpg",
    "imagenes/imagen3.jpg",
    "imagenes/imagen4.jpg",
    "imagenes/imagen5.jpg",
    "imagenes/imagen6.jpg",
    "imagenes/imagen7.jpg",
    "imagenes/imagen8.jpg",
    "imagenes/imagen9.jpg",
    "imagenes/imagen10.jpg",
    "imagenes/imagen11.jpg"
];

const galeria = document.getElementById('galeria-3d');
let actual = 0;
let animando = false;
let touchStartX = null;

function renderCarrusel() {
    // Renderizar todas las imágenes y animar solo con clases
    if (galeria.childElementCount !== imagenes.length) {
        galeria.innerHTML = '';
        imagenes.forEach((src, i) => {
            const img = document.createElement('img');
            img.className = 'img-3d';
            img.src = src;
            img.alt = `Obra ${i+1}`;
            img.addEventListener('click', () => {
                let rel = i - actual;
                // Ajustar para el ciclo circular
                if (rel > imagenes.length/2) rel -= imagenes.length;
                if (rel < -imagenes.length/2) rel += imagenes.length;
                if (rel !== 0 && !animando) {
                    moverCarrusel(rel > 0 ? 1 : -1);
                } else if (rel === 0) {
                    mostrarZoom(img.src, img.alt);
                }
            });
            galeria.appendChild(img);
        });
    }
    const imgs = galeria.querySelectorAll('.img-3d');
    imgs.forEach((img, i) => {
        let offset = i - actual;
        // Hacer circular el offset para que nunca salte de un lado al otro
        if (offset > imagenes.length / 2) offset -= imagenes.length;
        if (offset < -imagenes.length / 2) offset += imagenes.length;
        img.className = 'img-3d';
        if (offset === 0) img.classList.add('activa');
        else if (offset === -1) img.classList.add('prev');
        else if (offset === 1) img.classList.add('next');
        else if (offset === -2) img.classList.add('prev2');
        else if (offset === 2) img.classList.add('next2');
        // Solo mostrar las 5 centrales, el resto oculto
        if (Math.abs(offset) > 2) {
            img.style.opacity = '0';
            img.style.pointerEvents = 'none';
            img.style.zIndex = '0';
        } else {
            img.style.opacity = '';
            img.style.pointerEvents = '';
            img.style.zIndex = '';
        }
    });
    // Forzar reflujo para asegurar la transición
    void galeria.offsetWidth;
}

function moverCarrusel(salto) {
    if (animando) return;
    animando = true;
    // Quitar clases para transición de salida
    const imgs = galeria.querySelectorAll('.img-3d');
    imgs.forEach(img => {
        img.classList.remove('activa','prev','next','prev2','next2');
    });
    // Forzar reflujo para que el navegador procese la transición de salida
    void galeria.offsetWidth;
    setTimeout(() => {
        // Limitar el salto a solo 1 posición por animación
        const realSalto = salto > 0 ? 1 : -1;
        actual = (actual + realSalto + imagenes.length) % imagenes.length;
        renderCarrusel();
        setTimeout(() => { animando = false; }, 500);
    }, 40);
}

function mostrarZoom(src, alt) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.bottom = 0;
    overlay.style.background = 'rgba(30,30,30,0.85)';
    overlay.style.zIndex = 9999;
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.cursor = 'zoom-out';
    const imgZoom = document.createElement('img');
    imgZoom.src = src;
    imgZoom.alt = alt;
    imgZoom.style.maxWidth = '98vw';
    imgZoom.style.maxHeight = '98vh';
    imgZoom.style.borderRadius = '1.2rem';
    imgZoom.style.boxShadow = '0 0 80px 0 rgba(0,0,0,0.45)';
    imgZoom.style.background = '#fff';
    imgZoom.style.transition = 'transform 0.3s';
    imgZoom.style.transform = 'scale(0.8)';
    overlay.appendChild(imgZoom);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    setTimeout(() => { imgZoom.style.transform = 'scale(1)'; }, 10);
    function cerrar() {
        imgZoom.style.transform = 'scale(0.8)';
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 180);
    }
    overlay.addEventListener('click', cerrar);
    imgZoom.addEventListener('click', cerrar);
}


galeria.addEventListener('wheel', e => {
    if (animando) return;
    let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    // Solo usar la dirección, ignorar la magnitud
    if (delta > 0) moverCarrusel(1);
    else if (delta < 0) moverCarrusel(-1);
    e.preventDefault();
    e.stopPropagation();
});


galeria.addEventListener('touchstart', e => {
    if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
}, {passive:false});
galeria.addEventListener('touchmove', e => {
    if (touchStartX === null) return;
    const dx = e.touches[0].clientX - touchStartX;
    if (Math.abs(dx) > 30) {
        if (dx < 0) moverCarrusel(1);
        else if (dx > 0) moverCarrusel(-1);
        touchStartX = null;
    }
}, {passive:false});

document.addEventListener('DOMContentLoaded', renderCarrusel);
window.addEventListener('resize', renderCarrusel);
