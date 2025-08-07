let menu = []; // aca se guardan todos los productos

let historialPedidos = JSON.parse(localStorage.getItem("historialPedidos")) || [];

const numerosValidos = historialPedidos.map(p => p.numero).filter(n => typeof n === 'number' && !isNaN(n));
let contadorPedidos = numerosValidos.length > 0 ? Math.max(...numerosValidos) : historialPedidos.length;
const contenedorMenu = document.getElementById("menu-container");
const contenedorCarrito = document.getElementById("carrito-container");
const contenedorTotal = document.getElementById("total-container");
const mensajeDiv = document.getElementById("mensaje");
const botonConfirmar = document.getElementById("confirmar-btn");
const botonVaciar = document.getElementById("vaciar-btn");
const botonHistorial = document.getElementById("historial-btn");



async function cargarProductos() {
  try {
    const response = await fetch('./db/data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    menu = data.productos;
    renderMenu();
  } catch (error) {
    console.error('Error cargando productos:', error);
    mostrarSweetAlert("Error", "No se pudieron cargar los productos", "error");
  } finally {
    renderCarrito();
  }
}

function renderMenu() {
  contenedorMenu.innerHTML = "";
  menu.forEach(producto => {
    const prodDiv = document.createElement("div");
    prodDiv.className = "producto-card";
    prodDiv.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" onerror="this.src='https://via.placeholder.com/300x200/cccccc/666666?text=${encodeURIComponent(producto.nombre)}'">
      <div class="producto-info">
        <h3>${producto.nombre}</h3>
        <p class="descripcion">${producto.descripcion}</p>
        <p class="precio">$${producto.precio.toLocaleString()}</p>
        <button class="agregar-btn" data-id="${producto.id}">Agregar al carrito</button>
      </div>
    `;
    prodDiv.querySelector(".agregar-btn").addEventListener("click", () => agregarProductoAlCarrito(producto.id));
    contenedorMenu.appendChild(prodDiv);
  });
}

function agregarProductoAlCarrito(id) {
  const producto = agregarAlCarrito(id, menu);
  if (producto) {
    renderCarrito();
    mostrarSweetAlert("¡Agregado!", producto.nombre + " agregado al carrito", "success");
  }
}

function renderCarrito() {
  contenedorCarrito.innerHTML = "";
  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    contenedorCarrito.innerHTML = "<em>El carrito está vacío.</em>";
    contenedorTotal.textContent = "";
    return;
  }
  
  carrito.forEach((producto, i) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "carrito-item";
    itemDiv.innerHTML = `
      <div class="item-info">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="item-imagen" onerror="this.src='https://via.placeholder.com/40x40/cccccc/666666?text=${encodeURIComponent(producto.nombre.charAt(0))}'">
        <div class="item-details">
          <h4>${producto.nombre}</h4>
          <p class="item-precio">$${producto.precio.toLocaleString()}</p>
        </div>
      </div>
      <div class="item-controles">
        <button class="cantidad-btn" data-index="${i}" data-action="restar">-</button>
        <span class="cantidad">${producto.cantidad}</span>
        <button class="cantidad-btn" data-index="${i}" data-action="sumar">+</button>
        <button class="eliminar-btn" data-index="${i}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    
    itemDiv.querySelectorAll(".cantidad-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        const action = e.target.dataset.action;
        if (action === "sumar") {
          incrementarCantidadProducto(index);
        } else if (action === "restar") {
          decrementarCantidadProducto(index);
        }
      });
    });
    
    itemDiv.querySelector(".eliminar-btn").addEventListener("click", () => quitarProductoDelCarrito(i));
    
    contenedorCarrito.appendChild(itemDiv);
  });
  
  contenedorTotal.textContent = `Total: $${calcularTotal().toLocaleString()}`;
}

function incrementarCantidadProducto(index) {
  incrementarCantidad(index);
  renderCarrito(); // actualizo el carrito
}

