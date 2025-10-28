(function () {
  const loader = document.getElementById('site-loader');
  if (!loader) return;

  // Hide loader when window fully loads
  window.addEventListener('load', () => {
    // small delay to show a smooth transition
    setTimeout(() => hideLoader(), 250);
  });

  // Export a function to hide loader manually (useful after app init)
  window.hideLoader = function () {
    if (!loader) return;
    loader.classList.add('hidden');
    // remove from DOM after transition to free memory
    setTimeout(() => {
      try { loader.remove(); } catch (e) { /* ignore */ }
    }, 500);
  };

  // Failsafe: hide loader after 8 seconds in case something hangs
  setTimeout(() => {
    if (document.getElementById('site-loader')) {
      console.warn('Loader timeout reached, hiding loader.');
      window.hideLoader();
    }
  }, 8000);
})();
