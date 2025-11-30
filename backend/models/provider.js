import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
},
  servicesOffered: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service' 
}],
  experience: {
    type : String,
  },
  verified: { 
    type: Boolean, 
    default: false 
},
  rating: { 
    type: Number, 
    default: 0 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
}
});

const Provider = mongoose.model('Provider', providerSchema);

export default Provider;
