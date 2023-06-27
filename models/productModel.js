const mongoose = require('mongoose');
const schema = mongoose.Schema

const productSchema = new schema ({
    name: {
        type:String,
        required:true
    },
    category:{
        type:Array,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    blurb:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    color:{
        type:Array,
        required:true
    },
    sizes:{
        type:Array,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    image:[{
        type:String,
        required:true,
    }]   
})


module.exports = mongoose.model('product',productSchema);
