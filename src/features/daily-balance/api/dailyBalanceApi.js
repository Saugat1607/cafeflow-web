import api from "../../../shared/api/client";

//get daily balance 

export const getDailyBalance = async (date) => {
    const response = await api.get("/daily-balance" , {
        params: {
            date,
        },
    });

    return response.date;
};