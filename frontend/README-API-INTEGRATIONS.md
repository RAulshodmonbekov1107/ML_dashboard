# API Integrations for ML Showcase

This document describes the external API integrations used in the ML Showcase application and how to configure them.

## Text Generation Service

The text generation feature uses a multi-tier approach with three potential APIs and a local fallback system:

### 1. Primary API: OpenAI GPT-3.5 Turbo (Best Quality)

For the best text generation quality, the system uses OpenAI's GPT-3.5 Turbo model:

1. Create an account at [OpenAI](https://platform.openai.com/signup)
2. Generate an API key at [API Keys](https://platform.openai.com/api-keys)
3. Add your API key to the `PRIMARY_API_KEY` field in `frontend/src/services/textGenerator.js`

```javascript
this.PRIMARY_API_KEY = "your-openai-api-key"; // Add your key here
```

Note: Using OpenAI's API will incur charges based on token usage. Check their [pricing page](https://openai.com/pricing) for details.

### 2. Backup API: HuggingFace GPT-2 Small

If OpenAI is unavailable or the API key is not configured, the system falls back to HuggingFace's free Inference API with GPT-2 Small:

1. Create an account at [HuggingFace](https://huggingface.co/join)
2. Generate an API token at [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Add your token to the `BACKUP_API_TOKEN` field in `frontend/src/services/textGenerator.js`

```javascript
this.BACKUP_API_TOKEN = "your-huggingface-token"; // Add your token here
```

### 3. Tertiary API: HuggingFace OPT-1.3B (Better Fallback)

If both primary and secondary APIs fail, the system tries a more powerful model on HuggingFace:

- This uses the same HuggingFace token as the backup API
- No additional configuration is needed if you've set up the backup API

### 4. Local Fallback System (Always Available)

If all APIs fail or are unavailable, the system uses a sophisticated local fallback:

- Context-aware responses based on prompt type
- Customized answers with keywords from your prompt
- Always available, even offline
- No configuration needed

## Using the Text Generation Feature Without API Keys

The text generation feature will work even without API keys, using the local fallback system. However, for the best experience with high-quality, context-aware responses, we recommend setting up at least one of the APIs.

## Troubleshooting

If you encounter issues with the text generation:

1. **Check API Keys**: Ensure your API keys are correctly configured and valid
2. **Network Connectivity**: The APIs require internet access
3. **Rate Limiting**: If you're getting errors, you may have hit rate limits
4. **Fallback Mode**: If you see "Advanced Fallback System" in the response info, all APIs have failed and the system is using local fallbacks

## Privacy Note

When using external APIs, your prompts are sent to third-party servers. No user data is stored permanently, but be aware that:

- OpenAI may use prompts to improve their services (see their [privacy policy](https://openai.com/policies/privacy-policy))
- HuggingFace's hosted inference API has similar terms (see their [terms of service](https://huggingface.co/terms-of-service))

If privacy is a concern, you can choose to not configure API keys and rely solely on the local fallback system.

## API Integrations

This application uses external APIs to enhance the ML showcase application:

1. **Clarifai API** - Used for image recognition in the Neural Network model component 
2. **Hugging Face API** - Used for text generation in the LSTM model component (free, no API key required)
3. **OpenAI API** - Optional alternative for text generation (requires API key and billing)

## Setup Requirements

1. A Clarifai API key (current key: 8f826d55c76b4f0692071fb883b87e56)
2. Node.js proxy server to avoid CORS issues
3. (Optional) OpenAI API key for premium text generation

## How It Works

The proxy server sits between your frontend application and external APIs, solving CORS issues and providing a unified interface.

### Clarifai API Integration (Neural Network)

The Neural Network component implements image recognition using Clarifai's general image recognition model. Due to CORS restrictions, direct browser requests to Clarifai's API are blocked. The proxy server:

1. Accepts image analysis requests from your frontend
2. Forwards them to the Clarifai API
3. Returns the API responses to your frontend

### Hugging Face API Integration (LSTM Text Generation)

The LSTM component uses Hugging Face's free API for text generation. The proxy server:

1. Accepts text generation requests from your frontend
2. Forwards them to the Hugging Face Inference API using the GPT-2 model
3. Returns the generated text to your frontend
4. No API key required - works out of the box!
5. Falls back to the local model if the API is unavailable

### OpenAI API Integration (Optional)

For premium quality text generation, you can configure OpenAI:

1. Add your OpenAI API key in server.js
2. The system will automatically use OpenAI when available
3. Falls back to Hugging Face or local model if OpenAI is unavailable

## Running the Application

To use these API-enhanced features, you must:

1. Start the proxy server:
```bash
# From the project root
node frontend/server.js
```

2. Start the React application:
```bash
# In another terminal
cd frontend
npm start
```

3. Use the Neural Network and LSTM pages to analyze images and generate text

## API Configuration (Optional)

- **Clarifai**: Already configured with a working key
- **Hugging Face**: Works without an API key (with rate limits) 
- **OpenAI**: For premium text generation, add your key in `server.js`:
  ```js
  const OPENAI_API_KEY = 'sk-your-key-here';
  ```

## Troubleshooting

If you see errors in either component:

1. Make sure the proxy server is running
2. Check browser console for detailed error messages
3. For the Neural Network, try using the "Test with Sample Image" button
4. For LSTM, try shorter prompts or reduce the max length
5. If text generation is slow, Hugging Face's free API has rate limits - be patient

## Security Notes

In a production environment:
- Never expose API keys in frontend code
- Handle all API requests through a secure backend server
- Implement proper authentication and rate limiting
- Consider adding usage limits to prevent excessive API costs 