const moment = require("moment");
const express = require("express");
const router = express.Router();
const Idol = require("../models/idol.js").Model;
const auth = require("../middleware/authFire");

router.route("/idol")
.get(async(req,res)=>{
    let id= req.query.id;
    //pagination
    let page = parseInt(req.query.page ? req.query.page : 0);
    let per_page = parseInt(req.query.per_page ? req.query.per_page: 20);
    //
    try{

        if(id){
            let idol = await Idol.findById(id).populate("group").exec();
            res.status(200).send(idol);

        }
        else if(Object.keys(req.query).includes("name")){
            let name = req.query.name;

            let idols = await Idol.find({ 
                $or:[
                    {name:{ $regex: name,$options:'i' }},
                    {hangul:{ $regex: name,$options:'i' }}
                ] 
            });
            if(idols.length===0){
                return res.status(400).send("coincidence not found");
            }
            res.send(idols);
        }
        else{
            let idols = await Idol.find({},{},{skip:page*per_page,limit:per_page}).populate("group").exec();
            res.status(200).send(idols);
        }

    }catch(e){
        res.status(400).send("errro"+e);
    }
})
.post(auth,async(req,res)=>{
    try{
        if(req.user.role!="admin"){
            return res.status(401).send({error:"not authorized"});
        }
       console.log('ddd')
        let idol = new Idol({
             ...req.body,
         });
        
        let result = await idol.save();
        res.send(result);

    }catch(error){
        res.status(400).send({error});
    }
    
})
.patch(auth,async(req,res)=>{
    try{
        /*let updates = Object.keys(req.body);
        let allowed = ['profession','_id','name','hangul','avatar','birthday','debut'];
        let isValid = updates.every((key)=>allowed.includes(key));
        if(!isValid){
             return res.status(400).send("update operation not allowed");
        }*/
        if(req.user.role!="admin"){
            return res.status(401).send({error:"not authorized"});
        }
        let id = req.body._id;
       
        console.log(req.body)

        let idol = await Idol.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});
        if(!idol){
            res.status(400).send("not idol found");
        }
        res.send(idol);
    }catch(error){
        console.log(error.message);
        res.status(400).send('tfuk');
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
        let result = await Idol.deleteOne({_id:id});
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

router.get("/idol/ranking",async(req,res)=>{

    let page = parseInt(req.query.page ? req.query.page : 0);
    let per_page = parseInt(req.query.per_page ? req.query.per_page: 20);
    let range = req.query.range ? req.query.range : 'daily'
    let gender = req.query.gender ?  req.query.gender : 'F';
    let profession = req.query.profession ?  req.query.profession : 'I';
    let voteIdentity = profession.toLocaleLowerCase()==='i' ?'$idol' : '$act';

    try{

        let start,end;
        
        switch(range){
            case 'daily':
                start = moment().utc(false).startOf('day').toDate();
                end = moment().utc(false).endOf('day').toDate();
                break;
            case 'weekly':
                start = moment().utc(true).startOf("isoWeek").toDate();
                end = moment().utc(true).endOf("isoWeek").toDate();
                break;
            case 'monthly':
                start = moment().utc(false).startOf('month').toDate();
                end = moment().utc(false).endOf('month').toDate();
                break;
            default :
                start = moment().utc(false).startOf("day").toDate();
                end = moment().utc(false).endOf("day").toDate();
                break;
        }
        

       

        //
        let idols = await Idol.aggregate([
            {
                $match:{
                    gender:{$regex: gender,$options:'i'},
                    profession: {$regex: profession,$options:'i'}
                }
            },
            {
                $lookup:{
                    from: "votes",
                    let: {idol:"$_id"},//local fields
                    pipeline:[
                        {
                            $match:{
                                createdAt:{$gte:start,$lte:end},
                                $expr:{
                                    $eq:[voteIdentity,"$$idol"]
                                }
                            }
                        }
                    ],
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
                    name:{$first:"$name"},
                    hangul:{$first:"$hangul"},
                    gender:{$first:"$gender"},
                    birthday:{$first:"$birthday"},
                    debut:{$first:"$debut"},
                    active:{$first:"$active"},
                    avatar:{$first:"$avatar"},
                    votes:{$sum:"$idol_docs.votes"}
                }
            },
            { $sort:{votes:-1,name:1}},
            { $skip:  page*per_page},
            { $limit: per_page}
        ]).exec();
        res.send(idols);
    }catch(e){
        res.status(400).send({error:e});
    }
});

module.exports = router;