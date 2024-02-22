// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser'); // Added for parsing request body



var request = require('request');
require('dotenv').config();
const app = express();
app.use(express.json())

require("./conn/conn")

// const auth = require("./routes/auth")

// app.use("/api/v1",auth);

// Decode jwt token
const jwt = require('jsonwebtoken');


// Store in session data for temporily
const session = require('express-session');


// Enable CORS for all routes
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());

const port = process.env.PORT;

const store_hash = process.env.STORE_HASH;

const access_token = process.env.ACCESS_TOKEN;

const django_endpoint_baseurl = process.env.DJANGO_ENDPOINT_BASE_URL;

// Mock user credentials for demonstration purposes
const validCredentials = { correctStoreHash: '', correctStoreToken: '', };


const UserData = require("./models/userdata")



// Credentials store 
const sessionSecretKey = 'x1231xxcvsdfSdfAdfdsfsxfsdkaL22sdadsxd1za';



app.use(session({
  secret: sessionSecretKey, // Change this to a long, randomly generated string
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // Session expires after 8 hours
}));



app.get('/api/data', async (req, res) => {
  const url = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/products`;

  let config = {
    method: 'get',
    url: url,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': access_token
    }
  };

  try {
    const response = await axios(config);

    // Check if response.data is an object with a 'data' property
    if (response.data && Array.isArray(response.data.data)) {
      // Extracting product IDs
      const productDetails = response.data.data.map(product => {
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          sku: product.sku,
        };

      });
      // Send only the product IDs in the response
      res.json({ message: 'Product IDs fetched successfully', productDetails });
    } else {
      res.status(500).json({ message: 'Invalid data structure in the response' });
    }
  } catch (err) {
    console.error('error:', err);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


var userData = {}


// Get the current user session id
app.post('/get_current_sid', async (req, res) => {
  // console.log('what is get current sid')

  // const s_id = req.body.current_id;  
  // const token = req.body.current_token;   
  // userData = await validateSession(s_id,token)
  // console.log('<<<<<<< USER DATA IS HERE 555 >>>>>>>>>>',userData)
  res.json({ message: 'Session ID received and validated successfully.' });
});


// Validation function (same as in Endpoint 1)
async function validateSession(s_id, token) {
  try {
    var sid = s_id
    url = `${django_endpoint_baseurl}/api/authuser?sessionkey=${sid}`
    if (token) {
      const options = {
        method: 'GET',
        url: url,
        headers: { Authorization: `Token ${token}` }
      };
      const response = await axios(options);
      return response.data;
    }
  } catch (error) {
    console.error('Error validating session with Django:', error);
    throw error;
  }
}


// Function to decode jwt token recieves 
async function decodeJwt(token) {
  try {
    const decodedToken = jwt.decode(token);
    return decodedToken;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}


async function generateJwtToken(sid,uid){
  const secretKey = 'your_secret_key';

  const u_data = {
    id: sid,
    uid:uid
  };
  
  // Generate the JWT token with the user payload and secret key
  const token = jwt.sign(u_data, secretKey, { expiresIn: '8h' }); 
  return token;
}

async function checkStoreExists(storeHash, storeToken) {
  console.log('inside the store check 8888888888888',storeHash,storeToken)
  try {
    const url = `https://api.bigcommerce.com/stores/${storeHash}/v2/store`;
    const config = {
      method: 'get',
      url: url,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': storeToken,
      },
    };
    const response = await axios(config);


    var storeData = {}
    if (response.data) {
      const store_response_data = response.data
      storeData = {
        'storeId': store_response_data.id,
        'storeName': store_response_data.name
      }
    }

    console.log('what is in the storeData',storeData)

    return storeData;
  } catch (error) {
    console.error('Error faced with store validation')
  }
}

async function authenticate_user_with_jwt_token(req){
  console.log('===============>',req)
  console.log('MY jwt token is here =======>',req.session.jwtToken)
  try {
    url = `${django_endpoint_baseurl}/api/validatejwt`
    const x_auth_token = 'svrleubeveruvbwekcnerunrevnbfvbfvjbsjkvbdvhfbvfhvfjserf'
        
    const options = {
      method: 'POST',
      url: url,
      headers: {
        'X-Auth-Token': `Bearer ${x_auth_token}`,
        'Content-Type': 'application/json' // Specify the content type of the body
      },
      data: {
        jwt_token: req.session.jwtToken
      }
    };

    const response = await axios(options);    

    return response.data

  } catch (error) {
    console.log(`You don't have autherazation token`)
  }


}

app.post('/api/login', async (req,res) => {
  
  const { storeHash, storeToken, jwt_token } = req.body;

  req.session.storeHash = storeHash;
  req.session.storeToken = storeToken;
  req.session.jwtToken = jwt_token;
  
  // checks whether the jwt token is valid or not 
  const  validate_verified_token =  await authenticate_user_with_jwt_token(req)

  if(validate_verified_token){
    req.session.userData = validate_verified_token;

    console.log('My unique session id',req.session.id)

    // validate the store with storehash and token

    storeExists = await checkStoreExists(req.session.storeHash, req.session.storeToken)


    // It will be the user id dynamically get from the session
    uid = 1223;

    console.log('what is my store status =========>',storeExists)

    if(storeExists){
      console.log('Store is there=======>')
      unique_logged_token = await generateJwtToken(req.session.id,uid)
      console.log('these is my unique_logged_token here 8888',unique_logged_token)

      req.session.signedtoken =  unique_logged_token

      ult_token = req.session.signedtoken

      console.log('buddy session data ====',req.session)



     res.json({
            "ult": ult_token,
      });

    
      
    }else{
      console.log('store not exists')

      res.json({
        "message": 'store not exists error',
      });
    }


  }else{
    console.log('JWT TOKEN IS NOT A VALID TOKEN VERIFIED FROM DJANGO SIDE')
    res.json({
      "message": 'jwt token is not valid',
    });
  }






  // const decodedData = await decodeJwt(jwt_token);
  
  // var storeExists = '';

  // console.log('what is decoded data ===>', decodedData)

  // res.json({
  //         message: 'Login data recieved',
  // });
  
  // if (decodedData) {
  //   const { useremail, userid, have_access_for_product_tool } = decodedData.user;
  //   storeExists = await checkStoreExists(storeHash, storeToken)

  //   if (storeExists && storeExists.storeId) {
  //       if(have_access_for_product_tool == true){
  //         const existingUser = await UserData.findOne({ $or: [{ userid }, { useremail }] });


  //         if(existingUser){
  //           console.log('User with this ID or email already exists.');
  //         }else{
  //           console.log('createng a new user in db')
  //           const users = new UserData({ userid, useremail, storeHash, storeToken })
  //           await users.save();
  //         }

        
  //         unique_logged_token = await generateJwtToken(userid)
          
  //         res.json({
  //           message: 'User have access to the app and store is valid',
  //           status: 200,
  //           pendingstatus:true,
  //           token:unique_logged_token
  //         });
        

  //       }
  //   } else {
  //      res.json({
  //       message: 'User have no access to the app and store is valid',
  //       status: 500,
  //       pendingstatus:false
  //      });
  //   }

  // }


 


});










