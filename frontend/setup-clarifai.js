const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=============================');
console.log('Clarifai API Key Setup');
console.log('=============================');
console.log('This script will help you set up your Clarifai API key');
console.log('for the Neural Network image recognition feature.');
console.log('\nYou can get your API key from https://clarifai.com/settings/security');
console.log('If you don\'t have an account, sign up at https://clarifai.com/signup first.\n');

rl.question('Enter your Clarifai API key (press Enter to skip): ', (apiKey) => {
  const envContent = apiKey.trim() 
    ? `REACT_APP_CLARIFAI_API_KEY=${apiKey.trim()}`
    : '# REACT_APP_CLARIFAI_API_KEY=your_api_key_here';
  
  try {
    fs.writeFileSync('.env', envContent, { flag: 'w' });
    console.log('\nAPI key saved to .env file!');
    console.log('If the app is already running, restart it for the changes to take effect.');
  } catch (err) {
    console.error('Error writing to .env file:', err.message);
  }
  
  console.log('\nIf you want to update the API key later, you can:');
  console.log('1. Edit the .env file directly, or');
  console.log('2. Run this script again: node setup-clarifai.js');
  
  rl.close();
}); 