function decrementarCantidadProducto(index) {
  const fueEliminado = decrementarCantidad(index);
  if (!fueEliminado) {
    renderCarrito();
  } else {
    renderCarrito();
    mostrarSweetAlert("Eliminado", "Producto eliminado del carrito", "warning");
  }
}

function quitarProductoDelCarrito(index) {
  const productoEliminado = quitarDelCarrito(index);
  renderCarrito();
  mostrarSweetAlert("Eliminado", `${productoEliminado.nombre} eliminado del carrito`, "warning");
}

function guardarHistorial() {
  localStorage.setItem("historialPedidos", JSON.stringify(historialPedidos));
}

function mostrarSweetAlert(titulo, mensaje, tipo = "info") {
  const iconos = {
    success: "success",
    error: "error", 
    warning: "warning",
    info: "info"
  };
  
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: iconos[tipo] || "info",
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
}

async function mostrarOpcionesPago() {
  const { value: metodoPago } = await Swal.fire({
    title: 'Método de Pago',
    text: 'Seleccioná cómo querés pagar:',
    icon: 'question',
    input: 'radio',
    inputOptions: {
      'efectivo': '<i class="fas fa-money-bill-wave"></i> Efectivo',
      'transferencia': '<i class="fas fa-university"></i> Transferencia'
    },
    inputValidator: (value) => {
      if (!value) {
        return 'Tenes que seleccionar un método de pago'
      }
    },
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar'
  });

  if (metodoPago) {
    return metodoPago;
  }
  return null;
}

