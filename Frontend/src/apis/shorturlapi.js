import axiosInstance from "../utils/axiosInstance.js";

export const createShorturl = async(url) => {
    return await axiosInstance.post("api/create", { url: url.trim() });
};