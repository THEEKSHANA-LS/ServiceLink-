import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
    {
        serviceId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Service",
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
        time : {
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
        },
        customer : {
            type : String,
            required : true
        },
        provider : {
            type : String,
            required : true
        },

        //{ timestamps : true } this use instead of createdAt and updateAt /*
    }
)

const Request = mongoose.model("Request", requestSchema);

export default Request;