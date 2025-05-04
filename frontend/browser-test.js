// Simple browser-like test for Clarifai API
const axios = require('axios');
const fs = require('fs');

// Configuration - exactly matching the React component
const API_KEY = '8f826d55c76b4f0692071fb883b87e56';
const MODEL_ID = 'general-image-recognition';
const USER_ID = 'clarifai';
const APP_ID = 'main';

// Test with a sample image URL to simulate browser environment
async function testClarifaiInBrowserStyle() {
  console.log('Testing Clarifai API with browser-style parameters...');
  
  try {
    // Use a sample image URL that's publicly accessible
    const imageUrl = 'https://samples.clarifai.com/dog2.jpeg';
    
    console.log('Request URL:', `https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`);
    console.log('Headers:', {
      'Authorization': `Key ${API_KEY}`,
      'Content-Type': 'application/json'
    });
    
    const requestData = {
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": imageUrl
            }
          }
        }
      ]
    };
    
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await axios({
      method: 'POST',
      url: `https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`,
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: requestData
    });
    
    console.log('Response status:', response.status);
    console.log('Response data structure:', JSON.stringify({
      status: response.data.status,
      outputs: response.data.outputs ? '[outputs present]' : '[no outputs]'
    }, null, 2));
    
    if (response.data.outputs && response.data.outputs.length > 0) {
      const concepts = response.data.outputs[0].data.concepts;
      console.log('✅ Success! Found concepts in the response.');
      
      // Show the first few concepts
      concepts.slice(0, 3).forEach((concept, index) => {
        console.log(`- ${concept.name}: ${(concept.value * 100).toFixed(2)}%`);
      });
    } else {
      console.error('❌ No concepts found in the response.');
      console.error(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('No response received');
      console.error(error.request);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testClarifaiInBrowserStyle(); 