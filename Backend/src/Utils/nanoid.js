// src/Utils/nanoid.js
import jsonwebtoken from "jsonwebtoken";
import { nanoid } from "nanoid";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // dev fallback (secure this in prod)

export function getId(len = 7) {
  return nanoid(len);
}

export const signtoken = (payload) => {
  // ensure id is string for consistent DB lookups
  const safePayload = { ...payload, id: payload.id ? String(payload.id) : undefined };
  return jsonwebtoken.sign(safePayload, JWT_SECRET, { expiresIn: "1h" });
};

// Return full decoded payload (not just id).
// jsonwebtoken.verify will throw on invalid/expired token — middleware should handle it.
export const verifytoken = (token) => {
  return jsonwebtoken.verify(token, JWT_SECRET);
};
