import api from '../../../shared/api/client';

export function getOrders() {
    return api.get('/orders');
}

export function getOrder(id) {
    return api.get(`/orders/${id}`);
}

export function createOrder(data) {
    return api.post('/orders', data);
}

export function updateOrderStatus(id, status) {
    return api.patch(`/orders/${id}/status`, { status });
}
