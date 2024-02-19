// const router = require("express").Router();
// const UserData = require("../models/userdata")
// router.post('/userdata', async (req, res) => {
//     try {
//         const { userid, email, storehash, token, time } = req.body;

//         // // Check if user with the same userid exists
//         const existingUser = await UserData.findOne({ userid });

//         if (existingUser) {
//             return res.status(400).json({ message: "User data with the same userid already exists" });
//         }

//         // // Check if user with the same email exists
//         const existingEmail = await UserData.findOne({ email });
        
//         if (existingEmail) {
//             return res.status(400).json({ message: "User data with the same email already exists" });
//         }

//         // // Create a new UserData instance
//         // const userdata = new UserData({ userid, email, storehash, token, time });

//         // // Save the new user data
//         // await userdata.save();

//         // Respond with the saved user data
//         res.status(200).json({ userdata });
//     } catch (error) {
//         // Handle any errors
//         console.error("Error while saving user data:", error);
//         res.status(500).json({ message: "Failed to save user data" });
//     }
// });





// module.exports = router;