import api from '../../../shared/api/client';

export function login(email, password) {
    return api.post('/login', { email, password });
}

export function logout() {
    return api.post('/logout');
}

export function getCurrentUser() {
    return api.get('/user');
}
