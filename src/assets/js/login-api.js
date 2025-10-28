// login-api.js
// Handles login form submit, posts to API and stores token then redirects.
(function () {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailEl = document.getElementById('exampleInputEmail1');
  const passEl = document.getElementById('exampleInputPassword1');
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('btn-signin');

  function showError(msg, details) {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = msg + (details ? '\n' + details : '');
    } else {
      // fallback
      console.warn('Login error:', msg, details || '');
      alert(msg);
    }
  }

  function tryFormEncoded(endpoint, email, password) {
    // fallback to application/x-www-form-urlencoded
    const url = (window.APP_CONFIG && window.APP_CONFIG.API_BASE)
      ? (window.APP_CONFIG.API_BASE.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, ''))
      : endpoint;

    const body = new URLSearchParams({ email: email, password: password }).toString();
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body,
      credentials: 'same-origin'
    }).then(async res => {
      const text = await res.text();
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = text; }
      if (!res.ok) throw { kind: 'http', status: res.status, body: parsed, raw: text };
      return parsed;
    }).catch(err => { throw err; });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!emailEl || !passEl) return showError('Missing form fields');

    const email = emailEl.value.trim();
    const password = passEl.value;
    if (!email || !password) return showError('Enter email and password');

    if (btn) btn.disabled = true;
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }

  // Default endpoint for this project
  // Your API's full login URL is usually API_BASE + '/Auth/login'
  const endpoint = form.dataset.loginEndpoint || '/Auth/login';

    console.info('Attempting JSON login to', endpoint, 'with', email);

    // First try JSON (the api wrapper)
    window.api.post(endpoint, { email: email, password: password })
      .then(resp => {
        console.info('Login response (JSON attempt):', resp);
        const token = (resp && (resp.token || resp.access_token || resp.authToken || resp.jwt)) || null;
        if (token) {
          window.api.setToken(token);
          window.location.href = '../../index.html';
          return;
        }

        if (resp && resp.data) {
          const nested = resp.data;
          const t = (nested.token || nested.access_token || nested.authToken || nested.jwt);
          if (t) {
            window.api.setToken(t);
            window.location.href = '../../index.html';
            return;
          }
        }

        // If server returned success but no token, still allow redirect if response indicates success
        if (resp && (resp.success || resp.ok)) {
          window.location.href = '../../index.html';
          return;
        }

        // If we get here, JSON login didn't yield a token. Try form-encoded as a fallback.
        console.info('JSON login did not return token, trying form-encoded fallback');
        return tryFormEncoded(endpoint, email, password)
          .then(fresp => {
            console.info('Login response (form fallback):', fresp);
            const token2 = (fresp && (fresp.token || fresp.access_token || fresp.authToken || fresp.jwt)) || null;
            if (token2) {
              window.api.setToken(token2);
              window.location.href = '../../index.html';
              return;
            }
            if (fresp && (fresp.success || fresp.ok)) {
              window.location.href = '../../index.html';
              return;
            }
            showError('Login failed: no token in response', JSON.stringify(fresp));
          });
      })
      .catch(err => {
        console.error('Login error (JSON attempt)', err);
        // network errors (CORS or offline)
        if (err && err.kind === 'network') return showError('Network error - check API / CORS', err.error && err.error.message);
        // HTTP error with body
        if (err && err.kind === 'http') {
          // try fallback to form-encoded for some status codes
          if (err.status === 415 || err.status === 400 || err.status === 401) {
            console.info('HTTP', err.status, 'trying form-encoded fallback');
            return tryFormEncoded(endpoint, email, password)
              .then(fresp => {
                console.info('Login response (form fallback after http error):', fresp);
                const token2 = (fresp && (fresp.token || fresp.access_token || fresp.authToken || fresp.jwt)) || null;
                if (token2) {
                  window.api.setToken(token2);
                  window.location.href = '../../index.html';
                  return;
                }
                showError('Login failed', JSON.stringify(fresp));
              })
              .catch(ferr => {
                console.error('Form fallback error', ferr);
                showError('Login failed', ferr && ferr.body ? JSON.stringify(ferr.body) : (ferr && ferr.message) || '');
              });
          }

          // otherwise show the server-provided body if any
          try {
            showError('Login failed: ' + err.status, err.body ? (typeof err.body === 'string' ? err.body : JSON.stringify(err.body)) : '');
          } catch (e) { showError('Login failed: ' + err.status); }
          return;
        }

        // unknown error
        showError('Login failed', err && err.message ? err.message : JSON.stringify(err));
      })
      .finally(() => { if (btn) btn.disabled = false; });
  });
})();
