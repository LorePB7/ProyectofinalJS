let carrito = JSON.parse(localStorage.getItem("carrito")) || []; // array para el carrito

function agregarAlCarrito(id,  menu) {
  const prod = menu.find(p => p.id === id);
  if (prod) {
    const itemCarrito = carrito.find(item => item.id === id);
    
    if (itemCarrito) {
      if (itemCarrito.cantidad >= prod.stock) {
        return null;
      }
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
  const item = carrito[index];
  const producto = menu.find(p => p.id === item.id);
  
  if (item.cantidad >= producto.stock) {
    return false;
  }
  
  item.cantidad++;
  guardarCarrito();
  return true;
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
  localStorage.setItem("carrito", JSON.stringify(carrito));
}  // guardo la info en localdStorage para que se mantengan los datos de las compras y del carrito


function obtenerCarrito() {
  return carrito;
}


function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
}

function obtenerCantidadProductos() {
  return carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

function carritoVacio() {
  return carrito.length == 0;
}





function generarIdPedido() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}         // genero un id unico para cada pedido d compra

function validarCarrito(carrito) {
  if (!Array.isArray(carrito)) {
    return false;
  }
  
  return carrito.every(item => {
    if (!item || !item.id || !item.cantidad || item.cantidad <= 0) {
      return false;
    }
    
    const producto = menu.find(p => p.id === item.id);
    if (!producto) {
      return false;
    }
    
    return item.cantidad <= producto.stock;
  });
}



function descontarStock(carrito) {
  carrito.forEach(item => {
    const producto = menu.find(p => p.id === item.id);
    if (producto) {
      producto.stock -= item.cantidad;
    }
  });
}


 