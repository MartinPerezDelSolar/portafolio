// Mostrar imágenes visibles y aplicar escala al más centrado
function mostrarImagenesVisibles() {
  const container = document.querySelector('.carousel-inner');
  const images = container.querySelectorAll('img');
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;

  let imagenMasCentrada = null;
  let distanciaMinima = Infinity;

  images.forEach(img => {
    const imgRect = img.getBoundingClientRect();
    const imgCenter = imgRect.left + imgRect.width / 2;
    const distancia = Math.abs(imgCenter - containerCenter);

    // Aplicar escala normal
    img.style.transform = 'scale(1)';

    // Encontrar imagen más centrada
    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      imagenMasCentrada = img;
    }
  });

  // Aplicar escala aumentada a la imagen más centrada
  if (imagenMasCentrada) {
    imagenMasCentrada.style.transform = 'scale(1.08)';
  }
}

// Ocultar/mostrar header al hacer scroll
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling hacia abajo
    header.style.transform = 'translateY(-100%)';
    header.style.transition = 'transform 0.3s ease-in-out';
  } else {
    // Scrolling hacia arriba
    header.style.transform = 'translateY(0)';
    header.style.transition = 'transform 0.3s ease-in-out';
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Zoom overlay functionality
function initZoomOverlay() {
  const zoomImages = document.querySelectorAll('img[data-zoom]');
  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay hidden';
  overlay.innerHTML = `
    <div class="zoom-container">
      <img class="zoom-image" src="" alt="Zoom">
      <button class="close-zoom">&times;</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const zoomImage = overlay.querySelector('.zoom-image');
  const closeBtn = overlay.querySelector('.close-zoom');

  zoomImages.forEach(img => {
    img.addEventListener('click', (e) => {
      zoomImage.src = img.src;
      overlay.classList.remove('hidden');
    });

    img.addEventListener('touch', (e) => {
      zoomImage.src = img.src;
      overlay.classList.remove('hidden');
    });
  });

  function closeCurrent() {
    overlay.classList.add('hidden');
  }

  closeBtn.addEventListener('click', closeCurrent);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeCurrent();
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCurrent();
    }
  });
}

// Inicializar zoom cuando el DOM está listo
document.addEventListener('DOMContentLoaded', initZoomOverlay);

// Llamar a mostrarImagenesVisibles al cargar y cuando cambia el carousel
window.addEventListener('load', mostrarImagenesVisibles);
document.addEventListener('slide.bs.carousel', mostrarImagenesVisibles);
