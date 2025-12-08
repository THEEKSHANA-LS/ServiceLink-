import express from "express";
import {  cancelRequest, createRequest, getAllServices, getCustomerRequests, getRequestDetails, updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.put("/update-me", updateUser);
userRouter.get("/services", getAllServices);
userRouter.post("/request/:serviceId", createRequest);
userRouter.get("/requests", getCustomerRequests);
userRouter.get("/request/:requestId", getRequestDetails);
userRouter.put("/request/:requestId/cancel", cancelRequest);

export default userRouter;