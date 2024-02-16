const router = require("express").Router();

const User = require("../models/user")


router.post("/register",async(req,res) =>{
    try {
        console.log('what is data............')
        const {username,email,password,age} = req.body;
        const user = new User({username,email,password,age})
        await user.save().then(()=> res.status(200).json({user:user}))
    } catch (error) {
        res.status(400).json({message:"user already exists"})
    }
})



module.exports = router;