const API_BASE = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// ============ Project API ============

export const projectAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/projects${query ? `?${query}` : ''}`);
    },

    getById: (id) => request(`/projects/${id}`),

    create: (data) =>
        request('/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        request(`/projects/${id}`, {
            method: 'DELETE',
        }),

    addDependency: (id, dependsOnProjectId) =>
        request(`/projects/${id}/dependencies`, {
            method: 'POST',
            body: JSON.stringify({ depends_on_project_id: dependsOnProjectId }),
        }),

    removeDependency: (id, depId) =>
        request(`/projects/${id}/dependencies/${depId}`, {
            method: 'DELETE',
        }),
};

// ============ Task API ============

export const taskAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/tasks${query ? `?${query}` : ''}`);
    },

    getById: (id) => request(`/tasks/${id}`),

    create: (data) =>
        request('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        request(`/tasks/${id}`, {
            method: 'DELETE',
        }),

    addDependency: (id, dependsOnTaskId) =>
        request(`/tasks/${id}/dependencies`, {
            method: 'POST',
            body: JSON.stringify({ depends_on_task_id: dependsOnTaskId }),
        }),

    removeDependency: (id, depId) =>
        request(`/tasks/${id}/dependencies/${depId}`, {
            method: 'DELETE',
        }),
};
