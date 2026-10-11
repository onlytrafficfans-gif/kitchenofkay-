import './style.css';
import { ScrollFilm } from './scroll-film.js';
import './pwa.js';

const experience = document.querySelector('.experience');
const intro = document.querySelector('.scene-copy');
const caption = document.querySelector('.scene-caption');
const title = document.querySelector('#chapter-title');
const description = document.querySelector('#chapter-description');
const motionToggle = document.querySelector('#motion-toggle');
const chapters = [...document.querySelectorAll('[data-chapter]')];
const menuExperience = document.querySelector('.menu-experience');
const coverflow = document.querySelector('#dish-coverflow');
const dishSlides = [...document.querySelectorAll('.dish-slide')];
const dishDots = [...document.querySelectorAll('[data-menu-index]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compactMenu = matchMedia('(max-width: 760px)');
const saveData = navigator.connection?.saveData === true;
const scenes = [
  ['Seasoned with soul.', 'Scotch bonnet, pimento, thyme, and time.'],
  ['Let the fire talk.', 'Open flame. Real char. Island flavor.'],
  ['The finishing touch.', 'Big flavor, right down to the last drop.'],
  ['Made to bring us together.', 'From our kitchen to your table.']
];
const stops = [0, .28, .54, .82];
const dishes = [
  {
    name: 'Oxtails', price: '$30 meal',
    bio: 'Low and slow until the meat yields at the touch of a fork. These deeply braised oxtails carry warm island spice, rich gravy and the kind of comfort that settles the whole table.',
    sides: ['Rice and Peas <small>or White Rice</small>', 'Steamed Cabbage', 'Baked Mac', 'Candy Yams <small>or Plantain</small>']
  },
  {
    name: 'Brownstew Chicken', price: '$30 meal',
    bio: 'Chicken browned until deeply savory, then simmered with peppers, onions and aromatics in a glossy island gravy. Familiar, generous and layered with flavor from the first bite to the last.',
    sides: ['Rice and Peas <small>or White Rice</small>', 'Steamed Cabbage', 'Baked Mac', 'Candy Yams <small>or Plantain</small>']
  },
  {
    name: 'Meatballs in Plum Sauce', price: '$30 meal',
    bio: 'Tender, hand-formed meatballs finished in a dark plum glaze that moves between fruity sweetness and savory depth. A playful house specialty with a slow-building, beautifully balanced finish.',
    sides: ['Rice and Peas <small>or White Rice</small>', 'Steamed Cabbage', 'Baked Mac', 'Candy Yams <small>or Plantain</small>']
  },
  {
    name: 'Jerk Salmon', price: '$30 meal',
    bio: 'A generous salmon fillet kissed by the grill, lacquered with jerk spice and kept silky at the center. Smoke, herbs and gentle heat sharpen the fish without hiding its richness.',
    sides: ['Rice and Peas <small>or White Rice</small>', 'Steamed Cabbage', 'Baked Mac', 'Candy Yams <small>or Plantain</small>']
  },
  {
    name: '8-Piece Wing Meal', price: '$30 meal',
    bio: 'Eight wings with crisp edges, juicy centers and a sticky, flame-darkened glaze. Built for the diner who wants the full spread: bold wings with every comforting side represented.',
    sides: ['Rice and Peas <small>or White Rice</small>', 'Steamed Cabbage', 'Baked Mac', 'Candy Yams <small>or Plantain</small>']
  },
  {
    name: '12 Wings Only', price: '$20',
    bio: 'Twelve glossy wings piled high and served without distraction. Deeply seasoned, caramelized and made for sharing—although nobody at the table will blame you if you do not.',
    sides: ['Twelve whole wings', 'Wings always available']
  }
];
const savedMotion = localStorage.getItem('kok-motion');
let motion = savedMotion === null ? !reducedMotion.matches && !saveData : savedMotion === 'on';
let film;
let target = 0, position = 0, raf = 0, activeChapter = -1;
let menuPosition = 0, activeDish = -1, dragStartX = 0, dragStartIndex = 0;
let isDraggingDish = false;
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
function measure() {
  const max = experience.offsetHeight - innerHeight;
  target = max > 0 ? clamp((scrollY - experience.offsetTop) / max) : 0;
}
function update() {
  raf = 0;
  if (!motion) return;
  position += (target - position) * .2;
  if (Math.abs(target - position) < .0003) position = target;
  film?.seek(position);
  const introOpacity = 1 - clamp((position - .045) / .095);
  intro.style.opacity = introOpacity;
  intro.style.transform = `translateY(${-clamp(position / .14)*24}px)`;
  const chapter = position >= stops[3] ? 3 : position >= stops[2] ? 2 : position >= stops[1] ? 1 : 0;
  if (chapter !== activeChapter) {
    title.textContent = scenes[chapter][0];
    description.textContent = scenes[chapter][1];
    chapters.forEach((button, index) => {
      if (index === chapter) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    activeChapter = chapter;
  }
  // Fade at the editorial cuts while the underlying film keeps moving.
  const local = (position - stops[chapter]) / ((stops[chapter+1] ?? 1) - stops[chapter]);
  const captionOpacity = chapter === 0 ? clamp((position - .13)/.035) : clamp(local / .1);
  caption.style.opacity = captionOpacity * (chapter === 3 ? 1 : clamp((1-local)/.09));
  caption.style.transform = `translateY(${(1-captionOpacity)*16}px)`;
  chapters.forEach((button, i) => button.style.setProperty('--fill', clamp((position-stops[i])/((stops[i+1]??1)-stops[i]))));
  if (position !== target) raf = requestAnimationFrame(update);
}
function schedule() { if (!raf && motion) raf = requestAnimationFrame(update); }

function setDishCopy(index) {
  if (index === activeDish) return;
  activeDish = index;
  const dish = dishes[index];
  document.querySelector('#dish-number').textContent = String(index + 1).padStart(2, '0');
  document.querySelector('#dish-name').textContent = dish.name;
  document.querySelector('#dish-price').textContent = dish.price;
  document.querySelector('#dish-bio').textContent = dish.bio;
  document.querySelector('#dish-includes').innerHTML = dish.sides.map(side => `<span>${side}</span>`).join('');
  dishDots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === index)));
}

function renderMenu(value) {
  menuPosition = clamp(value, 0, dishes.length - 1);
  const selected = Math.round(menuPosition);
  setDishCopy(selected);
  dishSlides.forEach((slide, i) => {
    const delta = i - menuPosition;
    const abs = Math.abs(delta);
    const direction = Math.sign(delta);
    const x = delta * Math.min(innerWidth * .34, 500);
    const z = abs === 0 ? 120 : -Math.min(abs * 210, 640);
    const rotate = direction * -48;
    const scale = Math.max(.48, 1 - abs * .18);
    slide.style.transform = `translate(-50%,-50%) translate3d(${x}px,0,${z}px) rotateY(${rotate}deg) scale(${scale})`;
    slide.style.opacity = String(clamp(1 - Math.max(0, abs - .25) * .32, .12, 1));
    slide.style.filter = `brightness(${Math.max(.34, 1 - abs * .24)}) saturate(${Math.max(.55, 1 - abs * .12)})`;
    slide.style.zIndex = String(20 - Math.round(abs * 2));
    slide.dataset.active = String(i === selected);
    slide.setAttribute('aria-hidden', String(abs > 1.6));
  });
}

function menuScrollPosition() {
  if (compactMenu.matches) return menuPosition;
  const max = menuExperience.offsetHeight - innerHeight;
  if (max <= 0) return 0;
  return clamp((scrollY - menuExperience.offsetTop) / max) * (dishes.length - 1);
}

function syncMenuToScroll() {
  if (!compactMenu.matches && !isDraggingDish) renderMenu(menuScrollPosition());
}

function goToDish(index, smooth = true) {
  const next = clamp(index, 0, dishes.length - 1);
  if (compactMenu.matches) {
    renderMenu(next);
    coverflow.focus({ preventScroll: true });
    return;
  }
  const max = menuExperience.offsetHeight - innerHeight;
  const top = menuExperience.offsetTop + (next / (dishes.length - 1)) * max;
  scrollTo({ top, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant' });
}
function applyMotion(enabled, preserveLocation = false) {
  const wasBelow = scrollY >= experience.offsetHeight - innerHeight;
  const previousHeight = experience.offsetHeight;
  motion = enabled;
  document.documentElement.classList.toggle('motion-off', !enabled);
  motionToggle.textContent = enabled ? 'Motion: on' : 'Motion: off';
  motionToggle.setAttribute('aria-pressed', String(enabled));
  motionToggle.setAttribute('aria-label', enabled ? 'Motion: on. Turn off scroll motion' : 'Motion: off. Turn on scroll motion');
  if (enabled && !film) film = new ScrollFilm(document.querySelector('#film-canvas'), {
    count: 241,
    onError: () => { document.querySelector('.media-error').hidden = false; }
  });
  film?.setEnabled(enabled);
  if (preserveLocation) {
    const nextY = wasBelow ? Math.max(0, scrollY + experience.offsetHeight - previousHeight) : 0;
    window.scrollTo({ top: nextY, behavior: 'instant' });
  }
  measure(); position = target; schedule();
}
window.addEventListener('scroll', () => { measure(); schedule(); syncMenuToScroll(); }, { passive:true });
window.addEventListener('resize', () => { measure(); schedule(); syncMenuToScroll(); });
window.addEventListener('pageshow', () => { measure(); schedule(); });
chapters.forEach((button, i) => button.addEventListener('click', () => {
  const progress = i === 0 ? 0 : stops[i] + .035;
  scrollTo({top: experience.offsetTop + progress * (experience.offsetHeight-innerHeight), behavior:reducedMotion.matches ? 'instant':'smooth'});
}));
motionToggle.addEventListener('click', () => {
  localStorage.setItem('kok-motion', motion ? 'off' : 'on');
  applyMotion(!motion, true);
});
reducedMotion.addEventListener('change', e => {
  if (localStorage.getItem('kok-motion') === null) applyMotion(!e.matches && !saveData, true);
});
compactMenu.addEventListener('change', () => renderMenu(Math.round(menuPosition)));
document.addEventListener('visibilitychange', () => film?.setPaused(document.hidden));
document.querySelector('.dish-arrow-prev').addEventListener('click', () => goToDish(activeDish - 1));
document.querySelector('.dish-arrow-next').addEventListener('click', () => goToDish(activeDish + 1));
dishDots.forEach(dot => dot.addEventListener('click', () => goToDish(Number(dot.dataset.menuIndex))));
coverflow.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); goToDish(activeDish - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); goToDish(activeDish + 1); }
});
coverflow.addEventListener('pointerdown', event => {
  if (event.target.closest('button')) return;
  isDraggingDish = true;
  dragStartX = event.clientX;
  dragStartIndex = menuPosition;
  coverflow.setPointerCapture(event.pointerId);
});
coverflow.addEventListener('pointermove', event => {
  if (!isDraggingDish || !coverflow.hasPointerCapture(event.pointerId)) return;
  renderMenu(dragStartIndex - (event.clientX - dragStartX) / Math.max(180, innerWidth * .23));
});
coverflow.addEventListener('pointerup', event => {
  if (!isDraggingDish || !coverflow.hasPointerCapture(event.pointerId)) return;
  isDraggingDish = false;
  coverflow.releasePointerCapture(event.pointerId);
  goToDish(Math.round(menuPosition));
});
coverflow.addEventListener('pointercancel', () => {
  isDraggingDish = false;
  renderMenu(Math.round(menuPosition));
});
applyMotion(motion);
renderMenu(0);
