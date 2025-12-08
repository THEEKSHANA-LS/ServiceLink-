import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Service from "../models/service.js";

dotenv.config();

//register function...
export function register(req, res){

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User(
        {
            fullName : req.body.fullName,
            email : req.body.email,
            password : hashedPassword,
            role : req.body.role
        }
    )

    user.save().then(
        () => {
            res.status(200).json({
                message : "User created successfully."
            })
        }
    ).catch(
        () => {
            res.status(500).json({
                message : "Failed to create user."
            })
        }
    )
};

//login function...
export function login(req, res){
    User.findOne(
        {
            email : req.body.email
        }
    ).then(
        (user) => {
            if(user == null){
                res.status(404).json(
                    {
                        message : "User not found."
                    }
                )
            }else{
                if(user.isBlocked){
                    res.status(403).json({
                        message : "Your account has been blocked."
                    });
                    return;
                }
                const isPasswordMatching = bcrypt.compareSync(req.body.password, user.password);
                if(isPasswordMatching){
                    const token = jwt.sign(
                        {
                            email : user.email,
                            fullName : user.fullName,
                            role : user.role,
                            phone : user.phone,
                            address : user.address,
                            image : user.image
                        },
                        process.env.JWT_SECRET
                    )

                    res.json({
                        message : "Login successful.",
                        token : token,
                    })
                } else{
                    res.status(401).json({
                        message : "Invaild Password."
                    })
                }
            }
        }
    )
};

//get user profile...
export async function userProfile(req, res){
    
    // Check if user is authenticated (Correct)
    if (req.user == null) {
        return res.status(401).json({
            message : "Unauthorized."
        });
    } 

    const baseUserData = {
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        image: req.user.image,
    };

    if (req.user.role === "customer") {
        // Customer: Simple return of token data
        return res.json(baseUserData);
    }
    
    if (req.user.role === "provider") {
        try {
            // 2. AWAIT the database query and assign the result
            const providerServices = await Service.find({ 
                provider : req.user.email // Assuming your Service model stores email (String)
            }).select('name payPerHour description image'); // Select only non-sensitive fields
            
            // 3. Construct and return the combined profile
            const providerProfile = {
                ...baseUserData,
                // Add the fields that were moved into the User model:
                servicesOffered: providerServices, // <-- Use the fetched data
                experience: req.user.experience,
                // If you had rating/verified in the User model, include them here too
            };
            
            return res.json(providerProfile);

        } catch (error) {
            console.error("Error fetching provider services:", error);
            return res.status(500).json({
                message: "Failed to retrieve provider details."
            });
        }
    }
    
    // Fallback if role is neither 'customer' nor 'provider'
    return res.json(baseUserData);
};
