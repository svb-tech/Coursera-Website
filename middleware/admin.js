const jwt=require("jsonwebtoken")
const {jwtSecretofAdmin}=require("../config")

function adminMiddleware(req,res,next){
    const token=req.headers.token;
    const decoded=jwt.verify(token,jwtSecretofAdmin);
    if(decoded){
        req.adminId=decoded.id;
        next();
    }
    else{
        res.status(403).json({
            message:"You are not signed in"
        })
    }
}

module.exports={
    adminMiddleware:adminMiddleware
}