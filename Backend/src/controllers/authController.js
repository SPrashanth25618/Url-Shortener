import User from "../models/user.js";
import { findUserbyEmail, createUser } from "../dao/user_dao.js";
import { signtoken } from "../Utils/nanoid.js";
import { cookieOptions } from "../config/config.js";

/**
 * Register helper - returns both token and created user
 */
async function register_user(name, email, password) {
  const existing = await findUserbyEmail(email);
  if (existing) throw new Error("User already exists");

  const newuser = await createUser({ name, email, password });

  // ensure we sign a string id to avoid ObjectId vs string mismatch
  const token = signtoken({ id: String(newuser._id) });

  // return user under the key 'user' to match the controllers' destructuring
  return { token, user: newuser };
}

/**
 * Login helper - returns token + user
 * NOTE: This compares plaintext passwords. Use bcrypt in production.
 */
async function login_user(email, password) {
  const user = await findUserbyEmail(email);
  if (!user || user.password !== password) throw new Error("Invalid Credentials");

  const token = signtoken({ id: String(user._id) });
  return { token, user };
}

/** Login controller */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await login_user(email, password);

    // attach user and set cookie
    req.user = user;
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({ message: "Login successful", user: { _id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/** Register controller */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { token, user } = await register_user(name, email, password);

    // attach user and set cookie
    req.user = user;
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({ message: "Register successful", user: { _id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
