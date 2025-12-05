import User from "../models/user.js";

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

        //update password...(only if provided)
        if(req.body.password){
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            updates.password = hashedPassword;
        }

        await User.updateOne({ email : email }, { $set : updates });

        res.status(200).json({ message : "Profile updated successfully."});
    } catch(error){
        console.error("Error updating user profile:", error);
        res.status(500).json({
            message : "Failed to update profile."
        });
    }
};
