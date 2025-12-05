import express from "express";
import { login, register, userProfile } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", userProfile);

export default authRouter;