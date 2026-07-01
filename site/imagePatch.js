const APP_IMAGE = './assets/pujas/01-mahakal.svg';

function applyAppPujaImages() {
  document.querySelectorAll('.card img, #selectedPujaImage').forEach((img) => {
    if (img.dataset.appImageFixed === 'true' && img.getAttribute('src') === APP_IMAGE) return;
    img.dataset.appImageFixed = 'true';
    img.onerror = () => {
      img.onerror = null;
      img.src = APP_IMAGE;
    };
    img.src = APP_IMAGE;
  });
}

applyAppPujaImages();
new MutationObserver(applyAppPujaImages).observe(document.body, { childList: true, subtree: true });
window.addEventListener('hashchange', () => setTimeout(applyAppPujaImages, 50));
