import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
export function authMiddleware(req, res, next){
    let token = req.header("Authorization"); //get token from request header...

    if(token != null){
        token = token.replace("Bearer ", "") //use for remove Bearer from token...

        //dcrypt token...
        jwt.verify(token, process.env.JWT_SECRET, 
            (error, decoded) => {
                if(decoded == null){
                    res.json({
                        message : "Invalid Token. Please login again."
                    })
                    return;
                } else{
                    req.user = decoded; //add user details to the request...
                }
            })
    }
    next() //if the token is correct, then pass the request to the correct destination...
}