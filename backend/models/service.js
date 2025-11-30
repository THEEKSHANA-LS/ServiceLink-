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
        image : {
            type : String,
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
