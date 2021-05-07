const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user").Model;

const authFire = require("../middleware/authFire");

router.route("/user")
.get(authFire,async(req,res)=>{
    res.send(req.user);
})
.post(async(req,res)=>{
    try{
      var user = new User(req.body);
      user.role ="user";
      var token = await user.genAuthToken();
      res.status(201).send({user,token});
    }catch(e){
        res.status(400).send({error:'Bad request '+e.message});
    }
})
.patch(authFire,async(req,res)=>{
    try{
        //valdiate params to update
        let updates = Object.keys(req.body);
        let allowed = ['email','name'];
        let isValid = updates.every((key)=>allowed.includes(key));
        if(!isValid){
             return res.status(401).send("update operation not allowed");
        }
        const user = await User.findByIdAndUpdate(req.user._id,req.body,{new:true,runValidators:true});
        res.send(user);
    }catch(e){
        res.status(400).send(e);
    }
});
router.patch('/user/currency',authFire,async(req,res)=>{
    try{
        if(!req.body.currency)
        {
            throw new Error("Currency not provided");
        }
        const user = req.user;
        user.currency += req.body.currency;
        const updatedUser = await user.save();
        res.send(updatedUser);
    }catch(e){
        res.status(400).send(e.message);
    }
});

router.post("/user/login",async (req,res)=>{
    try{
        let user = await User.findByCredentials(req.body.email,req.body.password);
        let token = await user.genAuthToken();

        res.status(200).send({user,token});
    }catch(e){
        res.status(401).send({error:'Bad request '+e});
    }
});
router.post("/user/logout",auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        });
        await req.user.save();
        res.status(200).send();
    }catch(e){
        res.status(401).send({error:'Bad request '+e});
    }
});

router.post("/user/logoutall",auth,async (req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    }catch(e){
        res.status(401).send({error:'Bad request '+e});
    }
});

module.exports = router;