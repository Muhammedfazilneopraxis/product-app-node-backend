const mongoose =  require("mongoose")

const conn = async(req,res) => {
    try {
        await mongoose.connect("mongodb+srv://fazil:PgkldcDlMTkaqhHP@cluster0.wsfnktc.mongodb.net/")
        .then(() =>{
            console.log("connected")
        })
    } catch (error) {
        res.status(400,{message:"not connected"})
    }
    
}

conn()