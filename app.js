const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser'); // Added for parsing request body
const request = require('request');

require('dotenv').config();
const app = express();
// Enable CORS for all routes
app.use(cors());
// Body parser middleware
app.use(bodyParser.json());

const port = process.env.PORT;
const store_hash = process.env.STORE_HASH;
const access_token = process.env.ACCESS_TOKEN;
const django_endpoint_baseurl = process.env.DJANGO_ENDPOINT_BASE_URL;


// Mock user credentials for demonstration purposes
const validCredentials = {correctStoreHash: '',correctStoreToken: ''};
app.post('/api/login', async (req, res) => {
  const { storeHash, storeToken } = req.body;
  // Validate user credentials with BigCommerce API
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

    if (response.status === 200) {
      // Successful validation
      // console.log("Validate completed");
      res.json({ message: 'Store validation successful' });
    } else {
      // Failed validation
      // console.log("validation failed");
      res.status(response.status).json({ message: 'Store validation failed' });
    }
  } catch (error) {
    console.error('Error during store validation:', error);
    res.status(500).json({ message: 'Error during store validation' });
  }
});

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

// Get the current user session id
app.post('/get_current_sid', async (req, res) => {
  const s_id = req.body.session_id;
  console.log('Received session ID:', s_id);
  const token = req.body.token;
  console.log('Received token here',token);
  const userData = await validateSession(s_id,token)
  console.log('>>>>>> USER DATA IS HERE >>>>>>>>>>',userData.data)
  res.json({ message: 'Session ID received and validated successfully.' , userData: userData });
}); 

// Validation function (same as in Endpoint 1)
async function validateSession(s_id, token) {
  try {
    const options = {
      method: 'GET',
      url: `${django_endpoint_baseurl}/api/authuser?sessionkey=${s_id}`,
      headers: {
        Authorization: `Token ${token}`
      }
    };
    const response = await axios(options);
    return response;
  } catch (error) {
    console.error('Error validating session with Django:', error);
    throw error;
  }
}













