const mongoose = require('mongoose');
const schema = mongoose.Schema({
    source:{
        type:String,
        required:true,
        index:true,
    },
    post:{
        type:String,
        required:true,
        index:true,
    },
    image:String,
    title:String,
    content:String,
    user:{
        type:String,
        required:true,
        ref: 'User'
    }
},{
    timestamps:true
});

const model = mongoose.model('Favorite',schema);

exports.Model = model;
exports.Schema = schema;
