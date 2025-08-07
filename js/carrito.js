let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function agregarAlCarrito(id, menu) {
  const producto = menu.find(p => p.id === id);
  if (producto) {
    const productoEnCarrito = carrito.find(item => item.id === id);
    
    if (productoEnCarrito) {
      productoEnCarrito.cantidad++;
    } else {
      carrito.push({
        ...producto,
        cantidad: 1
      });
    }
    
    guardarCarrito();
    return producto;
  }
  return null;
}

function incrementarCantidad(index) {
  carrito[index].cantidad++;
  guardarCarrito();
}

function decrementarCantidad(index) {
  if (carrito[index].cantidad > 1) {
    carrito[index].cantidad--;
  } else {
    quitarDelCarrito(index);
    return true;
  }
  guardarCarrito();
  return false;
}

function quitarDelCarrito(index) {
  const productoEliminado = carrito[index];
  carrito.splice(index, 1);
  guardarCarrito();
  return productoEliminado;
}

function calcularTotal() {
  return carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function obtenerCarrito() {
  return carrito;
}

function establecerCarrito(nuevoCarrito) {
  carrito = nuevoCarrito;
  guardarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
}

function obtenerCantidadProductos() {
  return carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

function carritoVacio() {
  return carrito.length === 0;
}

function formatearPrecio(precio) {
  return precio.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  });
}

function validarProducto(producto) {
  return producto && 
         producto.id && 
         producto.nombre && 
         producto.precio && 
         producto.precio > 0;
}

function calcularDescuento(precioOriginal, precioCombo) {
  const descuento = precioOriginal - precioCombo;
  const porcentaje = (descuento / precioOriginal) * 100;
  return {
    descuento: descuento,
    porcentaje: Math.round(porcentaje)
  };
}

function generarIdPedido() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function validarCarrito(carrito) {
  if (!Array.isArray(carrito)) {
    return false;
  }
  
  return carrito.every(item => 
    item && 
    item.id && 
    item.cantidad && 
    item.cantidad > 0
  );
}

function obtenerEstadisticasCarrito(carrito) {
  if (!carrito || carrito.length === 0) {
    return {
      totalProductos: 0,
      totalPrecio: 0,
      productosUnicos: 0
    };
  }
  
  const totalProductos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrecio = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const productosUnicos = carrito.length;
  
  return {
    totalProductos,
    totalPrecio,
    productosUnicos
  };
}

function limpiarStorage() {
  try {
    localStorage.removeItem("carrito");
    return true;
  } catch (error) {
    console.error("Error limpiando localStorage:", error);
    return false;
  }
}

function exportarCarrito(carrito) {
  try {
    const carritoJSON = JSON.stringify(carrito, null, 2);
    const blob = new Blob([carritoJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `carrito-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Error exportando carrito:", error);
    return false;
  }
} 