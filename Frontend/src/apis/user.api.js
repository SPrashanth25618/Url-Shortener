import axiosInstance from "../utils/axiosInstance";

export const loginUser = async(password,email) => {
    const {data} = await axiosInstance.post('/auth/login',{email,password});
    return data;
};

export const RegisterUser = async(name,password,email) => {
    const {data} = await axiosInstance.post('/auth/login',{name,email,password});
    return data;
};
export const logoutUser = async() => {
    const {data} = await axiosInstance.get('/auth/logout');
    return data;
};