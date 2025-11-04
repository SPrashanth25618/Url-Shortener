import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { router } from './routes/urlRoutes.js';
import cors from "cors";
import auth_router from "./routes/authRoutes.js";
import { redirectFromShortUrl } from "./controllers/url.js";
import cookieParser from "cookie-parser";

dotenv.config();
export const app = express();

// Connect DB first
connectDB();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', auth_router);
app.use('/', router);

// keep redirect route after router so /api routes are matched first
app.get("/:id", redirectFromShortUrl);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server Started at port : ", PORT);
});
