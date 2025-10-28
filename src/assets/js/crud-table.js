// crud-table.js
// Reusable helper to render a table with CRUD modals for a given resource.
(function () {
  // Expose a global helper: CRUDTable.create(config)
  // config: { containerId, endpoint, columns: [{key,label}], idKey:'id', formFields: [{key,label,type}] }

  function createTable(config) {
    const container = document.getElementById(config.containerId);
    if (!container) return console.warn('CRUDTable: container not found', config.containerId);

    // Build header with Add button
    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-3';
    const title = document.createElement('h4');
    title.textContent = config.title || config.endpoint.replace(/^\/+/, '');
    header.appendChild(title);
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.textContent = 'New';
    header.appendChild(addBtn);
    container.appendChild(header);

    // Table
    const tableResp = document.createElement('div');
    tableResp.className = 'table-responsive';
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    const thead = document.createElement('thead');
    const thr = document.createElement('tr');
    (config.columns || []).forEach(col => { const th = document.createElement('th'); th.textContent = col.label; thr.appendChild(th); });
    const thActions = document.createElement('th'); thActions.textContent = 'Actions'; thr.appendChild(thActions);
    thead.appendChild(thr);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableResp.appendChild(table);
    container.appendChild(tableResp);

    // Modal (Bootstrap) element - create once
    const modalOuter = document.createElement('div');
    modalOuter.className = 'modal fade';
    modalOuter.tabIndex = -1;
    modalOuter.role = 'dialog';
    modalOuter.innerHTML = `
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary save-btn">Save</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modalOuter);
    const bsModal = new bootstrap.Modal(modalOuter, { backdrop: 'static' });
    const modalBody = modalOuter.querySelector('.modal-body');
    const modalTitle = modalOuter.querySelector('.modal-title');
    const saveBtn = modalOuter.querySelector('.save-btn');

    function buildForm(data) {
      modalBody.innerHTML = '';
      const form = document.createElement('form');
      if (data) {
        // store original data on form for callers that need it (e.g. prepareBody)
        try { form.dataset.originalData = JSON.stringify(data); } catch (e) { form.dataset.originalData = ''; }
      } else {
        form.dataset.originalData = '';
      }
      (config.formFields || []).forEach(f => {
        const div = document.createElement('div'); div.className = 'mb-3';
        const label = document.createElement('label'); label.className = 'form-label'; label.textContent = f.label;
        let input;
        if (f.type === 'textarea') {
          input = document.createElement('textarea'); input.className = 'form-control';
        } else if (f.type === 'file') {
          input = document.createElement('input'); input.type = 'file'; input.className = 'form-control';
          if (f.accept) input.accept = f.accept;
        } else {
          input = document.createElement('input'); input.type = f.type || 'text'; input.className = 'form-control';
        }
        input.name = f.key;
        // Do not set value for file inputs. For others, set existing value if present.
        if (f.type !== 'file' && data && data[f.key] != null) input.value = data[f.key];
        div.appendChild(label);
        div.appendChild(input);

        // If this is a file field and we have an existing URL, show a preview/link
        if (f.type === 'file' && data && data[f.key]) {
          const existingVal = data[f.key];
          if (f.key.toLowerCase().includes('image') || f.key.toLowerCase().includes('photo') || f.key.toLowerCase().includes('imageurl')) {
            const img = document.createElement('img');
            img.src = existingVal;
            img.alt = f.label;
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '6px';
            img.className = 'me-2';
            div.appendChild(document.createElement('br'));
            div.appendChild(img);
          } else if (f.key.toLowerCase().includes('cv') || (typeof existingVal === 'string' && existingVal.toLowerCase().endsWith('.pdf'))) {
            const a = document.createElement('a');
            a.href = existingVal;
            a.target = '_blank';
            a.className = 'btn btn-sm btn-outline-secondary mt-2';
            a.innerHTML = '<i class="mdi mdi-file-pdf"></i> View existing file';
            div.appendChild(document.createElement('br'));
            div.appendChild(a);
          } else {
            const span = document.createElement('div');
            span.textContent = existingVal;
            div.appendChild(document.createElement('br'));
            div.appendChild(span);
          }
        }
        form.appendChild(div);
      });
      modalBody.appendChild(form);
      return form;
    }

    // Load data into table
    // Helper to derive id from item using idKey or common fallbacks
    function getIdFrom(item) {
      if (!item) return null;
      const keys = [config.idKey, 'id', 'ID', 'Id'];
      for (let k of keys) if (k && item[k] != null) return item[k];
      return null;
    }

    function load() {
      tbody.innerHTML = '<tr><td colspan="' + (config.columns.length + 1) + '">Loading...</td></tr>';
      window.api.get(config.endpoint)
        .then(data => {
          const items = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (data ? [data] : []));
          tbody.innerHTML = '';
          items.forEach(it => {
            const tr = document.createElement('tr');
            config.columns.forEach(col => {
              const td = document.createElement('td');
                if (col.render) {
                  td.innerHTML = col.render(it[col.key], it);
                } else {
                  td.textContent = (it[col.key] != null) ? String(it[col.key]) : '';
                }
              tr.appendChild(td);
            });
            const tdActions = document.createElement('td');
            const editBtn = document.createElement('button'); editBtn.className = 'btn btn-sm btn-outline-primary me-2'; editBtn.textContent = 'Edit';
            const delBtn = document.createElement('button'); delBtn.className = 'btn btn-sm btn-outline-danger'; delBtn.textContent = 'Delete';
            tdActions.appendChild(editBtn); tdActions.appendChild(delBtn);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);

            editBtn.addEventListener('click', function () {
              modalTitle.textContent = 'Edit ' + (config.title || 'item');
              const id = getIdFrom(it);
              if (!id) return alert('Item id missing');
              // fetch full item from server in case table row has partial data
              window.api.get(config.endpoint + '/' + id)
                .then(full => {
                  const form = buildForm(full);
                  saveBtn.onclick = async function () {
                    try {
                      let body;
                      if (config.prepareBody) {
                        body = await config.prepareBody(form, full);
                      } else {
                        body = {};
                        (config.formFields || []).forEach(f => { body[f.key] = form.elements[f.key].value; });
                      }
                      await window.api.put(config.endpoint + '/' + id, body);
                      // if server returns updated object, reload or update row
                      bsModal.hide();
                      load();
                    } catch (err) {
                      alert('Update failed');
                      console.error(err);
                    }
                  };
                  bsModal.show();
                })
                .catch(err => { alert('Failed to load item for edit'); console.error(err); });
            });

            delBtn.addEventListener('click', function () {
              if (!confirm('Delete this item?')) return;
              const id = getIdFrom(it);
              if (!id) return alert('Item id missing');
              window.api.del(config.endpoint + '/' + id)
                .then(() => { load(); })
                .catch(err => { alert('Delete failed'); console.error(err); });
            });
          });
        })
        .catch(err => { tbody.innerHTML = '<tr><td colspan="' + (config.columns.length + 1) + '">Error loading</td></tr>'; console.error(err); });
    }

    addBtn.addEventListener('click', function () {
      modalTitle.textContent = 'New ' + (config.title || 'item');
      const form = buildForm(null);
      saveBtn.onclick = async function () {
        try {
          let body;
          if (config.prepareBody) {
            body = await config.prepareBody(form, null);
          } else {
            body = {};
            (config.formFields || []).forEach(f => { body[f.key] = form.elements[f.key].value; });
          }
          await window.api.post(config.endpoint, body);
          // If server returns created object, try to refresh or append
          bsModal.hide();
          // prefer to reload full list to keep it simple and consistent
          load();
        } catch (err) {
          alert('Create failed');
          console.error(err);
        }
      };
      bsModal.show();
    });

    // initial load
    load();
    return { reload: load };
  }

  window.CRUDTable = { create: createTable };
})();
