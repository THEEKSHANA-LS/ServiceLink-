import express from "express";
import { addService, deleteService, getProviderServices, getRequests, updateService, updateStatus } from "../controllers/providerController.js";

const providerRouter = express.Router();

providerRouter.post("/add-service", addService);
providerRouter.get("/services/my", getProviderServices);

providerRouter.put("/service/:serviceId", updateService);
providerRouter.delete("/service/:serviceId", deleteService);
providerRouter.get("/requests/my", getRequests);
providerRouter.put("/request/:requestId/status", updateStatus);


export default providerRouter;