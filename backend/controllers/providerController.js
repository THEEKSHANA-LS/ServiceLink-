import Service from "../models/service.js";

//cretae new service... /api/provider/add-service
export async function addService(req, res){

    try{
        //only providers can add services...
        if(req.user.role !== "provider"){
            return res.status(403).json({
                message : "Access denied. Only providers can add services."
            });
        }

        const { name, description, payPerHour, image } = req.body;

        //validate input fields...
        if(!name || !description || !payPerHour){
            return res.status(400).json({
                message : "All fields are required."
            });
        }

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

//get customer requests... /api/provider/requests
export async function getRequests(req, res){

}

//update request status... /api/provider/requests/:requestId/status
export async function updateStatus(req, res){
    
}