import User from "../models/user.js";

export const findUserbyEmail = async (email) => {
    return await User.findOne({ email });
};

export const findUserbyId = async (id) => {
    return await User.findById(id);
};

export const createUser = async ({ name, email, password }) => {
    const newuser = new User({ name, email, password });
    await newuser.save();
    return newuser;
};
