import api from "../../../shared/api/client";

/*
|--------------------------------------------------------------------------
| Inventory Transaction API
|--------------------------------------------------------------------------
*/

/**
 * Get inventory transactions
 *
 * Supports:
 * search
 * inventory_item_id
 * type
 * date
 * from_date
 * to_date
 * sort_by
 * sort_direction
 * per_page
 */
export const getInventoryTransactions = async (params = {}) => {
    const response = await api.get(
        "/inventory-transactions",
        {
            params,
        }
    );

    return response.data;
};

/**
 * Get a single transaction
 */
export const getInventoryTransaction = async (id) => {
    const response = await api.get(
        `/inventory-transactions/${id}`
    );

    return response.data;
};

/**
 * Stock In
 */
export const stockIn = async (data) => {
    const response = await api.post(
        "/inventory-transactions/stock-in",
        data
    );

    return response.data;
};

/**
 * Stock Out
 */
export const stockOut = async (data) => {
    const response = await api.post(
        "/inventory-transactions/stock-out",
        data
    );

    return response.data;
};

/**
 * Stock Adjustment
 */
export const adjustStock = async (data) => {
    const response = await api.post(
        "/inventory-transactions/adjust",
        data
    );

    return response.data;
};

/**
 * Delete transaction
 */
export const deleteInventoryTransaction = async (id) => {
    const response = await api.delete(
        `/inventory-transactions/${id}`
    );

    return response.data;
};

/**
 * Get history for a specific inventory item
 */
export const getItemTransactionHistory = async (
    itemId,
    params = {}
) => {
    const response = await api.get(
        `/inventory-transactions/item/${itemId}`,
        {
            params,
        }
    );

    return response.data;
};

/**
 * Get transaction statistics
 */
export const getInventoryTransactionStatistics = async (
    params = {}
) => {
    const response = await api.get(
        "/inventory-transactions/statistics",
        {
            params,
        }
    );

    return response.data;
};