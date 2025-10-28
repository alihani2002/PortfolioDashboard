// experience.js - uses CRUDTable to render Experience CRUD UI
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.CRUDTable) return console.error('CRUDTable helper not loaded');

    window.CRUDTable.create({
      containerId: 'experience-crud',
      title: 'Experience',
      endpoint: '/Experience',
      idKey: 'id',
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'companyName', label: 'Company Name' },
        { key: 'role', label: 'Role' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        { key: 'companyLogoUrl', label: 'Logo URL' }
      ],
      formFields: [
        { key: 'companyName', label: 'Company Name', type: 'text', required: true },
        { key: 'role', label: 'Role', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', required: true },
        { key: 'startDate', label: 'Start Date', type: 'date', required: true },
        { key: 'endDate', label: 'End Date', type: 'date' },
        { key: 'companyLogoUrl', label: 'Company Logo URL', type: 'text' }
      ]
    });
  });
})();
