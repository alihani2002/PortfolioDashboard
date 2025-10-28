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
    try { return new Date(d).toLocaleString(); } catch (e) { return d; }
  }

  function render(items) {
    container.innerHTML = '';

    if (!items || items.length === 0) {
      container.appendChild(mkEl('p','text-muted','No contact messages'));
      return;
    }

    items.forEach(item => {
      const id = item.id || item.ID || item.Id || '';
      const nameText = item.name || item.Name || item.fullName || 'Unknown';
      const emailText = item.email || item.Email || item.mail || '';
      const subjectText = item.subject || item.Subject || item.title || '';
      const bodyText = item.message || item.Message || item.body || '';
      const dateText = item.date || item.createdAt || item.Date || formatDate(item.dateCreated || item.created) || '';
      const phoneText = item.phone || item.Phone || '';

      const card = mkEl('div', 'card mb-3');
      const body = mkEl('div', 'card-body');

      const header = mkEl('div', 'cm-header');
      const avatar = mkEl('div','cm-avatar', initials(nameText));
      const meta = mkEl('div','cm-meta');
      meta.appendChild(mkEl('div','name', nameText));
      meta.appendChild(mkEl('div','email', emailText));

      const right = mkEl('div','text-end');
      right.appendChild(mkEl('div','cm-time', dateText));

      header.appendChild(avatar);
      header.appendChild(meta);
      header.appendChild(right);

      body.appendChild(header);

      if (subjectText) body.appendChild(mkEl('div','cm-subject', subjectText));

      const msg = mkEl('div','cm-body collapsed', bodyText);
      body.appendChild(msg);

      const footer = mkEl('div','cm-footer');
      const tags = mkEl('div','');
      if (phoneText) tags.appendChild(mkEl('span','badge bg-light text-muted me-2', phoneText));
      footer.appendChild(tags);

      const actions = mkEl('div','cm-actions');
      const viewBtn = mkEl('button','btn btn-sm btn-outline-primary','View');
      viewBtn.addEventListener('click', () => {
        if (msg.classList.contains('collapsed')) {
          msg.classList.remove('collapsed');
          viewBtn.textContent = 'Hide';
        } else {
          msg.classList.add('collapsed');
          viewBtn.textContent = 'View';
        }
      });

      const delBtn = mkEl('button','btn btn-sm btn-danger','Delete');
      delBtn.addEventListener('click', function () {
        if (!confirm('Delete this message?')) return;
        if (!id) { alert('Missing id for this message'); return; }
        api.del('/ContactMessage/' + id)
          .then(() => {
            card.remove();
            // optional toast
          })
          .catch(err => {
            console.error('Delete error', err);
            alert('Delete failed');
          });
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
