import axiosInstance from "../utils/axiosInstance";

export const createShorturl = async(url) => {
    return await axiosInstance.post("api/create", { url: url.trim() });
};