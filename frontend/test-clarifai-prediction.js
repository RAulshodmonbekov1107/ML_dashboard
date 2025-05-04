const axios = require('axios');

// The API key to test
const API_KEY = 'b8e88e537c934f39ba6786cf09d78d77';

async function testClarifaiPrediction() {
  console.log('Testing Clarifai API Key with a sample prediction...');
  
  try {
    // Simple prediction using a public image URL
    const response = await axios({
      method: 'POST',
      url: 'https://api.clarifai.com/v2/models/aaa03c23b3724a16a56b629203edc62c/outputs',
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
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

testClarifaiPrediction(); 