const axios = require('axios');

// The API key to test
const API_KEY = '8f826d55c76b4f0692071fb883b87e56';
// You can use your own user_id if you know it, or keep this default
const USER_ID = 'clarifai';
const APP_ID = 'main';

async function testClarifaiAPI() {
  console.log('Testing Clarifai API Key with the general prediction model...');
  
  try {
    // Using the general prediction model with user_app_id
    const response = await axios({
      method: 'POST',
      url: 'https://api.clarifai.com/v2/models/aaa03c23b3724a16a56b629203edc62c/outputs',
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
        },
        "inputs": [
          {
            "data": {
              "image": {
                "url": "https://samples.clarifai.com/dog2.jpeg"
              }
            }
          }
        ]
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.data.outputs && response.data.outputs.length > 0) {
      const concepts = response.data.outputs[0].data.concepts;
      
      console.log('✅ Success! The API key is valid.');
      console.log('Sample prediction results:');
      
      // Show top 5 predictions
      concepts.slice(0, 5).forEach((concept, index) => {
        console.log(`${index + 1}. ${concept.name} (${(concept.value * 100).toFixed(2)}%)`);
      });
      
      console.log('\nYou can use this key for image recognition in the application.');
      return true;
    } else {
      console.error('❌ Unexpected response format:');
      console.error(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('No response received from the server');
      console.error(error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    console.log('\nPlease check your API key or network connection.');
    
    return false;
  }
}

testClarifaiAPI(); 