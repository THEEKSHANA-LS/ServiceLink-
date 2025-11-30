import mongoose from "mongoose";


const requestSchema = new mongoose.model(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required : true
        },
        providerId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Provider",
            default : null
        },
        serviceId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Service',
            required : true
        },
        description : {
            type : String,
            required : true,
        },
        address : {
            type  : String,
            required : true
        },
        phone : {
            type : String,
            required : true
        },
        status : {
            type : String,
            enum : ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
            default : "pending"
        },
        createdAt : {
            type : Date,
            default : Date.now
        },
        updatedAt : {
            type : Date
        }
    }
)

const Request = mongoose.model("Request", requestSchema);

export default Request;