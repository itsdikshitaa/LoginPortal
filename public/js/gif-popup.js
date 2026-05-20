document.addEventListener('DOMContentLoaded', () => {
  const gifPopup = document.getElementById('gif-popup');
  const closeBtn = document.getElementById('closeGifPopup');

  if (!gifPopup || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    gifPopup.style.display = 'none';
  });

  gifPopup.addEventListener('click', (event) => {
    if (event.target === gifPopup) {
      gifPopup.style.display = 'none';
    }
  });
});
