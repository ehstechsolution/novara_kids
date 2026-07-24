// ============================================
// Products — carrega e renderiza produtos do Firestore
// ============================================

let allProducts = [];
let activeFilter = 'todos';

async function loadProducts() {
  const container = document.getElementById('products-grid');
  const loading = document.getElementById('products-loading');

  try {
    const snapshot = await db.collection('products').get();
    allProducts = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.active !== false) {
        // Normaliza images: pode ser array ou string única
        let images = [];
        if (Array.isArray(data.images)) {
          images = data.images;
        } else if (data.imageUrl) {
          images = [data.imageUrl];
        }
        allProducts.push({ id: doc.id, ...data, images });
      }
    });

    allProducts.sort((a, b) => (a.order || 99) - (b.order || 99));

    renderProducts(allProducts);
    renderFilters();

    if (loading) loading.style.display = 'none';
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    if (loading) {
      loading.innerHTML = '<p class="error-msg">Erro ao carregar produtos. Verifique as regras do Firestore.</p>';
    }
  }
}

function renderProducts(products) {
  const container = document.getElementById('products-grid');
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhum kit encontrado.</p>';
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.cursor = 'pointer';

    const priceFormatted = product.price
      ? `A partir de R$ ${product.price.toFixed(2).replace('.', ',')}`
      : 'Consulte preço';

    // Imagem principal (primeira do array)
    const mainImage = product.images[0] || 'https://via.placeholder.com/400x300?text=Kit+Novara';

    // Thumbnail gallery se tiver mais de 1 imagem
    let thumbnailsHTML = '';
    if (product.images.length > 1) {
      thumbnailsHTML = `
        <div class="product-thumbnails">
          ${product.images.map((img, i) => `
            <button class="thumb-btn ${i === 0 ? 'active' : ''}" data-index="${i}" data-src="${img}">
              <img src="${img}" alt="${product.name} - foto ${i + 1}">
            </button>
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="product-image" data-images='${JSON.stringify(product.images)}' data-name="${product.name}">
        <img src="${mainImage}" alt="${product.name}" loading="lazy" class="product-main-img">
        <button class="btn-zoom" title="Ampliar imagem">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        ${product.category ? `<span class="product-badge">${product.category}</span>` : ''}
      </div>
      ${thumbnailsHTML}
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description || ''}</p>
        ${product.description ? `<button class="btn-see-more" data-id="${product.id}">Ver mais</button>` : ''}
        <div class="product-footer">
          <span class="product-price">${priceFormatted}</span>
          <button class="btn-whatsapp" data-product="${product.name}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Fale Conosco
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  attachCardListeners();
}

function renderFilters() {
  const container = document.getElementById('filters');
  if (!container) return;

  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];

  if (categories.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.textContent = 'Todos';
  allBtn.dataset.filter = 'todos';
  allBtn.addEventListener('click', () => filterProducts('todos'));
  container.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.dataset.filter = cat;
    btn.addEventListener('click', () => filterProducts(cat));
    container.appendChild(btn);
  });
}

function filterProducts(category) {
  activeFilter = category;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });

  const filtered = category === 'todos'
    ? allProducts
    : allProducts.filter(p => p.category === category);

  renderProducts(filtered);
}

function attachCardListeners() {
  // Clicar no card → abre página de detalhes
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-zoom') || e.target.closest('.thumb-btn') || e.target.closest('.btn-whatsapp') || e.target.closest('.btn-see-more')) {
        return;
      }
      const productId = card.dataset.id;
      if (productId) {
        window.location.href = `product.html?id=${productId}`;
      }
    });
  });

  // Botão "Ver mais" → abre página de detalhes
  document.querySelectorAll('.btn-see-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.id;
      if (productId) {
        window.location.href = `product.html?id=${productId}`;
      }
    });
  });

  // Botão zoom → abre lightbox
  document.querySelectorAll('.btn-zoom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const imageContainer = btn.closest('.product-image');
      const images = JSON.parse(imageContainer.dataset.images);
      const name = imageContainer.dataset.name;
      openLightbox(images, name);
    });
  });

  // Thumbnails → troca imagem principal
  document.querySelectorAll('.thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const mainImg = card.querySelector('.product-main-img');
      mainImg.src = btn.dataset.src;

      card.querySelectorAll('.thumb-btn').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Botão WhatsApp
  document.querySelectorAll('.btn-whatsapp').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productName = btn.dataset.product;
      const phone = await getWhatsAppNumber();
      const message = encodeURIComponent(
        `Olá! Tenho interesse no ${productName}. Podem me informar valores e condições?`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });
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

// ============================================
// Lightbox
// ============================================

let currentLightboxImages = [];
let currentLightboxIndex = 0;

function openLightbox(images, productName) {
  currentLightboxImages = images;
  currentLightboxIndex = 0;

  const overlay = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const counter = document.getElementById('lightbox-counter');
  const thumbs = document.getElementById('lightbox-thumbs');

  img.src = images[0];
  title.textContent = productName;
  counter.textContent = images.length > 1 ? `1 / ${images.length}` : '';

  // Renderiza miniaturas no lightbox
  if (images.length > 1) {
    thumbs.innerHTML = images.map((src, i) => `
      <button class="lightbox-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${src}" alt="Miniatura ${i + 1}">
      </button>
    `).join('');
    thumbs.style.display = 'flex';

    thumbs.querySelectorAll('.lightbox-thumb').forEach(t => {
      t.addEventListener('click', () => {
        currentLightboxIndex = parseInt(t.dataset.index);
        updateLightbox();
      });
    });
  } else {
    thumbs.innerHTML = '';
    thumbs.style.display = 'none';
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateLightbox() {
  const img = document.getElementById('lightbox-img');
  const counter = document.getElementById('lightbox-counter');
  const thumbs = document.getElementById('lightbox-thumbs');

  img.src = currentLightboxImages[currentLightboxIndex];
  counter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxImages.length}`;

  thumbs.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === currentLightboxIndex);
  });
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function lightboxPrev() {
  currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
  updateLightbox();
}

function lightboxNext() {
  currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
  updateLightbox();
}

// Expor funções globalmente
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.lightboxPrev = lightboxPrev;
window.lightboxNext = lightboxNext;
