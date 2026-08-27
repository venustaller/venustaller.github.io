// ============================================
// APP.JS - VENUS TALLER
// Estilo DOPAMINA 💜
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    inicializarFiltros();
    inicializarFAQ();
    inicializarMenu();
    inicializarLeerMas();
});

// ----- CARGAR PRODUCTOS -----
function cargarProductos(filtro = 'todos') {
    const grid = document.getElementById('productosGrid');
    grid.innerHTML = '<div class="loading">🌟 Cargando productos...</div>';

    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de productos');
            }
            return response.json();
        })
        .then(data => {
            if (!data.productos || data.productos.length === 0) {
                grid.innerHTML = '<div class="productos__sin-productos">✨ No hay productos disponibles aún. ¡Vuelve pronto!</div>';
                return;
            }

            const productosFiltrados = filtro === 'todos'
                ? data.productos
                : data.productos.filter(p => p.categoria === filtro);

            if (productosFiltrados.length === 0) {
                grid.innerHTML = '<div class="productos__sin-productos">✨ No hay productos en esta categoría.</div>';
                return;
            }

            // Ordenar: destacados primero
            productosFiltrados.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));

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

            let html = '';
            productosFiltrados.forEach(producto => {
                const precioFormateado = formatearPrecio(producto.precio);
                const imagenSrc = producto.imagen ? `imagenes/${producto.imagen}` : '';
                const imagenHtml = imagenSrc
                    ? `<img src="${imagenSrc}" alt="${producto.nombre}" loading="lazy" onerror="this.style.display='none'; this.parentElement.textContent='📷'">`
                    : '📷 Sin imagen';

                const colorStyle = coloresMap[producto.color] || '#7C4DFF';
                const colorDisplay = typeof colorStyle === 'string' && colorStyle.includes('gradient')
                    ? `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${colorStyle};border:2px solid #eee;vertical-align:middle;margin-right:4px;"></span>`
                    : `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${colorStyle};border:2px solid #eee;vertical-align:middle;margin-right:4px;"></span>`;

                // Estado de disponibilidad
                const estadoHtml = producto.disponible 
                    ? '<span class="producto-card__estado producto-card__estado--disponible">✅ Disponible</span>' 
                    : '<span class="producto-card__estado producto-card__estado--agotado">❌ Agotado</span>';

                // Botón de acción según disponibilidad
                const botonHtml = producto.disponible
                    ? `<a href="https://wa.me/56932494839?text=Hola%20Venus%20Taller!%20Me%20interesa%20el%20producto%3A%20${encodeURIComponent(producto.nombre)}%20($${precioFormateado})%20-%20Color%3A%20${encodeURIComponent(producto.color || '')}" 
                          target="_blank" 
                          class="producto-card__btn">
                          💬 Consultar por WhatsApp
                       </a>`
                    : `<button class="producto-card__btn producto-card__btn--agotado" disabled>❌ Agotado</button>`;

                html += `
                    <div class="producto-card" data-categoria="${producto.categoria}">
                        <div class="producto-card__imagen">
                            ${imagenHtml}
                            ${producto.destacado ? '<div style="position:absolute;top:12px;right:12px;background:linear-gradient(135deg,#FFD740,#FF9100);color:#fff;padding:4px 14px;border-radius:30px;font-size:0.7rem;font-weight:700;font-family:Nunito,sans-serif;">⭐ Destacado</div>' : ''}
                        </div>
                        <div class="producto-card__info">
                            <span class="producto-card__categoria">✦ ${producto.categoria}</span>
                            <h3 class="producto-card__nombre">${producto.nombre}</h3>
                            <div class="producto-card__color">${colorDisplay} ${producto.color || ''}</div>
                            <p class="producto-card__descripcion">${producto.descripcion || ''}</p>
                            <span class="producto-card__precio">$${precioFormateado}</span>
                            ${estadoHtml}
                            ${botonHtml}
                        </div>
                    </div>
                `;
            });

            grid.innerHTML = html;
        })
        .catch(error => {
            console.error('Error cargando productos:', error);
            grid.innerHTML = `
                <div class="productos__sin-productos">
                    <p>⚠️ No se pudieron cargar los productos.</p>
                    <p style="font-size:0.9rem;color:#999;">Verifica que el archivo <strong>productos.json</strong> esté en la misma carpeta que esta página.</p>
                </div>
            `;
        });
}

// ----- FORMATEAR PRECIO -----
function formatearPrecio(precio) {
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ----- FILTROS -----
function inicializarFiltros() {
    const botones = document.querySelectorAll('.filtro-btn');
    botones.forEach(btn => {
        btn.addEventListener('click', function() {
            botones.forEach(b => b.classList.remove('filtro-btn--activo'));
            this.classList.add('filtro-btn--activo');
            const filtro = this.dataset.filtro;
            cargarProductos(filtro);
        });
    });
}

// ----- FAQ (acordeón) -----
function inicializarFAQ() {
    const preguntas = document.querySelectorAll('.faq-item__pregunta');
    preguntas.forEach(pregunta => {
        pregunta.addEventListener('click', function() {
            const item = this.closest('.faq-item');
            const estaAbierto = item.classList.contains('faq-item--abierto');

            // Cerrar todos
            document.querySelectorAll('.faq-item').forEach(el => {
                el.classList.remove('faq-item--abierto');
            });

            // Abrir el que se clickeó si estaba cerrado
            if (!estaAbierto) {
                item.classList.add('faq-item--abierto');
            }
        });
    });

    // Abrir el primero por defecto
    const primerItem = document.querySelector('.faq-item');
    if (primerItem) {
        primerItem.classList.add('faq-item--abierto');
    }
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

// ----- LEER MÁS (Sobre nosotras) -----
function inicializarLeerMas() {
    const btn = document.getElementById('btnLeerMas');
    const contenido = document.getElementById('sobreContenido');

    if (btn && contenido) {
        btn.addEventListener('click', function() {
            const abierto = contenido.classList.toggle('sobre__texto-contenido--abierto');
            btn.textContent = abierto ? '📖 Leer menos' : '📖 Leer más';
            
            if (abierto) {
                contenido.style.maxHeight = 'none';
            } else {
                contenido.style.maxHeight = '';
            }
        });

        if (window.innerWidth <= 768) {
            contenido.classList.remove('sobre__texto-contenido--abierto');
            btn.textContent = '📖 Leer más';
        }
    }
}
