import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
                        user : {
                            email : user.email,
                            fullName : user.fullName,
                            role : user.role,
                        }
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

//get user details... /api/auth/me
export function userProfile(req, res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized."
        })
        return;
    } else{
        res.json(
            req.user
        )
    }
};
