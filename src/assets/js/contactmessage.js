// contactmessage.js
// Renders contact messages as professional cards with actions and expand/collapse
(function () {
  const container = document.getElementById('contact-messages');
  if (!container) return;

  function mkEl(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function initials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] || '').toUpperCase() + ((parts[1] && parts[1][0]) || '').toUpperCase();
  }

  function formatDate(d) {
    if (!d) return 'Unknown';
    const date = new Date(d);
    return isNaN(date) ? d : date.toLocaleString();
  }

  function render(items) {
    container.innerHTML = '';

    if (!items || items.length === 0) {
      container.appendChild(mkEl('p', 'text-muted', 'No contact messages'));
      return;
    }

    items.forEach(item => {
      const id = item.id;
      const nameText = item.name || 'Unknown';
      const emailText = item.email || '';
      const subjectText = item.subject || '';
      const bodyText = item.message || '';
      const dateText = formatDate(item.createdOn);
      const phoneText = item.phone || '';

      const card = mkEl('div', 'card mb-3 shadow-sm');
      const body = mkEl('div', 'card-body');

      const header = mkEl('div', 'cm-header d-flex justify-content-between align-items-center mb-2');

      const left = mkEl('div', 'd-flex align-items-center gap-3');
      const avatar = mkEl('div', 'cm-avatar bg-primary text-white rounded-circle p-2 fw-bold', initials(nameText));
      const meta = mkEl('div');
      meta.appendChild(mkEl('div', 'fw-semibold', nameText));
      meta.appendChild(mkEl('div', 'text-muted small', emailText));

      left.appendChild(avatar);
      left.appendChild(meta);

      const right = mkEl('div', 'text-end text-muted small', dateText);

      header.appendChild(left);
      header.appendChild(right);
      body.appendChild(header);

      if (subjectText) body.appendChild(mkEl('div', 'fw-bold mb-2', subjectText));

      const msg = mkEl('div', 'cm-body collapsed', bodyText);
      body.appendChild(msg);

      const footer = mkEl('div', 'cm-footer d-flex justify-content-between align-items-center mt-3');

      const tags = mkEl('div', '');
      if (phoneText)
        tags.appendChild(mkEl('span', 'badge bg-light text-muted me-2', phoneText));
      footer.appendChild(tags);

      const actions = mkEl('div', 'cm-actions');
      const viewBtn = mkEl('button', 'btn btn-sm btn-outline-primary me-2', 'View');
      viewBtn.addEventListener('click', () => {
        const expanded = !msg.classList.toggle('collapsed');
        viewBtn.textContent = expanded ? 'Hide' : 'View';
      });

      const delBtn = mkEl('button', 'btn btn-sm btn-danger', 'Delete');
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this message?')) return;
        if (!id) {
          alert('Missing ID for this message');
          return;
        }

        try {
          await api.del('/ContactMessage/' + id);
          card.remove();
        } catch (err) {
          console.error('Delete error', err);
          alert('Delete failed');
        }
      });

      actions.appendChild(viewBtn);
      actions.appendChild(delBtn);
      footer.appendChild(actions);

      body.appendChild(footer);
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  // Fetch messages
  container.innerHTML = '<p class="text-muted">Loading contact messages...</p>';
  window.api
    .get('/ContactMessage')
    .then(data => {
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : data
        ? [data]
        : [];
      render(items);
    })
    .catch(err => {
      console.error('ContactMessage load error', err);
      container.innerHTML = '<div class="alert alert-danger">Error loading messages</div>';
    });
})();
