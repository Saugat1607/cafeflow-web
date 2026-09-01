import api from "../../../shared/api/client";

/*
|--------------------------------------------------------------------------
| Inventory API
|--------------------------------------------------------------------------
*/

/**
 * Get inventory items
 *
 * Supports:
 * search
 * category
 * status
 * is_active
 * sort_by
 * sort_direction
 * per_page
 */
export const getInventory = async (params = {}) => {
    const response = await api.get("/inventory", {
        params,
    });

    return response.data;
};

/**
 * Get a single inventory item
 */
export const getInventoryItem = async (id) => {
    const response = await api.get(`/inventory/${id}`);

    return response.data;
};

/**
 * Create inventory item
 */
export const createInventoryItem = async (data) => {
    const response = await api.post("/inventory", data);

    return response.data;
};

/**
 * Update inventory item
 */
export const updateInventoryItem = async (id, data) => {
    const response = await api.put(`/inventory/${id}`, data);

    return response.data;
};

/**
 * Deactivate inventory item
 */
export const deleteInventoryItem = async (id) => {
    const response = await api.delete(`/inventory/${id}`);

    return response.data;
};

/**
 * Restore inventory item
 */
export const restoreInventoryItem = async (id) => {
    const response = await api.patch(
        `/inventory/${id}/restore`
    );

    return response.data;
};

/**
 * Get low-stock items
 */
export const getLowStockItems = async () => {
    const response = await api.get("/inventory/low-stock");

    return response.data;
};

/**
 * Get out-of-stock items
 */
export const getOutOfStockItems = async () => {
    const response = await api.get("/inventory/out-of-stock");

    return response.data;
};

/**
 * Get inventory statistics
 */
export const getInventoryStatistics = async () => {
    const response = await api.get("/inventory/statistics");

    return response.data;
};

/**
 * Get inventory categories
 */
export const getInventoryCategories = async () => {
    const response = await api.get("/inventory/categories");

    return response.data;
};