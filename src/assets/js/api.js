// src/js/api.js
;(function (global) {
  const API_BASE = (global.APP_CONFIG && global.APP_CONFIG.API_BASE) || '';

  function buildUrl(path) {
    if (!path) return API_BASE;
    try {
      const url = new URL(path);
      return url.href;
    } catch {
      // relative path
    }
    return API_BASE.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
  }

  function getToken() {
    return localStorage.getItem('authToken'); // store your JWT if needed
  }

  function defaultHeaders(isJson = true) {
    const headers = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  }

  async function request(method, path, { params, body, headers = {}, signal } = {}) {
    let url = buildUrl(path);

    if (params && typeof params === 'object') {
      const qs = new URLSearchParams(params).toString();
      if (qs) url += (url.indexOf('?') === -1 ? '?' : '&') + qs;
    }

    const isJson = !(body instanceof FormData);
    const mergedHeaders = Object.assign({}, defaultHeaders(isJson), headers);

    const opts = {
      method,
      headers: mergedHeaders,
      signal,
      credentials: 'same-origin'
    };

    if (body != null) {
      opts.body = isJson ? JSON.stringify(body) : body;
    }

    let res;
    try {
      res = await fetch(url, opts);
    } catch (err) {
      throw { kind: 'network', error: err };
    }

    const contentType = res.headers.get('content-type') || '';
    const parseJson = contentType.includes('application/json');

    let payload;
    try {
      payload = parseJson ? await res.json() : await res.text();
    } catch {
      payload = null;
    }

    if (!res.ok) {
      throw { kind: 'http', status: res.status, body: payload };
    }

    return payload;
  }

  const api = {
    get(path, options) {
      return request('GET', path, options);
    },
    post(path, body, options = {}) {
      return request('POST', path, Object.assign({}, options, { body }));
    },
    put(path, body, options = {}) {
      return request('PUT', path, Object.assign({}, options, { body }));
    },
    del(path, options) {
      return request('DELETE', path, options);
    },
    setToken(token) {
      if (token) localStorage.setItem('authToken', token);
      else localStorage.removeItem('authToken');
    },
    // Add form data specific methods
    postForm(path, formData, options = {}) {
      return request('POST', path, Object.assign({}, options, { body: formData }));
    },
    putForm(path, formData, options = {}) {
      return request('PUT', path, Object.assign({}, options, { body: formData }));
    }
  };

  global.api = api;
})(window);
