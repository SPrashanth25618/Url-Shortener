// middleware/auth_middleware.js
import { findUserbyId } from "../dao/user_dao.js";
import { verifytoken } from "../Utils/nanoid.js";

export const auth_middleware = async (req, res, next) => {
  try {
    // accept cookie 'token' or Authorization header 'Bearer <token>'
    let token = req.cookies && req.cookies.token;
    if (!token && req.headers && req.headers.authorization) {
      const parts = String(req.headers.authorization).split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") token = parts[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: no token provided" });
    }

    // verify token (supports sync and async)
    let decoded;
    try {
      decoded = await Promise.resolve(verifytoken(token));
    } catch (err) {
      console.warn("auth_middleware: token verify failed:", err && err.message);
      return res.status(401).json({ message: "Unauthorized: invalid or expired token" });
    }

    // support verifytoken returning either payload object or just id (legacy)
    const userId = (decoded && decoded.id) || decoded;
    if (!userId) {
      console.warn("auth_middleware: token missing id. decoded:", decoded);
      return res.status(401).json({ message: "Unauthorized: token missing id" });
    }

    const user = await findUserbyId(userId);
    if (!user) {
      console.warn("auth_middleware: user not found for id:", userId);
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error("auth_middleware: unexpected error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
