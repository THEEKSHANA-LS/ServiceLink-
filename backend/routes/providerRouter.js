import express from "express";
import { addService, getProviderServices } from "../controllers/providerController.js";

const providerRouter = express.Router();

providerRouter.post("/add-service", addService);
providerRouter.get("/services/my", getProviderServices);

export default providerRouter;