const moment = require("moment");
const express = require("express");
const router = express.Router();
const Group = require("../models/groups").Model;
const auth = require("../middleware/authFire");


router.route("/group")
.get(async(req,res)=>{
    let id= req.query.id;
    let name= req.query.name;
    //pagination
    let page = parseInt(req.query.page ? req.query.page : 0);
    let per_page = parseInt(req.query.per_page ? req.query.per_page: 20);
    try{
        if(id){
            let group = await Group.findById(id).populate("members.member").populate("exmembers.member").populate('subgroups').exec();
            res.send(group);

        }else if(name){
            let groups = await Group.find({ 
                $or:[
                    {name:{ $regex: name,$options:'i' }},
                    {hangul:{ $regex: name,$options:'i' }}
                ] 
            });
            if(groups.length===0){
                return res.status(400).send("coincidence not found");
            }
            res.send(groups);
        }else{
            var groups = await Group.find({},{},{skip:page*per_page,limit:per_page}).populate("members.member").populate("exmembers.member").populate('subgroups').exec();
            res.send(groups);
        }
        
    }catch(e){
        res.status(400).send({error:e});
    }
})
.post(auth,async(req,res)=>{
    try{
        if(req.user.role!="admin"){
            return res.status(401).send({error:"not authorized"});
        }
        console.log(req.body)
        let group = new Group(req.body);
        let result = await group.save();
      
        res.send(result);

    }catch(e){
        res.status(400).send({error:e.message});
    }
},(error,req,res,next)=>{
    res.status(400).send({error:error.message});
}).patch(auth,async(req,res)=>{
    try{
        if(req.user.role!="admin"){
            return res.status(401).send({error:"not authorized"});
        }
        console.log(req.body)
        let id = req.body._id;

        delete req.body._id;
        delete req.body.members;
        delete req.body.exmembers;
        delete req.body.subgroups;
        console.log(req.body)

        let group = await Group.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});
        console.log("fff")
        //update data
        if(!group){
            return res.status(400).send({error:"group not found"});
        }
        res.send(group);

    }catch(e){
        res.status(400).send({error:e});
    }
})
.delete(auth,async(req,res)=>{
    try{
        if(req.user.role!="admin"){
            return res.status(401).send({error:"not authorized"});
        }
        let id = req.query.id;
        if(!id){
            return res.status(400).send('id not provided');
        }
        let result = await Group.deleteOne({_id:id});
        if(result.deletedCount>0){
            return res.send('nice');
        }else{
            res.status(400).send('no item deleted');
        }

    }catch(error){
        console.log(error.message);
        res.status(400).send('sww');
    }
});

router.get("/group/ranking",async(req,res)=>{
    let page = parseInt(req.query.page ? req.query.page : 0);
    let per_page = parseInt(req.query.per_page ? req.query.per_page: 20);
    let range = req.query.range ? req.query.range : 'daily'
    let gender = req.query.gender ?  req.query.gender : 'F';

    try{

        let start,end;
        
        switch(range){
            case 'daily':
                start = moment().utc(false).startOf('day').toDate();
                end = moment().utc(false).endOf('day').toDate();
                break;
            case 'weekly':
                start = moment().utc(false).startOf("isoWeek").toDate();
                end = moment().utc(false).endOf("isoWeek").toDate();
                break;
            case 'monthly':
                start = moment().utc(false).startOf('month').toDate();
                end = moment().utc(false).endOf('month').toDate();
                break;
            default :
                start = moment().utc(false).startOf('day').toDate();
                end = moment().utc(false).endOf('day').toDate();
                break;
        }

        //
        let groups = await Group.aggregate([
            {
                $match:{
                    gender:{$regex: gender,$options:'i'}
                }
            },
            {
                $lookup:{
                    from:"votes",
                    let:{"id":"$_id"},
                    pipeline:[{ 
                        $match:{
                            createdAt:{$gte:start,$lte:end},
                            $expr:{
                                $eq:["$group","$$id"]
                            }
                        }
                    }],
                    as: "idol_docs"
                },
            },
            {
                $unwind:{
                    path: "$idol_docs",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group:{
                    _id:"$_id",
                    members:{$first:"$members"},
                    name:{$first:"$name"},
                    hangul:{$first:"$hangul"},
                    gender:{$first:"$gender"},
                    debut:{$first:"$debut"},
                    active:{$first:"$active"},
                    avatar:{$first:"$avatar"},
                    logo:{$first:"$logo"},
                    votes:{$sum:"$idol_docs.votes"}
                    
                }
            },
            { $sort:{votes:-1,name:1}},
            { $skip:  page*per_page},
            { $limit: per_page}
        ]).exec();
        res.send(groups);
    }catch(error){
        res.status(400).send({error});
    }
});

module.exports = router;