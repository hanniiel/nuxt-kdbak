const mongoose = require("mongoose");
const schema = mongoose.Schema({
    user:{
        type:String,
        required:true,
        ref:"User"
    },
    idol:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Idol"
    },
    act:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Idol"
    },
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group"
    },
    votes:{
        type:Number,
        required:true
    }

},{
    timestamps:true
});
const model = mongoose.model("Vote",schema);



exports.Model = model;