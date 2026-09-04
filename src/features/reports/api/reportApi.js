import api from "../../../shared/api/client";

// Get today's report
export const getTodayReport = async () => {
    const response = await api.get("/reports/today");
    return response.data;
};

// Get report for a specific date
export const getReportByDate = async (date) => {
    const response = await api.get(`/reports/date/${date}`);
    return response.data;
};

// Get report history
export const getReportHistory = async (fromDate, toDate) => {
    const response = await api.get("/reports/history", {
        params: {
            from_date: fromDate,
            to_date: toDate,
        },
    });

    return response.data;
};

// Generate/update a report
export const generateReport = async (date) => {
    const response = await api.post("/reports/generate", {
        date,
    });

    return response.data;
};

// Generate reports for a date range
export const generateReportsForRange = async (fromDate, toDate) => {
    const response = await api.post("/reports/generate-range", {
        from_date: fromDate,
        to_date: toDate,
    });

    return response.data;
};