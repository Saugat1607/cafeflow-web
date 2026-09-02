import api from "../../../shared/api/client";

// Get all invoices
export const getInvoices = async (params = {}) => {
    const response = await api.get("/invoices", {
        params,
    });

    return response.data;
};

// Get single invoice
export const getInvoice = async (id) => {
    const response = await api.get(`/invoices/${id}`);

    return response.data;
};

// Create invoice
export const createInvoice = async (data) => {
    const response = await api.post("/invoices", data);

    return response.data;
};

// Update invoice
export const updateInvoice = async (id, data) => {
    const response = await api.put(`/invoices/${id}`, data);

    return response.data;
};

// Delete invoice
export const deleteInvoice = async (id) => {
    const response = await api.delete(`/invoices/${id}`);

    return response.data;
};