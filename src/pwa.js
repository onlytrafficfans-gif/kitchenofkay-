const installButtons = [...document.querySelectorAll('[data-install-app]')];
const toast = document.querySelector('[data-app-toast]');
let installPrompt;
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function showToast(message, action) {
  if (!toast) return;
  toast.replaceChildren();
  const text = document.createElement('span');
  text.textContent = message;
  toast.append(text);
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.label;
    button.addEventListener('click', action.run, { once: true });
    toast.append(button);
  }
  toast.hidden = false;
  if (!action) window.setTimeout(() => { toast.hidden = true; }, 3600);
}

function setInstallVisible(visible) {
  installButtons.forEach(button => { button.hidden = !visible; });
  document.documentElement.classList.toggle('install-ready', visible);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  setInstallVisible(true);
});

installButtons.forEach(button => button.addEventListener('click', async () => {
  if (!installPrompt) {
    if (isIos) showToast('On iPhone or iPad: tap Share, then “Add to Home Screen.”');
    return;
  }
  installPrompt.prompt();
  const result = await installPrompt.userChoice;
  if (result.outcome === 'accepted') showToast('Kitchen of Kay was added to your device.');
  installPrompt = undefined;
  setInstallVisible(false);
}));

if (isIos && !isStandalone) setInstallVisible(true);

window.addEventListener('appinstalled', () => {
  installPrompt = undefined;
  setInstallVisible(false);
  showToast('Kitchen of Kay is ready from your home screen.');
});

window.addEventListener('offline', () => showToast('You’re offline. Saved pages and menu images still work.'));
window.addEventListener('online', () => showToast('Back online.'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showToast('A fresh version is ready.', {
              label: 'Refresh',
              run: () => {
                worker.postMessage({ type: 'SKIP_WAITING' });
                navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
              }
            });
          }
        });
      });
    } catch {
      // The website remains fully usable when service workers are unavailable.
    }
  });
}
