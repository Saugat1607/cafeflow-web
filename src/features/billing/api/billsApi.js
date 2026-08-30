import api from "../../../shared/api/client";

export const getBills = async (params = {}) => {
    const response = await api.get("/bills", {
        params,
    });

    return response.data;
};

export const getBill = async (id) => {
    const response = await api.get(
        `/bills/${id}`
    );

    return response.data;
};

export const createBill = async (data) => {
    const response = await api.post(
        "/bills",
        data
    );

    return response.data;
};

export const updateBill = async (
    id,
    data
) => {
    const response = await api.put(
        `/bills/${id}`,
        data
    );

    return response.data;
};

export const deleteBill = async (id) => {
    const response = await api.delete(
        `/bills/${id}`
    );

    return response.data;
};

export const payBill = async (
    id,
    data
) => {
    const response = await api.post(
        `/bills/${id}/pay`,
        data
    );

    return response.data;
};

export const getOrders = async (
    params = {}
) => {
    const response = await api.get(
        "/orders",
        {
            params,
        }
    );

    return response.data;
};