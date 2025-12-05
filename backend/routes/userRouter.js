import express from "express";
import {  updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.put("/update-me", updateUser);

export default userRouter;