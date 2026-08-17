import api from '../../../shared/api/client';

export function getMenuItems() {
    return api.get('/menu');
}

export function createMenuItem(data) {
    return api.post('/menu', data);
}

export function updateMenuItem(id, data) {
    return api.put(`/menu/${id}`, data);
}

export function deleteMenuItem(id) {
    return api.delete(`/menu/${id}`);
}
