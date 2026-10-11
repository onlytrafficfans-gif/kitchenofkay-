import './order.css';
import './pwa.js';

const dishes = [
  { id:'oxtails', name:'Oxtails', price:30, image:'/media/menu/oxtails.webp', tag:'Slow-braised', description:'Fork-tender oxtails in rich island gravy with your choice of classic sides.' },
  { id:'brownstew', name:'Brownstew Chicken', price:30, image:'/media/menu/brownstew-chicken.webp', tag:'Deeply savory', description:'Browned chicken simmered with peppers, onions and aromatics in a glossy gravy.' },
  { id:'meatballs', name:'Meatballs in Plum Sauce', price:30, image:'/media/menu/meatballs-plum.webp', tag:'House specialty', description:'Tender meatballs finished in a sweet-savory dark plum glaze.' },
  { id:'salmon', name:'Jerk Salmon', price:30, image:'/media/menu/jerk-salmon.webp', tag:'Flame kissed', description:'Silky salmon lacquered with jerk spice, smoke, herbs and gentle heat.' },
  { id:'wing-meal', name:'8-Piece Wing Meal', price:30, image:'/media/menu/eight-wings.webp', tag:'Full plate', description:'Eight glazed wings with rice, cabbage, baked mac and your choice of yams or plantain.' },
  { id:'wings-only', name:'12 Wings Only', price:20, image:'/media/menu/twelve-wings.webp', tag:'Always available', description:'Twelve seasoned, caramelized wings piled high and ready to share.' }
];

const cart = new Map();
const grid = document.querySelector('[data-order-grid]');
const cartItems = document.querySelector('[data-cart-items]');
const emptyCart = document.querySelector('[data-empty-cart]');
const cartFooter = document.querySelector('[data-cart-footer]');
const cartTotal = document.querySelector('[data-cart-total]');
const cartCount = document.querySelector('[data-cart-count]');
const textOrder = document.querySelector('[data-text-order]');
const copyOrder = document.querySelector('[data-copy-order]');
const orderName = document.querySelector('#order-name');
const orderNote = document.querySelector('#order-note');
const clearOrder = document.querySelector('[data-clear-order]');
const mobileCartBar = document.querySelector('[data-mobile-cart-bar]');
const mobileCartCount = document.querySelector('[data-mobile-cart-count]');
const mobileCartLabel = document.querySelector('[data-mobile-cart-label]');
const mobileCartTotal = document.querySelector('[data-mobile-cart-total]');
const viewOrder = document.querySelector('[data-view-order]');
const STORAGE_KEY = 'kok-order-draft-v1';

grid.innerHTML = dishes.map(dish => `
  <article class="order-card" data-dish="${dish.id}">
    <div class="dish-image"><img src="${dish.image}" alt="${dish.name} served on a black plate" width="700" height="700" loading="lazy" /><span>${dish.tag}</span></div>
    <div class="dish-details">
      <div class="dish-title"><h3>${dish.name}</h3><strong>$${dish.price}</strong></div>
      <p>${dish.description}</p>
      <button type="button" data-add="${dish.id}">Add to order <span>+</span></button>
    </div>
  </article>`).join('');

function quantity() { return [...cart.values()].reduce((sum, value) => sum + value, 0); }
function total() { return dishes.reduce((sum, dish) => sum + dish.price * (cart.get(dish.id) || 0), 0); }
function orderText() {
  const lines = dishes.filter(dish => cart.has(dish.id)).map(dish => `${cart.get(dish.id)}× ${dish.name} — $${dish.price * cart.get(dish.id)}`);
  const name = orderName.value.trim();
  const note = orderNote.value.trim();
  return [`Kitchen of Kay pickup request${name ? ` for ${name}` : ''}`, '', ...lines, '', `Estimated total: $${total()}`, note ? `Note: ${note}` : '', '', 'Please confirm availability and pickup time.'].filter(Boolean).join('\n');
}
function updateLinks() {
  textOrder.href = `sms:+17473526722?body=${encodeURIComponent(orderText())}`;
}
function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cart: Object.fromEntries(cart),
      name: orderName.value,
      note: orderNote.value
    }));
  } catch {
    // Ordering still works when storage is blocked.
  }
}
function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!draft || typeof draft !== 'object') return;
    Object.entries(draft.cart || {}).forEach(([id, value]) => {
      const amount = Number(value);
      if (dishes.some(dish => dish.id === id) && Number.isInteger(amount) && amount > 0 && amount <= 99) cart.set(id, amount);
    });
    orderName.value = typeof draft.name === 'string' ? draft.name.slice(0, 50) : '';
    orderNote.value = typeof draft.note === 'string' ? draft.note.slice(0, 240) : '';
  } catch {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage is unavailable. */ }
  }
}
function renderCart() {
  const count = quantity();
  cartCount.textContent = count;
  emptyCart.hidden = count > 0;
  cartFooter.hidden = count === 0;
  cartItems.innerHTML = dishes.filter(dish => cart.has(dish.id)).map(dish => `
    <div class="cart-line">
      <img src="${dish.image}" alt="" width="64" height="64" />
      <div><strong>${dish.name}</strong><small>$${dish.price} each</small></div>
      <div class="stepper" aria-label="Quantity for ${dish.name}">
        <button type="button" data-change="${dish.id}" data-delta="-1" aria-label="Remove one ${dish.name}">−</button>
        <span>${cart.get(dish.id)}</span>
        <button type="button" data-change="${dish.id}" data-delta="1" aria-label="Add one ${dish.name}">+</button>
      </div>
    </div>`).join('');
  cartTotal.textContent = `$${total()}`;
  mobileCartCount.textContent = count;
  mobileCartLabel.lastChild.textContent = count === 1 ? ' item' : ' items';
  mobileCartTotal.textContent = `$${total()}`;
  mobileCartBar.hidden = count === 0;
  updateLinks();
  saveDraft();
}

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const id = button.dataset.add;
  cart.set(id, (cart.get(id) || 0) + 1);
  button.classList.add('added');
  button.firstChild.textContent = 'Added ';
  setTimeout(() => { button.classList.remove('added'); button.firstChild.textContent = 'Add to order '; }, 900);
  renderCart();
});
cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-change]');
  if (!button) return;
  const id = button.dataset.change;
  const next = (cart.get(id) || 0) + Number(button.dataset.delta);
  if (next <= 0) cart.delete(id); else cart.set(id, next);
  renderCart();
});
[orderName, orderNote].forEach(field => field.addEventListener('input', () => { updateLinks(); saveDraft(); }));
copyOrder.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(orderText());
    copyOrder.textContent = 'Order copied';
    setTimeout(() => { copyOrder.textContent = 'Copy order details'; }, 1600);
  } catch { copyOrder.textContent = 'Select and copy from your text message'; }
});
clearOrder.addEventListener('click', () => {
  cart.clear();
  renderCart();
  grid.querySelector('[data-add]')?.focus({ preventScroll: true });
});
viewOrder.addEventListener('click', () => {
  document.querySelector('#your-order').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

restoreDraft();
renderCart();
