import api from "../../../shared/api/client";

// Get all staff
export const getStaff = async () => {
    const response = await api.get("/staff");
    return response.data;
};

// Get single staff
export const getStaffById = async (id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
};

// Create staff
export const createStaff = async (data) => {
    const response = await api.post("/staff", data);
    return response.data;
};

// Update staff
export const updateStaff = async (id, data) => {
    const response = await api.put(`/staff/${id}`, data);
    return response.data;
};

// Delete staff
export const deleteStaff = async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
};