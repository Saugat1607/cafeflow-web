import api from '../../../shared/api/client';

// GET /dashboard returns:
// { success, message, data: [ { id, name, ...table fields, orders: [ { id, status, items: [ { quantity, unit_price, menuItem: {...} } ] } ] } ] }
export function getDashboardStats() {
    return api.get('/dashboard');
}