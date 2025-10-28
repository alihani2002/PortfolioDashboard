document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    setupEventListeners();
});

// Global variables
let isEditing = false;
const API_BASE = window.APP_CONFIG?.API_BASE || "https://alyhani.tryasp.net/api";
const API_URL = `${API_BASE}/Project`;

// Make sure the api helper is available
if (!window.api) {
    console.error("API helper not loaded");
}

function setupEventListeners() {
    // File input change event for image preview
    document.getElementById('imageFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Save project button click
    document.getElementById('saveProject').addEventListener('click', saveProject);

    // Modal close event - reset form
    document.getElementById('addProjectModal').addEventListener('hidden.bs.modal', function () {
        resetForm();
    });
}

async function loadProjects() {
    try {
        console.log('Fetching from:', API_URL); // Debug log
        
        let projects;
        try {
            projects = await api.get(API_URL);
        } catch (error) {
            if (error.kind === 'http' && error.status === 404) {
                console.log('No projects found or endpoint not available');
                projects = [];
            } else {
                throw error;
            }
        }

        console.log('Projects loaded:', projects); // Debug log
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        let errorMessage = 'Error loading projects';
        
        if (error.kind === 'http') {
            if (error.status === 401) {
                errorMessage = 'Please log in to view projects';
            } else {
                errorMessage = `Server error: ${error.status}`;
                if (error.body && error.body.message) {
                    errorMessage += ` - ${error.body.message}`;
                }
            }
        } else if (error.kind === 'network') {
            errorMessage = 'Network error. Please check your connection.';
        }
        
        showAlert(errorMessage, 'danger');
    }
}

function displayProjects(projects) {
    const tbody = document.getElementById('projectTableBody');
    tbody.innerHTML = '';

    projects.forEach(project => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.id}</td>
            <td>${project.title}</td>
            <td>${project.description.substring(0, 50)}...</td>
            <td><img src="${project.imageUrl}" alt="${project.title}" style="max-width: 100px;"></td>
            <td><a href="${project.gitHubUrl}" target="_blank">GitHub</a></td>
            <td><a href="${project.liveDemoUrl}" target="_blank">Demo</a></td>
            <td>${new Date(project.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProject(${project.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject(${project.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function saveProject() {
    try {
        const form = document.getElementById('projectForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const projectId = document.getElementById('projectId').value;
        
        // Create FormData instance
        const formData = new FormData();
        
        // Add text fields with exact field names matching the DTO
        formData.append('Title', document.getElementById('title').value);
        formData.append('Description', document.getElementById('description').value);
        formData.append('GitHubUrl', document.getElementById('githubUrl').value);
        formData.append('LiveDemoUrl', document.getElementById('liveDemoUrl').value);
        
        // Add image file if selected
        const imageFile = document.getElementById('imageFile').files[0];
        if (imageFile) {
            formData.append('ImageFile', imageFile);
        }

        // Debug: Log form data
        console.log('Form data contents:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        let response;
        if (isEditing) {
            console.log('Updating project:', projectId);
            response = await api.putForm(`${API_URL}/${projectId}`, formData);
        } else {
            console.log('Creating new project');
            response = await api.postForm(API_URL, formData);
        }

        if (response) {
            console.log('Server response:', response);
        }

            showAlert('Project saved successfully', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProjectModal'));
            modal.hide();
            loadProjects();

    } catch (error) {
            console.error('Error saving project:', error);
            let errorMessage = 'Error saving project';
        
            if (error.kind === 'http') {
                if (error.status === 401) {
                    errorMessage = 'Please log in to save projects';
                } else if (error.status === 400) {
                    errorMessage = 'Invalid project data. Please check your inputs.';
                    if (error.body && error.body.errors) {
                        errorMessage += ' ' + Object.values(error.body.errors).flat().join(', ');
                    }
                } else if (error.status === 413) {
                    errorMessage = 'The image file is too large. Please choose a smaller file.';
                } else {
                    errorMessage = `Server error: ${error.status}`;
                    if (error.body && error.body.message) {
                        errorMessage += ` - ${error.body.message}`;
                    }
                }
            } else if (error.kind === 'network') {
                errorMessage = 'Network error. Please check your connection.';
            }
        
            showAlert(errorMessage, 'danger');
    }
}

async function editProject(id) {
    try {
        console.log('Fetching project:', `${API_URL}/${id}`); // Debug log
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        const project = await response.json();

        document.getElementById('projectId').value = project.id;
        document.getElementById('title').value = project.title;
        document.getElementById('description').value = project.description;
        document.getElementById('githubUrl').value = project.gitHubUrl;
        document.getElementById('liveDemoUrl').value = project.liveDemoUrl;

        if (project.imageUrl) {
            const preview = document.getElementById('imagePreview');
            preview.src = project.imageUrl;
            preview.style.display = 'block';
        }

        isEditing = true;
        document.getElementById('addProjectModalLabel').textContent = 'Edit Project';
        $('#addProjectModal').modal('show');
    } catch (error) {
        console.error('Error loading project for edit:', error);
        showAlert('Error loading project', 'danger');
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        console.log('Deleting project via api helper:', `${API_URL}/${id}`); // Debug log

        // Use the api helper so Authorization header and error parsing are consistent
        await api.del(`${API_URL}/${id}`);

        showAlert('Project deleted successfully', 'success');
        loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        let errorMessage = 'Error deleting project';

        if (error.kind === 'http') {
            if (error.status === 401) {
                errorMessage = 'Unauthorized. Please log in.';
            } else if (error.status === 404) {
                errorMessage = 'Project not found.';
            } else {
                errorMessage = `Server error: ${error.status}`;
                if (error.body && error.body.message) errorMessage += ` - ${error.body.message}`;
            }
        } else if (error.kind === 'network') {
            errorMessage = 'Network error. Please check your connection.';
        }

        showAlert(errorMessage, 'danger');
    }
}

function resetForm() {
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('addProjectModalLabel').textContent = 'Add New Project';
    isEditing = false;
}

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.content-wrapper');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}