// capturo los elementos del DOM
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateCarrito = document.getElementById('template-carrito').content;
const templateFooter = document.getElementById('template-footer').content;
const fragment = document.createDocumentFragment();

let carrito = {};

// listeners de eventos
document.addEventListener('DOMContentLoaded', () => {
  fetchProductos();

  if (localStorage.getItem('carrito')) {
    carrito = JSON.parse(localStorage.getItem('carrito'));
    renderizarCarrito();
  }
});
// evento de agregar al carrito
cards.addEventListener('click', (evento) => {
  agregarCarrito(evento);
});
// evento de los botones + y -
items.addEventListener('click', (evento) => {
  btnAccion(evento);
});

// FETCH
const fetchProductos = async () => {
  try {
    const res = await fetch('productos.json');
    const data = await res.json();

    // ahora renderizo la data
    renderizarCards(data);
  } catch (error) {
    console.log(error);
  }
};

// renderizar cards
const renderizarCards = (data) => {
  // recorro el array de objetos
  data.forEach((producto) => {
    templateCard.querySelector('img').setAttribute('src', producto.img);
    templateCard.querySelector('h4').textContent = producto.nombre;
    templateCard.querySelector('p').textContent = producto.precio;
    templateCard.querySelector('.btn-success').dataset.id = producto.id;

    const cardClonada = templateCard.cloneNode(true);
    fragment.appendChild(cardClonada);
  });
  cards.appendChild(fragment);
};

// agregar al carrito
const agregarCarrito = (evento) => {
  if (evento.target.classList.contains('btn-success')) {
    setCarrito(evento.target.parentElement);
    // sweet alert 2
    Swal.fire(
      'Muy bien!',
      'Se agregó el producto al carrito'      
    )
  }
  evento.stopPropagation();
};

// setear el carrito
const setCarrito = (objeto) => {
  const producto = {
    id: objeto.querySelector('.btn-success').dataset.id,
    nombre: objeto.querySelector('h4').textContent,
    precio: objeto.querySelector('p').textContent,
    cantidad: 1,
  };

  if (carrito.hasOwnProperty(producto.id)) {
    producto.cantidad = carrito[producto.id].cantidad + 1;
  }

  carrito[producto.id] = { ...producto };
  renderizarCarrito();
};

// renderizar carrito
const renderizarCarrito = () => {
  items.innerHTML = '';

  Object.values(carrito).forEach((producto) => {
    templateCarrito.querySelector('th').textContent = producto.id;
    templateCarrito.querySelectorAll('td')[0].textContent = producto.nombre;
    templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
    templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
    templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
    templateCarrito.querySelector('span').textContent =
      producto.cantidad * producto.precio;

    const carritoClonado = templateCarrito.cloneNode(true);
    fragment.appendChild(carritoClonado);
  });
  items.appendChild(fragment);

  renderizarTotales();

  localStorage.setItem('carrito', JSON.stringify(carrito));
};

// renderizar totales
const renderizarTotales = () => {
  footer.innerHTML = '';

  if (Object.keys(carrito).length === 0) {
    footer.innerHTML = `
        <th scope="row" colspan="5">Carrito Vacío - Comience a Comprar!</th>
        `;
    return;
  }

  const sumaCantidad = Object.values(carrito).reduce(
    (contador, { cantidad }) => contador + cantidad,
    0
  );

  const sumaPesos = Object.values(carrito).reduce(
    (contador, { cantidad, precio }) => contador + cantidad * precio,
    0
  );

  templateFooter.querySelectorAll('td')[0].textContent = sumaCantidad;
  templateFooter.querySelector('span').textContent = sumaPesos;

  const totalesClonado = templateFooter.cloneNode(true);
  fragment.appendChild(totalesClonado);
  footer.appendChild(fragment);

  const btnVaciar = document.getElementById('vaciar-carrito');
  btnVaciar.addEventListener('click', () => {
    carrito = {};
    renderizarCarrito();
  });

  const btnFinalizar = document.getElementById('finalizar-compra');
  btnFinalizar.addEventListener('click', ()=> {
    Swal.fire({      
      icon: 'success',
      title: '¡Excelente! Su compra se ha realizado con éxito!',
      showConfirmButton: false,
      timer: 2000
    })
    carrito = {}
    renderizarCarrito();
  })
};

// botones + y -
const btnAccion = (evento) => {
  // aumentar
  if (evento.target.classList.contains('btn-info')) {
    const producto = carrito[evento.target.dataset.id];
    producto.cantidad++;

    carrito[evento.target.dataset.id] = { ...producto };
    renderizarCarrito();
  }

  // sacar
  if (evento.target.classList.contains('btn-danger')) {
    const producto = carrito[evento.target.dataset.id];
    producto.cantidad--;

    if (producto.cantidad === 0) {
      delete carrito[evento.target.dataset.id];
    }

    renderizarCarrito();
  }

  evento.stopPropagation();
};
