// ============================================
// DETALLE.JS - Página de detalle de producto
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    cargarDetalleProducto();
    inicializarMenu();
});

// ----- OBTENER ID DEL PRODUCTO DESDE LA URL -----
function obtenerIdProducto() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// ----- CARGAR DETALLE DEL PRODUCTO -----
function cargarDetalleProducto() {
    const id = obtenerIdProducto();
    const contenedor = document.getElementById('detalleContenido');

    if (!id) {
        contenedor.innerHTML = '<div class="detalle__no-encontrado">⚠️ No se especificó un producto.</div>';
        return;
    }

    contenedor.innerHTML = '<div class="loading-detalle">🌟 Cargando producto...</div>';

    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de productos');
            }
            return response.json();
        })
        .then(data => {
            const producto = data.productos.find(p => p.id === parseInt(id));

            if (!producto) {
                contenedor.innerHTML = '<div class="detalle__no-encontrado">⚠️ Producto no encontrado.</div>';
                return;
            }

            document.title = `${producto.nombre} · Venus Taller`;

            const coloresMap = {
                'Turquesa': '#00BCD4',
                'Morado': '#7C4DFF',
                'Verde Lima': '#32CD32',
                'Multicolor': 'linear-gradient(135deg, #FF4081, #FFD740, #00BCD4)',
                'Rosa': '#FF4081',
                'Amarillo': '#FFD740',
                'Naranjo': '#FF9100',
                'Celeste': '#4DD0E1',
                'Lila': '#CE93D8',
                'Verde': '#66BB6A',
                'Coral': '#FF7043',
                'Dorado': '#FFD700',
                'Plateado': '#B0BEC5',
                'Fucsia': '#E91E63',
                'Blanco': '#FFFFFF',
                'Negro': '#333333',
                'Marrón': '#8D6E63',
                'Azul': '#42A5F5',
                'Rojo': '#EF5350'
            };

            const colorStyle = coloresMap[producto.color] || '#7C4DFF';
            const colorDisplay = typeof colorStyle === 'string' && colorStyle.includes('gradient')
                ? `<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${colorStyle};border:2px solid #eee;vertical-align:middle;margin-right:6px;"></span>`
                : `<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${colorStyle};border:2px solid #eee;vertical-align:middle;margin-right:6px;"></span>`;

            const estadoHtml = producto.disponible
                ? '<span class="detalle__estado detalle__estado--disponible">✅ Disponible</span>'
                : '<span class="detalle__estado detalle__estado--agotado">❌ Agotado</span>';

            const precioFormateado = formatearPrecio(producto.precio);

            // Usar el array imagenes si existe, sino usar imagen sola
            let imagenes = [];
            if (producto.imagenes && producto.imagenes.length > 0) {
                imagenes = producto.imagenes;
            } else if (producto.imagen) {
                imagenes = [producto.imagen];
            }

            let carruselImagenes = '';
            let indicadores = '';

            imagenes.forEach((img, index) => {
                const activa = index === 0 ? 'activa' : '';
                carruselImagenes += `
                    <img src="imagenes/${img}" alt="${producto.nombre}" class="${activa}" data-index="${index}" />
                `;
                indicadores += `
                    <button class="detalle__carrusel-indicador ${activa}" data-index="${index}" aria-label="Imagen ${index + 1}"></button>
                `;
            });

            const mostrarControles = imagenes.length > 1 ? '' : 'style="display:none;"';

            const html = `
                <div class="detalle__grid">
                    <div class="detalle__carrusel">
                        <div class="detalle__carrusel-imagenes" id="carruselImagenes">
                            ${carruselImagenes}
                        </div>
                        <button class="detalle__carrusel-btn detalle__carrusel-btn--prev" id="carruselPrev" ${mostrarControles}>‹</button>
                        <button class="detalle__carrusel-btn detalle__carrusel-btn--next" id="carruselNext" ${mostrarControles}>›</button>
                        <div class="detalle__carrusel-indicadores" id="carruselIndicadores">
                            ${indicadores}
                        </div>
                    </div>

                    <div class="detalle__info">
                        <span class="detalle__categoria">✦ ${producto.categoria}</span>
                        <h1>${producto.nombre}</h1>
                        <div class="detalle__color">${colorDisplay} ${producto.color || ''}</div>
                        <span class="detalle__precio">$${precioFormateado}</span>
                        ${estadoHtml}
                        <p class="detalle__descripcion">${producto.descripcion || 'Descripción no disponible.'}</p>
                        ${producto.disponible 
                            ? `<a href="https://wa.me/56932494839?text=Hola%20Venus%20Taller!%20Me%20interesa%20el%20producto%3A%20${encodeURIComponent(producto.nombre)}%20($${precioFormateado})%20-%20Color%3A%20${encodeURIComponent(producto.color || '')}" 
                                  target="_blank" 
                                  class="btn--whatsapp">
                                  💬 Consultar por WhatsApp
                               </a>`
                            : `<button class="btn--whatsapp" style="background:#ccc;color:#888;cursor:not-allowed;pointer-events:none;" disabled>❌ Agotado</button>`
                        }
                    </div>
                </div>
            `;

            contenedor.innerHTML = html;
            inicializarCarrusel(imagenes.length);
        })
        .catch(error => {
            console.error('Error cargando detalle:', error);
            contenedor.innerHTML = `
                <div class="detalle__no-encontrado">
                    <p>⚠️ No se pudo cargar el producto.</p>
                    <p style="font-size:0.9rem;color:#999;">Verifica que el archivo <strong>productos.json</strong> esté en la misma carpeta.</p>
                </div>
            `;
        });
}

// ----- CARRUSEL -----
function inicializarCarrusel(totalImagenes) {
    if (totalImagenes <= 1) return;

    let indiceActual = 0;
    const imagenes = document.querySelectorAll('#carruselImagenes img');
    const indicadores = document.querySelectorAll('.detalle__carrusel-indicador');
    const btnPrev = document.getElementById('carruselPrev');
    const btnNext = document.getElementById('carruselNext');

    function irA(indice) {
        imagenes.forEach(img => img.classList.remove('activa'));
        indicadores.forEach(ind => ind.classList.remove('activo'));

        imagenes[indice].classList.add('activa');
        indicadores[indice].classList.add('activo');
        indiceActual = indice;
    }

    btnPrev.addEventListener('click', function() {
        const nuevoIndice = (indiceActual - 1 + totalImagenes) % totalImagenes;
        irA(nuevoIndice);
    });

    btnNext.addEventListener('click', function() {
        const nuevoIndice = (indiceActual + 1) % totalImagenes;
        irA(nuevoIndice);
    });

    indicadores.forEach((ind, index) => {
        ind.addEventListener('click', function() {
            irA(index);
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            btnPrev.click();
        } else if (e.key === 'ArrowRight') {
            btnNext.click();
        }
    });
}

// ----- MENÚ MÓVIL -----
function inicializarMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function() {
            nav.classList.toggle('nav--abierto');
        });
    }
}

// ----- FORMATEAR PRECIO -----
function formatearPrecio(precio) {
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
