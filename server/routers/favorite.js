const express = require('express');
const router = express.Router();
const authFire = require('../middleware/authFire');

const Favorite = require('../models/favorites').Model;


router.get('/favorite/:sourceId/:postId',async(req,res)=>{
    try{
        if(!req.params.sourceId || !req.params.postId){
            res.status(400).send({error:'source & post not specified'});
        }
        let count = await Favorite.countDocuments({source:req.params.sourceId,post:req.params.postId}).exec();
        res.send({count});
    }catch(e){
        res.status(400).send({error:e.message});
    }
});

router.route('/favorite/user')
.get(authFire,async(req,res)=>{
    try{
        let query = {
            ...req.query,
            user:req.user._id
        };
        let result = await Favorite.find(query);
        res.send(result);
    }catch(error){
        res.status(400).send({error:error.message});
    }
})
.post(authFire,async(req,res)=>{
    try{
        //source
        //postId
        let exists = await Favorite.findOne({
            ...req.body,
            user:req.user._id
        });
        
        if(exists){
            let result = await exists.remove();
            res.send(result);
        }else{
            let fave = new Favorite({
                ...req.body,
                user:req.user._id
            });
            let result = await fave.save();
            res.send(result);
        }
        
    }catch(e){
        res.send({'error':e.message});
    }
});

module.exports = router;