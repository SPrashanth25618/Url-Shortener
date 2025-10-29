import express from 'express'
import { login, register } from '../controllers/authController.js';

const auth_router = express.Router();

auth_router.post('/login',login);
auth_router.post('/register',register);

export default auth_router;