// Example: fetch a list of items and render into #api-data
// Put this in an existing file that's loaded after api.js (e.g., dashboard.js or template.js)
(function () {
  // Render ContactMessage records into the #api-data element on the home page
  const el = document.getElementById('api-data');
  if (!el) return;

  el.textContent = 'Loading contact messages...';

  window.api.get('/ContactMessage')
    .then(data => {
      if (!data) return el.textContent = 'No data';

      // If the API returns an object with a data property, use it
      const items = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : [data]);

      // If items is empty
      if (!items || items.length === 0) {
        el.textContent = 'No contact messages';
        return;
      }

      // Build a simple table using keys from the first item
      const keys = Object.keys(items[0]);
      const table = document.createElement('table');
      table.className = 'table table-sm table-striped';

      const thead = document.createElement('thead');
      const trHead = document.createElement('tr');
      keys.forEach(k => {
        const th = document.createElement('th');
        th.textContent = k;
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      items.forEach(it => {
        const tr = document.createElement('tr');
        keys.forEach(k => {
          const td = document.createElement('td');
          let v = it[k];
          if (v === null || v === undefined) v = '';
          // For objects or arrays, stringify small
          if (typeof v === 'object') v = JSON.stringify(v);
          td.textContent = String(v);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      // Replace contents of el with the table
      el.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      wrapper.appendChild(table);
      el.appendChild(wrapper);
    })
    .catch(err => {
      console.error('ContactMessage API error', err);
      el.textContent = 'Error loading contact messages';
    });
})();