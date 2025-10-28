// education.js - uses CRUDTable to render Education CRUD UI
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.CRUDTable) return console.error('CRUDTable helper not loaded');

    window.CRUDTable.create({
      containerId: 'education-crud',
      title: 'Education',
      endpoint: '/Education',
      idKey: 'id',
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'institution', label: 'Institution' },
        { key: 'degree', label: 'Degree' },
        { key: 'fieldOfStudy', label: 'Field of Study' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' }
      ],
      formFields: [
        { key: 'institution', label: 'Institution', type: 'text', required: true },
        { key: 'degree', label: 'Degree', type: 'text', required: true },
        { key: 'fieldOfStudy', label: 'Field of Study', type: 'text', required: true },
        { key: 'startDate', label: 'Start Date', type: 'date', required: true },
        { key: 'endDate', label: 'End Date', type: 'date' }
      ]
    });
  });
})();
