// ============================================
// App — UI, scroll, animações, config
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  setupSmoothScroll();
  setupMobileMenu();
  setupScrollAnimations();
  setupLightboxEvents();
  loadProducts();
});

async function loadConfig() {
  try {
    const doc = await db.collection('config').doc('settings').get();
    if (doc.exists) {
      applyConfig(doc.data());
    } else {
      console.warn('Documento config/settings não encontrado. Usando valores padrão.');
      applyDefaults();
    }
  } catch (error) {
    console.error('Erro ao carregar config:', error);
    applyDefaults();
  }
}

function applyConfig(config) {
  if (config.slogan) {
    const sloganEl = document.getElementById('hero-slogan');
    if (sloganEl) sloganEl.textContent = config.slogan;
  }

  if (config.aboutText) {
    const aboutEl = document.getElementById('about-text');
    if (aboutEl) aboutEl.textContent = config.aboutText;
  }

  const phone = config.whatsapp || '5500000000000';
  document.querySelectorAll('.btn-header-whatsapp, .btn-hero-whatsapp').forEach(btn => {
    btn.href = `https://wa.me/${phone}`;
  });

  if (config.email) {
    document.querySelectorAll('.contact-email').forEach(link => {
      link.href = `mailto:${config.email}`;
      link.textContent = config.email;
    });
  }

  if (config.instagram) {
    document.querySelectorAll('.contact-instagram').forEach(link => {
      const handle = config.instagram.startsWith('@') ? config.instagram : `@${config.instagram}`;
      link.href = `https://instagram.com/${handle.replace('@', '')}`;
      link.textContent = handle;
    });
  }
}

function applyDefaults() {
  applyConfig({
    slogan: 'Kit 3D para colorir — Estimule a criatividade das crianças!',
    aboutText: 'A Novara Kids cria kits 3D personalizados para estimular a criatividade e o aprendizado das crianças.',
    whatsapp: '5500000000000',
    email: 'contato@novarakids.com.br',
    instagram: '@novarakids'
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        toggle.classList.remove('active');
      });
    });
  }
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

function setupLightboxEvents() {
  // Fechar com X
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

  // Fechar clicando no overlay
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });

  // Navegação
  document.getElementById('lightbox-prev').addEventListener('click', lightboxPrev);
  document.getElementById('lightbox-next').addEventListener('click', lightboxNext);

  // Teclado
  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('lightbox');
    if (!overlay.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
  });
}
