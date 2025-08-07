let carrito = JSON.parse(localStorage.getItem("carrito")) || []; // array para el carrito

function agregarAlCarrito(id,  menu) {
  const prod = menu.find(p => p.id === id);
  if (prod) {
    const itemCarrito = carrito.find(item => item.id === id);
    
    if (itemCarrito) {
      itemCarrito.cantidad++;
    } else {
      carrito.push({
        ...prod, 
        
        cantidad: 1
      });
    }
    
    guardarCarrito();
    return prod;
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
  const itemEliminado = carrito[index];
  carrito.splice(index, 1);
  guardarCarrito();
  return itemEliminado;
}


function calcularTotal() {
  return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito)); // guardo la info en localdStorage para que se mantengan los datos de las compras y del carrito
}

function obtenerCarrito() {
  return carrito;
}

function establecerCarrito(carritoNuevo) {
  carrito = carritoNuevo;
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
  return carrito.length == 0; // uso == aca
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



function generarIdPedido() {
  // genero un id unico para cada pedido d compra
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