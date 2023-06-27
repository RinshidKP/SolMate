const mongoose = require('mongoose')

const schema = mongoose.Schema
const userSchema = schema({
    name: {
        type: String,
        required:true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccess: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    profile: {
        type: String,
        default: "",
    },
    created: {
        type:Date,
        default:Date.now(), 
    }
})


module.exports = mongoose.model('User',userSchema);