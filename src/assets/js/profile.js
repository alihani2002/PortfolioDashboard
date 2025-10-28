// src/js/profile.js
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.CRUDTable) {
      console.error("CRUDTable helper not loaded");
      return;
    }

    const API_BASE = window.APP_CONFIG?.API_BASE || "https://alyhani.tryasp.net/api";

    // ✅ Initialize Profile CRUD table
    window.CRUDTable.create({
      containerId: "profile-crud",
      title: "Profile",
      endpoint: `${API_BASE}/Profile`,
      idKey: "id",

      columns: [
        { key: "id", label: "ID" },
        {
          key: "imageUrl",
          label: "Photo",
          render: (value) =>
            value
              ? `<img src="${value}" alt="Profile" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">`
              : "-",
        },
        { key: "fullName", label: "Full Name" },
        { key: "title", label: "Title" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "location", label: "Location" },
        {
          key: "cvUrl",
          label: "CV",
          render: (value) =>
            value
              ? `<a href="${value}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="mdi mdi-file-pdf"></i> View CV</a>`
              : "-",
        },
      ],

      formFields: [
        { key: "fullName", label: "Full Name", type: "text", required: true },
        { key: "title", label: "Title", type: "text", required: true },
        { key: "bio", label: "Bio", type: "textarea", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "phone", label: "Phone", type: "tel", required: true },
        { key: "location", label: "Location", type: "text", required: true },
        { key: "linkedInUrl", label: "LinkedIn URL", type: "url" },
        { key: "gitHubUrl", label: "GitHub URL", type: "url" },
        {
          key: "imageUrl",
          label: "Profile Image",
          type: "file",
          accept: "image/*",
        },
        {
          key: "cvUrl",
          label: "CV File",
          type: "file",
          accept: ".pdf",
        },
      ],

      // ✅ Prepare FormData for POST/PUT
      prepareBody: async (form, existing) => {
        const fd = new FormData();

        for (let i = 0; i < form.elements.length; i++) {
          const el = form.elements[i];
          if (!el.name) continue;

          if (el.type === "file") {
            const file = el.files && el.files[0];
            if (file) {
              if (el.name === "imageUrl") fd.append("ImageFile", file);
              else if (el.name === "cvUrl") fd.append("CvFile", file);
            } else {
              const existingVal = existing ? existing[el.name] || "" : "";
              fd.append(el.name, existingVal);
            }
          } else {
            fd.append(el.name, el.value || "");
          }
        }

        if (existing && existing.id != null) {
          fd.append("id", existing.id);
        }

        return fd;
      },

      // ✅ CRUD Handlers
      api: {
        list: async () => api.get(`${API_BASE}/Profile`),
        create: async (body) => api.post(`${API_BASE}/Profile`, body),
        update: async (id, body) => api.put(`${API_BASE}/Profile/${id}`, body),
        delete: async (id) => api.del(`${API_BASE}/Profile/${id}`),
      },
    });
  });
})();
