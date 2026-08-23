import api from '../../../shared/api/client';

export const getBills = async (params = {}) => {
    const response = await api.get('/bills', { params });
    return response.data;   

};

export const getBill = async (id) => {
    const response = await api.get(`/bills/${id}`);

    return response.data;
};

export const createBill = async (data) => {
    const response = await api.post(
        '/bills',
        data
    );

    return response.data;
};