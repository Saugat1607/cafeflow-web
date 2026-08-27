import api from "../../../shared/api/client";

export const getBills = async (params = {}) => {
    const response = await api.get("/bills", {
        params,
    });

    return response.data;
};

export const getBill = async (id) => {
    const response = await api.get(`/bills/${id}`);

    return response.data;
};

export const createBill = async (data) => {
    const response = await api.post("/bills", data);

    return response.data;
};

export const updateBill = async (id, data) => {
    const response = await api.put(`/bills/${id}`, data);

    return response.data;
};

export const deleteBill = async (id) => {
    const response = await api.delete(`/bills/${id}`);

    return response.data;
};

export const getRecentUnbilledOrders = async () => {
    const response = await api.get('/bills/recent-orders');
    return response.data;
};