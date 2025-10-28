// auth.js
// Simple auth guard and logout handler.
(function () {
  const TOKEN_KEY = 'authToken';

  function isAuth() {
    try { return !!localStorage.getItem(TOKEN_KEY); } catch (e) { return false; }
  }

  function goToLogin(fromIndex) {
    // fromIndex=true means called from index.html (use relative path)
    if (fromIndex) window.location.href = 'pages/samples/login.html';
    else window.location.href = '../../pages/samples/login.html';
  }

  function goToIndex(fromLogin) {
    if (fromLogin) window.location.href = '../../index.html';
    else window.location.href = '/index.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const path = (window.location.pathname || '').toLowerCase();
    const isLoginPage = path.endsWith('/pages/samples/login.html') || path.endsWith('/login.html');
    const isIndex = path.endsWith('/index.html') || path === '/' || path === '';

    if (isLoginPage) {
      // If already logged in, redirect to app
      if (isAuth()) {
        // on login page, index is two levels up
        window.location.href = '../../index.html';
      }
      return; // don't guard login page
    }

    // Protect non-asset pages (basic heuristic)
    const skip = ['/assets/', '/vendors/', '/favicon', '/images/'];
    const isAsset = skip.some(s => path.includes(s));
    if (!isAsset && !isAuth()) {
      // We're likely on an app page and not authenticated - redirect to login
      // index.html is at project root, so use that relative path
      window.location.href = 'pages/samples/login.html';
      return;
    }

    // Attach logout handler if present
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        try { localStorage.removeItem(TOKEN_KEY); } catch (e) { }
        // redirect to login
        window.location.href = 'pages/samples/login.html';
      });
    }
  });
})();
