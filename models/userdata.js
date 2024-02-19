const mongoose = require("mongoose")

const userDataSchema = new mongoose.Schema({
    userid: {
        type: Number, 
        required: true 
    },
    useremail: {
        type: String,
        required: true 
    },
    storeHash: {
        type: String,
        required: true 
    },
    storeToken: {
        type: String,
        required: true 
    },
    time: {
        type: Date,
        default: Date.now 
    
    }
})


module.exports = mongoose.model("userdata",userDataSchema)
