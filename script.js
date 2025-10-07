// mobile menu
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
if (toggle && menu){ toggle.addEventListener('click', ()=> menu.classList.toggle('open')); }

// products dropdown open on click
document.querySelectorAll('.dropdown .dropbtn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    // allow click to toggle on desktop/mobile
    e.preventDefault();
    const wrap = btn.parentElement;
    wrap.classList.toggle('open');
  });
});
document.addEventListener('click', (e)=>{
  document.querySelectorAll('.dropdown.open').forEach(dd=>{
    if (!dd.contains(e.target)) dd.classList.remove('open');
  });
});

// year
document.querySelectorAll('[data-year]').forEach(el=> el.textContent = new Date().getFullYear());

// smooth-scroll links on the home "All Sections" view
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click', e=>{
    const id = link.getAttribute('href');
    if (id.length > 1 && document.querySelector(id)){
      e.preventDefault();
      document.querySelector(id).scrollIntoView({behavior:'smooth', block:'start'});
      history.replaceState(null, '', id);
    }
  });
});

// ------- CART (localStorage) -------
const CART_KEY = 'kss_cart_v1';
const CART_COUNT = 'kss_cart_count';

function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); } catch { return []; } }
function saveCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  localStorage.setItem(CART_COUNT, totalQty());
  updateBadge();
}
function totalQty(){ return getCart().reduce((s,i)=> s + Number(i.qty||0), 0); }
function updateBadge(){
  const el = document.getElementById('cartCount');
  if (el) el.textContent = totalQty();
}

// Add-to-cart buttons (site-wide)
document.querySelectorAll('[data-add]').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const item = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
      img: btn.dataset.img,
      qty: 1
    };
    const cart = getCart();
    const idx = cart.findIndex(x => x.id === item.id);
    if (idx >= 0) cart[idx].qty = Number(cart[idx].qty||0) + 1;
    else cart.push(item);
    saveCart(cart);
  });
});

updateBadge();

// ---------- Cart page rendering ----------
const list = document.getElementById('cartList');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');

function recalcTotals(){
  const c = getCart();
  const sub = c.reduce((s,p)=> s + Number(p.price)*Number(p.qty), 0);
  const tax = sub * 0.12;           // example tax
  const total = sub + tax;
  if (subtotalEl) subtotalEl.textContent = `$${sub.toFixed(2)}`;
  if (taxEl)      taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl)    totalEl.textContent = `$${total.toFixed(2)}`;
}

function renderCart(){
  if (!list) return;
  const cart = getCart();
  list.innerHTML = '';

  if (cart.length === 0){
    list.innerHTML = '<div class="empty glass">Your cart is empty. Start adding gear!</div>';
    recalcTotals();
    return;
  }

  cart.forEach((p,i)=>{
    const row = document.createElement('div');
    row.className = 'item glass';
    row.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div><strong>${p.name}</strong><div class="muted">$${Number(p.price).toFixed(2)}</div></div>
      <div class="qty">
        <button data-dec="${i}" aria-label="decrease">−</button>
        <input type="text" value="${Number(p.qty)}" aria-label="quantity" readonly>
        <button data-inc="${i}" aria-label="increase">+</button>
      </div>
      <div><strong>$${(Number(p.price)*Number(p.qty)).toFixed(2)}</strong></div>
      <button data-del="${i}" aria-label="remove" style="background:#ff3b3b;border:0;color:#fff;border-radius:10px;padding:6px 8px;cursor:pointer">✕</button>
    `;
    list.appendChild(row);
  });

  recalcTotals();
}

// Bind ONE delegated click handler (no re-adding on every render)
function handleCartClick(e){
  if (!list) return;
  const cart = getCart();

  if (e.target.dataset.inc !== undefined){
    const i = Number(e.target.dataset.inc);
    cart[i].qty = Number(cart[i].qty||0) + 1;
    saveCart(cart); renderCart(); return;
  }
  if (e.target.dataset.dec !== undefined){
    const i = Number(e.target.dataset.dec);
    cart[i].qty = Math.max(1, Number(cart[i].qty||1) - 1);
    saveCart(cart); renderCart(); return;
  }
  if (e.target.dataset.del !== undefined){
    const i = Number(e.target.dataset.del);
    cart.splice(i,1);
    saveCart(cart); renderCart(); return;
  }
}

if (list && !window.__cartBound){
  list.addEventListener('click', handleCartClick);
  window.__cartBound = true; // guard so we bind only once
}

renderCart();

// ------- Contact form validation -------
const form = document.getElementById('contactForm');
if (form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(el=>{
      const err = el.parentElement.querySelector('.error');
      const valid = el.value && (el.type !== 'email' || /\S+@\S+\.\S+/.test(el.value));
      if(!valid){ ok=false; err&&(err.style.display='block'); el.style.borderColor = '#ff3b3b'; }
      else { err&&(err.style.display='none'); el.style.borderColor = '#242834'; }
    });
    if(ok){
      form.reset();
      const success = form.querySelector('.form__success');
      if(success){ success.style.opacity=1; success.style.transform='translateY(0)'; }
    }
  });
}
