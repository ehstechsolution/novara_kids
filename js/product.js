// ============================================
// Product — página de detalhes do produto
// ============================================

let carouselImages = [];
let carouselIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    showError('Produto não encontrado.');
    return;
  }

  await loadProduct(productId);
});

async function loadProduct(productId) {
  const loading = document.getElementById('product-loading');
  const carousel = document.getElementById('product-carousel');
  const info = document.getElementById('product-info');

  try {
    const doc = await db.collection('products').doc(productId).get();

    if (!doc.exists) {
      showError('Produto não encontrado.');
      return;
    }

    const data = doc.data();

    let images = [];
    if (Array.isArray(data.images)) {
      images = data.images;
    } else if (data.imageUrl) {
      images = [data.imageUrl];
    }

    if (images.length === 0) {
      images = ['https://via.placeholder.com/600x450?text=Kit+Novara'];
    }

    carouselImages = images;

    document.title = `${data.name} — Novara Kids`;

    if (data.category) {
      const badge = document.getElementById('product-badge');
      badge.textContent = data.category;
      badge.style.display = 'inline-block';
    } else {
      document.getElementById('product-badge').style.display = 'none';
    }

    document.getElementById('product-title').textContent = data.name;
    document.getElementById('product-description').textContent = data.description || '';

    const priceEl = document.getElementById('product-price');
    if (data.price) {
      priceEl.textContent = `A partir de R$ ${data.price.toFixed(2).replace('.', ',')}`;
    } else {
      priceEl.textContent = 'Consulte preço';
    }

    const whatsappBtn = document.getElementById('product-whatsapp');
    whatsappBtn.dataset.product = data.name;

    loading.style.display = 'none';
    carousel.style.display = 'block';
    info.style.display = 'flex';

    initCarousel(images);
    setupCarouselEvents(data.name);

  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    showError('Erro ao carregar produto. Tente novamente.');
  }
}

function showError(message) {
  const loading = document.getElementById('product-loading');
  loading.innerHTML = `<p class="error-msg">${message}</p>`;
}

function initCarousel(images) {
  carouselIndex = 0;

  const img = document.getElementById('carousel-img');
  img.src = images[0];
  img.alt = 'Produto';

  const thumbsContainer = document.getElementById('carousel-thumbs');

  if (images.length > 1) {
    thumbsContainer.innerHTML = images.map((src, i) => `
      <button class="carousel-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${src}" alt="Miniatura ${i + 1}">
      </button>
    `).join('');
    thumbsContainer.style.display = 'flex';

    thumbsContainer.querySelectorAll('.carousel-thumb').forEach(t => {
      t.addEventListener('click', () => {
        carouselIndex = parseInt(t.dataset.index);
        updateCarousel();
      });
    });
  } else {
    thumbsContainer.innerHTML = '';
    thumbsContainer.style.display = 'none';
  }
}

function setupCarouselEvents(productName) {
  document.getElementById('carousel-prev').addEventListener('click', () => {
    carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
    updateCarousel();
  });

  document.getElementById('carousel-next').addEventListener('click', () => {
    carouselIndex = (carouselIndex + 1) % carouselImages.length;
    updateCarousel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
      updateCarousel();
    }
    if (e.key === 'ArrowRight') {
      carouselIndex = (carouselIndex + 1) % carouselImages.length;
      updateCarousel();
    }
  });

  document.getElementById('product-whatsapp').addEventListener('click', async () => {
    const phone = await getWhatsAppNumber();
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${productName}. Podem me informar valores e condições?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  });
}

function updateCarousel() {
  const img = document.getElementById('carousel-img');
  img.src = carouselImages[carouselIndex];

  const thumbs = document.getElementById('carousel-thumbs');
  thumbs.querySelectorAll('.carousel-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === carouselIndex);
  });
}

async function getWhatsAppNumber() {
  try {
    const doc = await db.collection('config').doc('settings').get();
    if (doc.exists) {
      return doc.data().whatsapp || '5500000000000';
    }
  } catch (e) {
    console.error('Erro ao buscar WhatsApp:', e);
  }
  return '5500000000000';
}
