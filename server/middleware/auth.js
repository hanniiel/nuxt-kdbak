 require("dotenv");
 const jwt = require("jsonwebtoken");
 const User = require("../models/user").Model;

 const auth = async (req,res,next)=>{
    try{
        let token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,process.env.JWT_KEY);
        const user = await User.findOne({_id:decoded._id,'tokens.token':token});
        if(!user) {throw new Error();}
        req.token =token;
        req.user = user;
        next()
    }catch(e){
        res.status(401).send({error:'Failed to authenticate'});
    }
 }

 module.exports = auth;