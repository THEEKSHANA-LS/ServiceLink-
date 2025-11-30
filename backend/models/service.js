import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            unoique : true
        },
        description : {
            type : String,
            required : true
        },
        icon : {
            type : Image,
            default : null
        },
        createdAt : {
            type : Date,
            default : Date.now
        }
    }
)

const Service = mongoose.model("Service", serviceSchema);

export default Service;
