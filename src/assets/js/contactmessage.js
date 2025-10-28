// contactmessage.js
// Renders contact messages as full-width professional cards and supports delete.
(function () {
  const container = document.getElementById('contact-messages');
  if (!container) return;

  function mkEl(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function formatDate(d) {
    try { return new Date(d).toLocaleString(); } catch (e) { return d; }
  }

  function render(items) {
    container.innerHTML = '';

    if (!items || items.length === 0) {
      container.appendChild(mkEl('p','text-muted','No contact messages'));
      return;
    }

    // Use a single column full-width layout. Each card is wide and spaced.
    items.forEach(item => {
      const card = mkEl('div', 'card mb-3');
      const body = mkEl('div', 'card-body');

      // Header: name, email, date
      const header = mkEl('div', 'd-flex justify-content-between align-items-start');
      const left = mkEl('div', '');
      const name = mkEl('h5', 'card-title mb-1', item.name || item.Name || item.fullName || 'Unknown');
      const email = mkEl('div', 'text-muted small', item.email || item.Email || item.mail || '');
      left.appendChild(name);
      left.appendChild(email);

      const right = mkEl('div', 'text-muted small text-end');
      right.textContent = item.date || item.createdAt || item.Date || formatDate(item.dateCreated || item.created) || '';

      header.appendChild(left);
      header.appendChild(right);

      body.appendChild(header);

      // Subject (if present)
      if (item.subject || item.Subject || item.title) {
        body.appendChild(mkEl('h6','mt-2', item.subject || item.Subject || item.title));
      }

      // Message
      const msg = mkEl('p', 'card-text mt-2', item.message || item.Message || item.body || '');
      body.appendChild(msg);

      // Footer with actions
      const footer = mkEl('div', 'd-flex justify-content-between align-items-center mt-3');
      const tags = mkEl('div', '');
      // example: show phone if available
      if (item.phone || item.Phone) {
        const phone = mkEl('span', 'badge bg-light text-muted me-2', item.phone || item.Phone);
        tags.appendChild(phone);
      }
      footer.appendChild(tags);

      const actions = mkEl('div', '');
      const del = mkEl('button', 'btn btn-sm btn-danger me-2', 'Delete');
      del.addEventListener('click', function () {
        if (!confirm('Delete this message?')) return;
        if (!item.id && !item.ID && !item.Id) {
          alert('Missing id for this message');
          return;
        }
        const id = item.id || item.ID || item.Id;
        window.api.del('/ContactMessage/' + id)
          .then(() => { card.remove(); })
          .catch(err => { console.error('Delete error', err); alert('Delete failed'); });
      });
      actions.appendChild(del);

      // optional reply / mark as read buttons can be added here
      footer.appendChild(actions);

      body.appendChild(footer);
      card.appendChild(body);

      container.appendChild(card);
    });
  }

  // Fetch messages
  container.innerHTML = '<p class="text-muted">Loading contact messages...</p>';
  window.api.get('/ContactMessage')
    .then(data => {
      const items = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (data ? [data] : []));
      render(items);
    })
    .catch(err => {
      console.error('ContactMessage load error', err);
      container.innerHTML = '<div class="alert alert-danger">Error loading messages</div>';
    });

})();
