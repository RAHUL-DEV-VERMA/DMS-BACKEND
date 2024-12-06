import express from "express";
import { forgotPassword, login, logout, resetPassword } from "../controllers/loginLogout.js";
const router = express.Router();

router.post("/logout",  logout);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:id/:token", resetPassword);

export default router;