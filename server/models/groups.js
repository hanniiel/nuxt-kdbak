const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    hangul:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
        required:true,
    },
    logo:{
        type:String,
        required:true,
    },
    fandom:String,
    debut:{
        type:Date,
        required:true,
    },
    state:{
        type:String,
        enum:['A','H','D'],
        required:true,
    },
    gender:{
        type:String,
        required:true
    },
    members:[{
        member:{
            type:mongoose.Schema.Types.ObjectId,
            required:false,
            unique:false,
            ref:"Idol"
        },
        joined:Date
        }],
   exmembers:[{
        member:{
            type:mongoose.Schema.Types.ObjectId,
            required:false,
            unique:false,
            ref:"Idol",
        },
        left:Date,
        reason:String,
    }],
    subgroups:[{
        type:mongoose.Schema.Types.ObjectId,
        required:false,
        ref:"Group"
    }]
},{timestamps:true});
var model = new mongoose.model("Group",schema);


exports.Model = model;
exports.Schema = schema;