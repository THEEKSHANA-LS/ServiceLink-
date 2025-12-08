import Service from "../models/service.js";
import User from "../models/user.js";
import Request from "../models/request.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

//update user details... /api/users/update-me
export async function updateUser(req, res){
    if(!req.user){
        return res.status(401).json({ message : "Unauthorized."});
    }

    try{
        const email = req.user.email;
        const updates = {};

        //update name...
        if(req.body.fullName) updates.fullName = req.body.fullName;

        //update image...
        if(req.body.image) updates.image = req.body.image;

        //update phone...
        if(req.body.phone) updates.phone = req.body.phone;

        //update address...
        if(req.body.address) updates.address = req.body.address;

        //update password...(only if provided)
        if(req.body.password){
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            updates.password = hashedPassword;
        }

        await User.updateOne({ email : email }, { $set : updates });

        // ✅ Fetch updated user data and generate new token
        const updatedUser = await User.findOne({ email: email });

        const newToken = jwt.sign(
            {
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address,
                image: updatedUser.image
            },
            process.env.JWT_SECRET
        );

        res.status(200).json({ 
            message: "Profile updated successfully.",
            token: newToken,
            user: {
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address,
                image: updatedUser.image
            }
        });
    } catch(error){
        console.error("Error updating user profile:", error);
        res.status(500).json({
            message : "Failed to update profile.",
            error: error.message
        });
    }
};

//get all available services...  /api/users/services
export async function getAllServices(req, res){
    try{
        if(req.user.role != "customer"){
            return res.status(401).json({
                message : "Access denied. Only customers can view services."
            });
        }

        const services = await Service.find();
        return res.status(200).json({
            message : "Successfully get services.",
            services : services
        });
    } catch(error){
        console.error("Error fetching services:", error);
        return res.status(500).json({
            message : "Internal server error. Failed to fetch services.",
            error : error.message
        });
    }
}

//create request... /api/users/request/:serviceId
export async function createRequest(req, res) {
    try {
        // Check authentication
        if (!req.user || req.user.role !== "customer") {
            return res.status(403).json({
                message: "Access denied. Only customers can create requests."
            });
        }

        const serviceId = req.params.serviceId;
        const customerEmail = req.user.email;

        // Validate required fields
        if (!req.body.description || !req.body.address || !req.body.phone || !req.body.time) {
            return res.status(400).json({
                message: "Missing required fields: description, address, phone, time"
            });
        }

        // Find the service
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                message: "Service not found."
            });
        }

        // ✅ Check for duplicate active requests
        const existingRequest = await Request.findOne({
            customer: customerEmail,
            serviceId: serviceId,
            status: { $in: ['pending', 'accepted', 'in-progress'] }
        });

        if (existingRequest) {
            return res.status(409).json({
                message: "You already have an active request for this service. Please wait until it's completed or cancel it first.",
                existingRequest: {
                    _id: existingRequest._id,
                    status: existingRequest.status,
                    createdAt: existingRequest.createdAt
                }
            });
        }

        // Create new request
        const request = new Request({
            customer: customerEmail,
            provider: service.provider,
            serviceId: service._id,
            description : req.body.description,
            address : req.body.address,
            phone : req.body.phone,
            time : req.body.time
        });

        await request.save();

        res.status(201).json({
            message: "Request submitted successfully.",
            request: request
        });

    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({
            message: "Server error.",
            error: error.message
        });
    }
}

//Get all requests for customer... /api/users/requests
export async function getCustomerRequests(req, res) {
    try {
        if (!req.user || req.user.role !== "customer") {
            return res.status(403).json({
                message: "Access denied. Only customers can view their requests."
            });
        }

        const requests = await Request.find({ customer: req.user.email })
            .populate('serviceId', 'name description payPerHour image')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Requests fetched successfully.",
            requests: requests
        });

    } catch (error) {
        console.error("Error fetching customer requests:", error);
        return res.status(500).json({
            message: "Failed to fetch requests.",
            error: error.message
        });
    }
}

//Get single request details... /api/users/request/:requestId
export async function getRequestDetails(req, res){
    try{
        if(!req.user){
            return res.status(401).json({
                message : "Unauthorized."
            });
        }

        const request = await Request.findById(req.params.requestId).populate('serviceId', 'name description payPerHour image');

        if(!request){
            return res.status(404).json({
                message : "Request not found."
            });
        }

        //check if user authorized to view this request...
        if(request.customer !== req.user.email && request.provider !== req.user.email){
            return res.status(403).json({
                message : "Access denied. You are not authorized to view this request."
            });
        }

        return res.status(200).json({
            message : "Request details fetched successfully.",
            request : request
        });

    } catch(error){
        console.error("Error fetching request details:", error);
        return res.status(500).json({
            message : "Failed to fetch request details.",
            error : error.message
        });
    }
}

//Cancel request (customer only)... /api/users/request/:requestId/cancel
export async function cancelRequest(req, res){
    try{
        if(!req.user || req.user.role !== "customer"){
            return res.status(403).json({
                message : "Access denied. Only customers can cancel requests."
            });
        }

        const request = await Request.findById(req.params.requestId);

        if(!request){
            return res.status(404).json({
                message : "Request not found."
            });
        }

        //check if the request belongs to the customer...
        if(request.status == "completetd" || request.status === "cancelled"){
            return res.status(400).json({
                message : `Cannot cancel a request that is already ${request.status}.`
            });
        }

        request.status = "cancelled";
        request.updatedAt = Date.now();
        await request.save();

        return res.status(200).json({
            message : "Request cancelled successfully.",
            request : request
        });

    } catch(error){
        console.error("Error cancelling request:", error);
        return res.status(500).json({
            message : "Failed to cancel request.",
            error : error.message
        });
    }
}

