import api from "../../../shared/api/client";
//get expenses
export const getExpenses = async(params = {}) => {
    const response = await api.get("/expenses", {
        params,
    });

    return response.data;
};

//get single expense

export const getExpense  = async(id) => {
    const response = await api.get(
        `/expenses/${id}`
    );

    return response.data;
};

//create expense
export const createExpense = async(data) => {
    const response = await api.post(
        "/expenses",
        data
    );

    return response.data;
};

//update expense
export const updateExpense = async(id, data) => {
    const response = await api.put(
        `/expenses/${id}`,
        data
    );

    return response.data;
};

//delete expense
export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);

    return response.data;
};

//get daily expenses
export const getDailyExpenses = async(data) => {
    const response = await api.get("/expenses-report/daily-total", {
        params: data
    });

    return response.data;
};

///get expenses by category
export const getExpensesByCategory = async(params) => {
    const response = await api.get("/expenses-report/category-totals", {
        params: data
    });

    return response.data;
};
    