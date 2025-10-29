import express from "express";
import { createShortUrl, getMyUrls } from "../controllers/url.js";
import { auth_middleware } from "../middleware/auth_middleware.js";

export const router = express.Router();

// protected create - requires login
router.post("/api/create", auth_middleware, createShortUrl);

// get logged-in user's urls
router.get("/api/mine", auth_middleware, getMyUrls);
