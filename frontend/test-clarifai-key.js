const axios = require('axios');

// The API key to test
const API_KEY = 'b8e88e537c934f39ba6786cf09d78d77';
const MODEL_ID = 'general-image-recognition';
const USER_ID = 'clarifai';
const APP_ID = 'main';

async function testClarifaiKey() {
  console.log('Testing Clarifai API Key...');
  
  try {
    // Make a simple request to get model info
    const response = await axios({
      method: 'GET',
      url: `https://api.clarifai.com/v2/models/${MODEL_ID}/output_info`,
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        'user_id': USER_ID,
        'app_id': APP_ID
      }
    });
    
    console.log('✅ Success! The API key is valid.');
    console.log('Model details:');
    console.log(`- ID: ${MODEL_ID}`);
    console.log(`- Type: ${response.data.model?.output_info?.type || 'unknown'}`);
    console.log('You can use this key for image recognition in the application.');
    
    return true;
  } catch (error) {
    console.error('❌ Error: The API key appears to be invalid or has insufficient permissions.');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
    
    console.log('\nPlease check your key or generate a new one at https://clarifai.com/settings/security');
    
    return false;
  }
}

testClarifaiKey(); 