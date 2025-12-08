import Service from "../models/service.js";
import Request from "../models/request.js";

//cretae new service... /api/provider/add-service
export async function addService(req, res){

    try{
        //only providers can add services...
        if(req.user.role !== "provider"){
            return res.status(403).json({
                message : "Access denied. Only providers can add services."
            });
        }

        const { name } = req.body;

        //check if service already exists in the same provider...
        const isExists = await Service.findOne({ name: name.trim(), provider : req.user.email });
        if(isExists){
            return res.status(409).json({
                message : "Service already exists with this name."
            });
        }

        //create new service...
        const service = new Service({
            provider : req.user.email,
            name : req.body.name,
            description : req.body.description,
            payPerHour : req.body.payPerHour,
            image : req.body.image || null
        });

        await service.save();

        return res.status(201).json({
            message : "Service added successfully.",
            service : service
        });
 
    } catch(error){
        console.error("Error adding service:", error);
        return res.status(500).json({
            message : "Internal server error. Failedto add service.",
            error : error.message
        });
    }
}

//get all services of logged in provider... /api/provider/services/my
export async function getProviderServices(req, res){
    try{
        //only providers can access their services...
        if(req.user.role !== "provider"){
            return res.status(403).json({
                message : "Access denied. Only providers can access their services."
            });
        }

        const services = await Service.find({ provider : req.user.email });

        return res.status(200).json({
            message : "Services fetched successfully.",
            services : services
        });

    } catch(error){
        console.error("Error fetching provider services:", error);
        return res.status(500).json({
            message : "Internal server error. Failed to fetch services.",
            error : error.message
        });
    }
}

// ✅ NEW: Update service details... /api/provider/service/:serviceId
export async function updateService(req, res) {
    try {
        if (!req.user || req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Only providers can update services."
            });
        }

        const service = await Service.findById(req.params.serviceId);

        if (!service) {
            return res.status(404).json({
                message: "Service not found."
            });
        }

        // Check if provider owns this service
        if (service.provider !== req.user.email) {
            return res.status(403).json({
                message: "Access denied. You can only update your own services."
            });
        }

        // Update fields
        if (req.body.name) service.name = req.body.name;
        if (req.body.description) service.description = req.body.description;
        if (req.body.payPerHour) service.payPerHour = req.body.payPerHour;
        if (req.body.image) service.image = req.body.image;

        await service.save();

        return res.status(200).json({
            message: "Service updated successfully.",
            service: service
        });

    } catch (error) {
        console.error("Error updating service:", error);
        return res.status(500).json({
            message: "Failed to update service.",
            error: error.message
        });
    }
}

// ✅ NEW: Delete service... /api/provider/service/:serviceId
export async function deleteService(req, res) {
    try {
        if (!req.user || req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Only providers can delete services."
            });
        }

        const service = await Service.findById(req.params.serviceId);

        if (!service) {
            return res.status(404).json({
                message: "Service not found."
            });
        }

        // Check if provider owns this service
        if (service.provider !== req.user.email) {
            return res.status(403).json({
                message: "Access denied. You can only delete your own services."
            });
        }

        // Check if there are pending requests for this service
        const pendingRequests = await Request.countDocuments({
            serviceId: service._id,
            status: { $in: ['pending', 'accepted', 'in-progress'] }
        });

        if (pendingRequests > 0) {
            return res.status(400).json({
                message: "Cannot delete service with active requests. Please complete or cancel all requests first."
            });
        }

        await Service.findByIdAndDelete(req.params.serviceId);

        return res.status(200).json({
            message: "Service deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting service:", error);
        return res.status(500).json({
            message: "Failed to delete service.",
            error: error.message
        });
    }
}

// ✅ COMPLETE: Get all requests for provider... /api/provider/requests/my
export async function getRequests(req, res){
    try {
        if (!req.user || req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Only providers can view requests."
            });
        }

        // Get all requests where the provider email matches
        const requests = await Request.find({ provider: req.user.email })
            .populate('serviceId', 'name description payPerHour image')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Requests fetched successfully.",
            requests: requests
        });

    } catch (error) {
        console.error("Error fetching provider requests:", error);
        return res.status(500).json({
            message: "Failed to fetch requests.",
            error: error.message
        });
    }
}

// ✅ COMPLETE: Update request status... /api/provider/requests/:requestId/status
export async function updateStatus(req, res){
    try {
        if (!req.user || req.user.role !== "provider") {
            return res.status(403).json({
                message: "Access denied. Only providers can update request status."
            });
        }

        const { status } = req.body;
        const requestId = req.params.requestId;

        // Validate status
        const validStatuses = ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Valid options: " + validStatuses.join(', ')
            });
        }

        // Find the request
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({
                message: "Request not found."
            });
        }

        // Check if provider owns this request
        if (request.provider !== req.user.email) {
            return res.status(403).json({
                message: "Access denied. You can only update your own requests."
            });
        }

        // Update status
        request.status = status;
        request.updatedAt = Date.now();
        await request.save();

        return res.status(200).json({
            message: "Request status updated successfully.",
            request: request
        });

    } catch (error) {
        console.error("Error updating request status:", error);
        return res.status(500).json({
            message: "Failed to update request status.",
            error: error.message
        });
    }
}

