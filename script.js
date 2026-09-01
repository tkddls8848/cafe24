(() => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const overlay = document.querySelector('[data-overlay]');
  const menu = document.querySelector('[data-menu-panel]');
  const cart = document.querySelector('[data-cart-panel]');
  const search = document.querySelector('[data-search-layer]');
  const toast = document.querySelector('[data-toast]');
  const cartBody = document.querySelector('[data-cart-body]');
  const cartFooter = document.querySelector('[data-cart-footer]');
  const cartTotal = document.querySelector('[data-cart-total]');
  const cartItems = [];

  const products = {
    '데일리 A4 복사용지': { price: 24900, image: 'assets/product-paper.jpg' },
    '소프트 비즈니스 노트': { price: 8500, image: 'assets/product-notebook.jpg' },
    '모듈 데스크 오거나이저': { price: 15900, image: 'assets/product-organizer.jpg' },
    '데일리 젤펜 블랙 6P': { price: 5900, image: 'assets/product-pens.jpg' }
  };

  const money = value => `${value.toLocaleString('ko-KR')}원`;

  function setCounts() {
    document.querySelectorAll('[data-cart-count]').forEach(node => {
      node.textContent = cartItems.length;
    });
  }

  function closeAll() {
    [menu, cart, search].forEach(panel => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    });
    overlay.classList.remove('open');
    body.classList.remove('locked');
    document.querySelector('[data-menu-open]')?.setAttribute('aria-expanded', 'false');
  }

  function openPanel(panel) {
    closeAll();
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    overlay.classList.add('open');
    body.classList.add('locked');
    if (panel === menu) document.querySelector('[data-menu-open]')?.setAttribute('aria-expanded', 'true');
    if (panel === search) setTimeout(() => document.querySelector('#keyword')?.focus(), 360);
  }

  function renderCart() {
    setCounts();
    if (!cartItems.length) {
      cartBody.innerHTML = '<div class="empty-cart"><span>0</span><p>장바구니가 비어 있습니다.</p><small>필요한 사무용품을 담아보세요.</small></div>';
      cartFooter.hidden = true;
      return;
    }

    cartBody.innerHTML = cartItems.map((name, index) => {
      const product = products[name];
      return `<div class="cart-item">
        <span class="cart-thumb"><img src="${product.image}" alt=""></span>
        <p>${name}<small>${money(product.price)} · 수량 1</small></p>
        <button type="button" aria-label="${name} 삭제" data-remove-item="${index}">×</button>
      </div>`;
    }).join('');
    cartTotal.textContent = money(cartItems.reduce((sum, name) => sum + products[name].price, 0));
    cartFooter.hidden = false;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
  }

  document.querySelector('[data-close-notice]')?.addEventListener('click', event => {
    event.currentTarget.parentElement.remove();
  });
  document.querySelector('[data-menu-open]')?.addEventListener('click', () => openPanel(menu));
  document.querySelector('[data-menu-close]')?.addEventListener('click', closeAll);
  document.querySelector('[data-cart-open]')?.addEventListener('click', () => openPanel(cart));
  document.querySelector('[data-cart-close]')?.addEventListener('click', closeAll);
  document.querySelector('[data-search-open]')?.addEventListener('click', () => openPanel(search));
  document.querySelector('[data-search-close]')?.addEventListener('click', closeAll);
  overlay?.addEventListener('click', closeAll);

  document.querySelectorAll('[data-add-cart]').forEach(button => {
    button.addEventListener('click', () => {
      cartItems.push(button.dataset.product);
      renderCart();
      showToast(`${button.dataset.product}을(를) 담았습니다.`);
    });
  });

  cartBody?.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-item]');
    if (!button) return;
    cartItems.splice(Number(button.dataset.removeItem), 1);
    renderCart();
  });

  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeAll));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAll();
  });
  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 12), { passive: true });

  renderCart();
})();
