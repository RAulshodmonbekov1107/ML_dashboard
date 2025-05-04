const axios = require('axios');
const fs = require('fs');
const path = require('path');

// The API key to test
const API_KEY = '8f826d55c76b4f0692071fb883b87e56';
const USER_ID = 'clarifai';
const APP_ID = 'main';

// For debugging - set to true to use a local test image
const USE_LOCAL_IMAGE = true;
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

async function debugClarifai() {
  console.log('Debugging Clarifai API call...');
  
  try {
    let requestData;
    
    if (USE_LOCAL_IMAGE && fs.existsSync(TEST_IMAGE_PATH)) {
      // Read a local image file and convert to base64
      const imageBuffer = fs.readFileSync(TEST_IMAGE_PATH);
      const base64Image = imageBuffer.toString('base64');
      
      console.log('Using local image file:', TEST_IMAGE_PATH);
      console.log('Image size:', Math.round(imageBuffer.length / 1024), 'KB');
      
      // Create request with base64 image data
      requestData = {
        "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
        },
        "inputs": [
          {
            "data": {
              "image": {
                "base64": base64Image
              }
            }
          }
        ]
      };
    } else {
      // Create request with sample image URL
      console.log('Using sample image URL');
      requestData = {
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
      };
    }
    
    console.log('Request URL:', 'https://api.clarifai.com/v2/models/general-image-recognition/outputs');
    console.log('Request headers:', {
      'Authorization': `Key ${API_KEY}`,
      'Content-Type': 'application/json'
    });
    console.log('Request data structure:', JSON.stringify({
      user_app_id: requestData.user_app_id,
      inputs: 'IMAGE_DATA_OMITTED_FOR_BREVITY'
    }, null, 2));
    
    // Make the API call
    const response = await axios({
      method: 'POST',
      url: 'https://api.clarifai.com/v2/models/general-image-recognition/outputs',
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: requestData
    });
    
    console.log('Response status:', response.status);
    
    if (response.data.outputs && response.data.outputs.length > 0) {
      const concepts = response.data.outputs[0].data.concepts;
      
      console.log('✅ Success! API call worked correctly.');
      console.log('Sample prediction results:');
      
      // Show top 5 predictions
      concepts.slice(0, 5).forEach((concept, index) => {
        console.log(`${index + 1}. ${concept.name} (${(concept.value * 100).toFixed(2)}%)`);
      });
      
      console.log('\nAPI is working correctly. The error in the app must be elsewhere.');
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
    
    console.log('\nPlease check the error details above for troubleshooting.');
    
    return false;
  }
}

debugClarifai(); 