async function mostrarFormularioEnvio() {
  const { value: formValues } = await Swal.fire({
    title: 'Datos de Envío',
    html: `
      <div style="text-align: left;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;"><i class="fas fa-user"></i> Nombre completo:</label>
          <input id="nombre" class="swal2-input" placeholder="Tu nombre">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;"><i class="fas fa-phone"></i> Teléfono:</label>
          <input id="telefono" class="swal2-input" placeholder="Tu teléfono">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;"><i class="fas fa-map-marker-alt"></i> Dirección:</label>
          <input id="direccion" class="swal2-input" placeholder="Tu dirección">
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const nombre = document.getElementById('nombre').value;
      const telefono = document.getElementById('telefono').value;
      const direccion = document.getElementById('direccion').value;
      
      if (!nombre || !telefono || !direccion) {
        Swal.showValidationMessage('Completá todos los campos obligatorios');
        return false;
      }
      
      return {
        nombre,
        telefono,
        direccion
      };
    }
  });

  return formValues;
}

async function mostrarHistorial() {
  if (historialPedidos.length === 0) {
    await Swal.fire({
      title: 'Historial Vacío',
      text: 'Aún no tenés pedidos en tu historial',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  const htmlPedidos = historialPedidos.map((pedido, idx) => {
    const numPedido = (typeof pedido.numero === 'number' && !isNaN(pedido.numero)) ? pedido.numero : (historialPedidos.length - idx);
    return `
    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; background: #f9f9f9;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div>
          <strong style="color: #667eea;"><i class="fas fa-hashtag"></i> Pedido #${numPedido}</strong>
        </div>
        <div style="text-align: right;">
          <strong style="color: #28a745; font-size: 1.1em;">$${pedido.total.toLocaleString()}</strong><br>
          <small style="color: #6c757d;">${pedido.metodoPago === 'efectivo' ? '<i class="fas fa-money-bill-wave"></i> Efectivo' : '<i class="fas fa-university"></i> Transferencia'}</small>
        </div>
      </div>
      <div style="margin: 8px 0; font-size: 0.9em;">
        <strong><i class="fas fa-list"></i> Productos:</strong><br>
        ${pedido.productos.map(item => 
          `<div style="display: flex; justify-content: space-between; margin: 2px 0;">
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${(item.precio * item.cantidad).toLocaleString()}</span>
          </div>`
        ).join('')}
      </div>
      <div style="font-size: 0.85em; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 8px;">
        <strong><i class="fas fa-user"></i> Cliente:</strong> ${pedido.datosEnvio.nombre}<br>
        <strong><i class="fas fa-map-marker-alt"></i> Dirección:</strong> ${pedido.datosEnvio.direccion}
        <br><strong><i class="fas fa-phone"></i> Teléfono:</strong> ${pedido.datosEnvio.telefono}
      </div>
    </div>
  `}).join('');

  await Swal.fire({
    title: '<i class="fas fa-history"></i> Historial de pedidos',
    html: `
      <div style="max-height: 500px; overflow-y: auto; text-align: left;">
        ${htmlPedidos}
      </div>
    `,
    width: 600,
    confirmButtonText: 'Cerrar',
    showCancelButton: false
  });
}

async function procesarCheckout() {
  if (carritoVacio()) {
    mostrarSweetAlert("Carrito vacío", "No podes confirmar el pedido sin productos", "error");
    return;
  }
  
  const metodoPago = await mostrarOpcionesPago();
  if (!metodoPago) return;
  
  const datosEnvio = await mostrarFormularioEnvio();
  if (!datosEnvio) return;
  
  const carrito = obtenerCarrito();
  const resumen = carrito.map(item => 
    `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`
  ).join('\n');
  
  const total = calcularTotal();
  
  const result = await Swal.fire({
    title: '¿Confirmar pedido?',
    html: `
      <div style="text-align: left; margin: 20px 0;">
        <h4><i class="fas fa-list"></i> Resumen del pedido:</h4>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
          ${resumen.split('\n').map(item => `<div>${item}</div>`).join('')}
        </div>
        <div style="font-weight: bold; font-size: 1.2em; color: #28a745; margin-top: 15px;">
          <i class="fas fa-dollar-sign"></i> Total: $${total.toLocaleString()}
        </div>
        <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px;">
          <strong><i class="fas fa-credit-card"></i> Método de pago:</strong> ${metodoPago === 'efectivo' ? '<i class="fas fa-money-bill-wave"></i> Efectivo' : '<i class="fas fa-university"></i> Transferencia'}<br>
          <strong><i class="fas fa-user"></i> Enviar a:</strong> ${datosEnvio.nombre}<br>
          <strong><i class="fas fa-map-marker-alt"></i> Dirección:</strong> ${datosEnvio.direccion}
        </div>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '<i class="fas fa-check"></i> ¡Confirmar pedido!',
    cancelButtonText: 'Cancelar'
  });
  
  if (result.isConfirmed) {
    contadorPedidos++; // incrementa el contador
    
    const nuevoPedido = {
      id: generarIdPedido(),
      numero: contadorPedidos,
      fecha: new Date().toISOString(),
      productos: [...obtenerCarrito()],
      total: total,
      metodoPago: metodoPago,
      datosEnvio: datosEnvio
    };
    
    historialPedidos.unshift(nuevoPedido);
    guardarHistorial();
    
    await Swal.fire({
      title: '¡Pedido Confirmado! <i class="fas fa-utensils"></i>',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 3em; margin: 20px 0;"><i class="fas fa-rocket"></i></div>
          <p>Tu pedido está siendo preparado</p>
          <p><strong>Tiempo estimado: 25-30 minutos</strong></p>
          <p style="margin-top: 20px; color: #28a745;">¡Gracias por elegirnos!</p>
          <p style="margin-top: 10px; font-size: 0.9em; color: #6c757d;">
            <i class="fas fa-hashtag"></i> Pedido #${nuevoPedido.numero}
          </p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: '¡Perfecto!'
    });
    
    vaciarCarrito();
    renderCarrito();
  }
}

botonConfirmar.addEventListener("click", procesarCheckout);

botonVaciar.addEventListener("click", async () => {
  if (carritoVacio()) {
    mostrarSweetAlert("Carrito vacío", "El carrito ya esta vacio", "info");
    return;
  }
  
  const result = await Swal.fire({
    title: '¿Vaciar carrito?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  });
  
  if (result.isConfirmed) {
    vaciarCarrito();
    renderCarrito();
    mostrarSweetAlert("Carrito vaciado", "Todos los productos fueron removidos", "success");
  }
});

botonHistorial.addEventListener("click", mostrarHistorial);

cargarProductos();
