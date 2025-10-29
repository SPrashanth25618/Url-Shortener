// middleware/attachUser.js
import { findUserbyId } from "../dao/user_dao.js";
import { verifytoken } from "../Utils/nanoid.js";

export const attachUser = async (req, res, next) => {
  try {
    // use same cookie name as elsewhere ('token')
    const token = req.cookies && (req.cookies.token || req.cookies.accessToken);
    if (!token) return res.status(401).json({ message: "Unauthorized: no token" });

    let decoded;
    try {
      decoded = await Promise.resolve(verifytoken(token));
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }

    const userId = (decoded && decoded.id) || decoded;
    if (!userId) return res.status(401).json({ message: "Unauthorized: token missing id" });

    const user = await findUserbyId(userId);
    if (!user) return res.status(401).json({ message: "Unauthorized: user not found" });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
