import './info.css';

const button = document.querySelector('[data-test-pay]');
const message = document.querySelector('[data-test-message]');
const token = new URLSearchParams(location.search).get('token');

function showMessage(text) {
  message.textContent = text;
  message.hidden = false;
}

if (!token) {
  button.disabled = true;
  showMessage('This private test link is incomplete.');
} else {
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Opening secure checkout…';
    try {
      const response = await fetch('/api/create-test-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) throw new Error(data.error || 'Unable to start checkout.');
      location.assign(data.url);
    } catch (error) {
      showMessage(error.message || 'Unable to start checkout.');
      button.disabled = false;
      button.textContent = 'Pay $1 securely';
    }
  });
}
