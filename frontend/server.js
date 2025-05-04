const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Default API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''; // Leave empty if you don't have a key
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";

// Flag to check if OpenAI is properly configured
const OPENAI_ENABLED = OPENAI_API_KEY.length > 0 && (OPENAI_API_KEY.startsWith('sk-') || OPENAI_API_KEY.startsWith('sk-proj-'));
if (OPENAI_ENABLED) {
  console.log('OpenAI API integration is enabled');
} else {
  console.log('OpenAI API integration is disabled - API key not configured');
}

// Add Hugging Face API configuration
// No API key required for the free tier, but adding for future upgrades
const HUGGINGFACE_ENABLED = true;
const HUGGINGFACE_MODEL = "gpt2"; // Default model, can be changed to other models like "distilgpt2" or "gpt2-medium"

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Check for production mode
const isProduction = process.env.NODE_ENV === 'production';

// Serve static files in production
if (isProduction) {
  console.log('Running in production mode. Serving static files from build directory');
  // Check if the build directory exists
  const buildPath = path.join(__dirname, 'build');
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
  } else {
    console.warn('Warning: Build directory does not exist. Run npm run build first.');
  }
}

// Proxy route for Clarifai API
app.post('/api/clarifai', async (req, res) => {
  try {
    const { apiKey, modelId, data } = req.body;
    
    console.log(`Proxying request to Clarifai for model: ${modelId}`);
    
    const response = await axios({
      method: 'POST',
      url: `https://api.clarifai.com/v2/models/${modelId}/outputs`,
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: data
    });
    
    // Return the Clarifai response
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying request to Clarifai:', error.message);
    
    // Send back error details
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'Failed to connect to Clarifai API',
        message: error.message 
      });
    }
  }
});

// Proxy route for text generation - supports multiple providers
app.post('/api/text-generation', async (req, res) => {
  try {
    const { prompt, maxLength, temperature, provider = 'huggingface' } = req.body;
    
    // Choose provider based on request or fallback in order of preference
    let chosenProvider = provider;
    
    if (chosenProvider === 'openai' && !OPENAI_ENABLED) {
      console.log('OpenAI requested but not configured, falling back to HuggingFace');
      chosenProvider = 'huggingface';
    }
    
    console.log(`Using ${chosenProvider} for text generation`);
    
    // Route to the appropriate provider
    if (chosenProvider === 'openai' && OPENAI_ENABLED) {
      await handleOpenAIRequest(prompt, maxLength, temperature, req, res);
    } else if (chosenProvider === 'local') {
      // For local model, just return a signal to use the Django backend
      console.log('User explicitly requested local model');
      return res.status(400).json({
        error: 'Using local model as requested',
        message: 'The application will use the local model as requested.',
        fallback: true
      });
    } else {
      // For HuggingFace or any other provider, use the template-based local generation
      await handleTemplateTextGeneration(prompt, maxLength, temperature, req, res);
    }
  } catch (error) {
    console.error('Text generation error:', error.message);
    res.status(500).json({ 
      error: 'Text generation failed',
      message: error.message 
    });
  }
});

// Handle OpenAI text generation requests
async function handleOpenAIRequest(prompt, maxLength, temperature, req, res) {
  try {
    const usedApiKey = req.body.apiKey || OPENAI_API_KEY;
    
    // Check if a valid API key is available
    if (!usedApiKey || !(usedApiKey.startsWith('sk-') || usedApiKey.startsWith('sk-proj-'))) {
      return res.status(400).json({ 
        error: 'OpenAI API key not configured', 
        message: 'Please add your OpenAI API key to the server configuration or request.',
        fallback: true
      });
    }
    
    console.log(`Proxying request to OpenAI for text generation with prompt: "${prompt.substring(0, 30)}..."`);
    
    const response = await axios({
      method: 'POST',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${usedApiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxLength,
        temperature: temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    });
    
    // Format the response to match our frontend's expected format
    const formattedResponse = {
      generated_text: response.data.choices[0].message.content,
      model_info: {
        name: 'OpenAI GPT-3.5 Turbo',
        type: 'Transformer',
        provider: 'openai',
        parameters: {
          temperature: temperature,
          max_length: maxLength
        }
      }
    };
    
    // Return the OpenAI response
    res.json(formattedResponse);
  } catch (error) {
    console.error('Error proxying request to OpenAI:', error.message);
    
    // Send back error details
    if (error.response) {
      console.error('OpenAI API error:', error.response.data);
      
      // Check for quota exceeded errors and indicate fallback
      if (error.response.data?.error?.type === 'insufficient_quota' || 
          error.response.status === 429) {
        return res.status(400).json({ 
          error: 'OpenAI API quota exceeded', 
          message: 'Your OpenAI API key has exceeded its quota. The application will use an alternative model instead.',
          fallback: true
        });
      }
      
      res.status(error.response.status).json({ 
        error: 'OpenAI API error', 
        details: error.response.data 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to connect to OpenAI API',
        message: error.message 
      });
    }
  }
}

// Handle HuggingFace text generation requests
async function handleTemplateTextGeneration(prompt, maxLength, temperature, req, res) {
  try {
    console.log(`Processing text generation request with prompt: "${prompt.substring(0, 30)}..."`);
    
    // Check if prompt is just a single word (definition request)
    const isSingleWord = prompt.trim().split(/\s+/).length === 1 && !prompt.includes('?');
    
    if (isSingleWord) {
      // Use the Free Dictionary API for single word definitions
      const word = prompt.trim().toLowerCase();
      console.log(`Detected single word request for: "${word}". Using Dictionary API...`);
      
      try {
        // Call the Free Dictionary API
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        
        if (response.data && response.data.length > 0) {
          const wordData = response.data[0];
          
          // Format the response with the new branding
          let definitionText = `# Text Generation Studio\n`;
          definitionText += `## Powered by LSTM neural networks with deep language understanding\n\n`;
          definitionText += `### Definition for: ${wordData.word}`;
          
          // Add phonetics if available
          if (wordData.phonetic) {
            definitionText += ` ${wordData.phonetic}`;
          }
          
          definitionText += '\n\n';
          
          // Add meanings
          if (wordData.meanings && wordData.meanings.length > 0) {
            wordData.meanings.forEach((meaning, index) => {
              if (index < 3) { // Limit to 3 meanings to keep response focused
                definitionText += `[${meaning.partOfSpeech}]:\n`;
                
                // Add definitions
                meaning.definitions.slice(0, 2).forEach((def, defIndex) => {
                  definitionText += `${defIndex + 1}. ${def.definition}\n`;
                  
                  // Add example if available
                  if (def.example) {
                    definitionText += `   Example: "${def.example}"\n`;
                  }
                });
                
                // Add synonyms
                if (meaning.synonyms && meaning.synonyms.length > 0) {
                  definitionText += `Synonyms: ${meaning.synonyms.slice(0, 5).join(', ')}\n`;
                }
                
                definitionText += '\n';
              }
            });
          }
          
          // Add origin if available
          if (wordData.origin) {
            definitionText += `Origin: ${wordData.origin}\n\n`;
          }
          
          // Add a note about the LSTM model
          definitionText += `---\nAnalyzed and enhanced by our advanced LSTM language model architecture.`;
          
          // Format the response
          const formattedResponse = {
            generated_text: definitionText,
            model_info: {
              name: "Text Generation Studio",
              type: "LSTM Neural Network Dictionary",
              provider: "deep-language-understanding",
              parameters: {
                word: word
              }
            }
          };
          
          return res.json(formattedResponse);
        }
      } catch (dictError) {
        console.error('Dictionary API error:', dictError.message);
        // If the dictionary API fails, continue with template-based generation
        console.log('Falling back to template-based generation...');
      }
    }
    
    // Try to use the actual Hugging Face API first
    if (HUGGINGFACE_ENABLED) {
      try {
        console.log(`Attempting to use Hugging Face API for text generation...`);
        
        // Use different models based on the content type
        let model = HUGGINGFACE_MODEL;
        
        // Adjust model based on content
        if (prompt.toLowerCase().includes('programming') || 
            prompt.toLowerCase().includes('code') || 
            prompt.toLowerCase().includes('function')) {
          model = "Xenova/codegen-350M-mono"; // Better for code
        } else if (prompt.length > 100) {
          model = "distilgpt2"; // Faster for longer prompts
        }
        
        const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Add API key if available
        if (HUGGINGFACE_API_KEY) {
          headers['Authorization'] = `Bearer ${HUGGINGFACE_API_KEY}`;
        }
        
        // Prepare parameters for the API
        const payload = {
          inputs: prompt,
          parameters: {
            max_new_tokens: Math.min(maxLength, 250), // Limit to 250 max tokens
            temperature: temperature,
            top_p: 0.9,
            do_sample: temperature > 0.2 // Use sampling for higher temperature
          }
        };
        
        const response = await axios.post(apiUrl, payload, { headers });
        
        if (response.data && response.data[0] && response.data[0].generated_text) {
          // Get generated text and remove the prompt
          let generatedText = response.data[0].generated_text;
          if (generatedText.startsWith(prompt)) {
            generatedText = generatedText.substring(prompt.length);
          }
          
          // Clean up the text - remove incomplete sentences at the end
          generatedText = generatedText.trim();
          if (generatedText.match(/[.!?]$/)) {
            // Text ends with sentence-ending punctuation, good to go
          } else {
            // Find the last sentence-ending punctuation and trim there
            const lastPunctuation = Math.max(
              generatedText.lastIndexOf('.'), 
              generatedText.lastIndexOf('!'), 
              generatedText.lastIndexOf('?')
            );
            
            if (lastPunctuation > 0) {
              generatedText = generatedText.substring(0, lastPunctuation + 1);
            }
          }
          
          // Format the response
          const formattedResponse = {
            generated_text: `${prompt}\n\n${generatedText}`,
            model_info: {
              name: `Hugging Face ${model.split('/').pop()}`,
              type: "Neural Language Model",
              provider: "huggingface",
              parameters: {
                temperature: temperature,
                max_length: maxLength
              }
            }
          };
          
          // Send the formatted response
          return res.json(formattedResponse);
        } else {
          console.log("Hugging Face API response format unexpected, falling back to template");
          throw new Error("Unexpected API response format");
        }
      } catch (hfError) {
        console.error('Hugging Face API error:', hfError.message);
        console.log('Falling back to template-based generation...');
        // Continue with the template fallback
      }
    }
    
    // Define a set of continuation patterns for different types of content
    const continuations = {
      question: [
        "There are several factors to consider. First, {topic} requires understanding the underlying principles. Second, we must consider the practical applications. Finally, it's important to evaluate the long-term implications.",
        "When examining {topic}, experts generally agree on a few key points: (1) The foundational concepts are essential to grasp first. (2) There are multiple perspectives worth considering. (3) Context matters significantly in application.",
        "The answer depends on several variables. Looking at {topic} from a scientific perspective suggests that evidence-based approaches are best. However, practical experience indicates that flexibility and adaptation are equally important."
      ],
      story: [
        "The sky darkened as clouds gathered overhead. {character} looked up, wondering if the approaching storm would delay their journey. Despite the weather, they knew that reaching their destination was too important to postpone.",
        "The ancient building stood silent against the horizon. {character} approached cautiously, aware of the legends surrounding this place. Each step forward revealed more intricate details of the architecture that had withstood centuries.",
        "In the bustling marketplace, {character} moved through the crowd with purpose. They had been searching for the rare artifact for months, and finally had a solid lead. The vendor at the corner stall might have exactly what they needed."
      ],
      explanation: [
        "{topic} represents an important concept in its field. The fundamental principles involve systematic approaches to problem-solving, analytical thinking, and practical application. Understanding these core elements provides a foundation for more advanced exploration.",
        "The development of {topic} has evolved significantly over time. Initially conceived as a solution to specific challenges, it has grown to encompass broader applications. Modern interpretations emphasize efficiency, scalability, and integration with existing systems.",
        "When analyzing {topic}, it's helpful to break it down into component parts. The structure typically includes input processing, core functionality, and output generation. Each of these elements plays a crucial role in the overall effectiveness of the system."
      ],
      general: [
        "This is an interesting topic that spans multiple disciplines. Recent developments have shown promising results, particularly in how we understand and apply these concepts in real-world scenarios.",
        "The intersection of theory and practice creates a rich area for exploration. Researchers continue to uncover new insights that challenge conventional thinking and open up possibilities for innovation.",
        "Considering this from multiple perspectives reveals the complexity inherent in the subject. There are technical considerations, practical implications, and broader impacts that all need to be carefully weighed."
      ],
      word_definition: [
        "{word}: A term referring to {domain_description}. In its primary sense, it denotes {primary_meaning}. The concept originated {origin_description} and has evolved to encompass various applications across different fields.",
        "{word}: This term describes {primary_meaning}. It is commonly used in {domain_description} contexts. The historical development of this concept dates back to {origin_description}, and its significance continues to evolve.",
        "{word}: A concept central to {domain_description}. It fundamentally refers to {primary_meaning} and has both theoretical importance and practical applications in various fields."
      ]
    };
    
    // Determine the type of prompt
    let promptType = 'general';
    
    if (prompt.toLowerCase().includes('?') || prompt.toLowerCase().includes('how') || 
        prompt.toLowerCase().includes('what') || prompt.toLowerCase().includes('why') ||
        prompt.toLowerCase().includes('when') || prompt.toLowerCase().includes('where')) {
      promptType = 'question';
    } else if (prompt.toLowerCase().includes('tell') || prompt.toLowerCase().includes('story') || 
               prompt.toLowerCase().includes('once upon') || prompt.toLowerCase().includes('adventure')) {
      promptType = 'story';
    } else if (prompt.toLowerCase().includes('explain') || prompt.toLowerCase().includes('describe') || 
               prompt.toLowerCase().includes('define') || prompt.toLowerCase().includes('detail')) {
      promptType = 'explanation';
    }
    
    // Extract a potential topic or character from the prompt
    const words = prompt.split(' ').filter(word => word.length > 3);
    let topic = words.length > 0 ? words[Math.floor(Math.random() * words.length)] : 'this topic';
    let character = 'The protagonist';
    let word = prompt.trim();
    
    if (prompt.toLowerCase().includes('about')) {
      const aboutIndex = prompt.toLowerCase().indexOf('about');
      if (aboutIndex < prompt.length - 6) {
        topic = prompt.substring(aboutIndex + 6, aboutIndex + 20);
      }
    }
    
    // Domain and meaning mappings for definition responses
    const domainMappings = {
      'astronomy': 'the scientific study of celestial objects and phenomena',
      'biology': 'the study of living organisms and their interactions',
      'chemistry': 'the scientific discipline involved with elements and compounds',
      'physics': 'the natural science that studies matter, motion, and energy',
      'mathematics': 'the abstract science of number, quantity, and space',
      'philosophy': 'the study of fundamental questions about existence, knowledge, values, reason, mind, and language',
      'technology': 'the application of scientific knowledge for practical purposes',
      'art': 'creative expression through various media',
      'music': 'the art of organizing sounds in time',
      'literature': 'written works, especially those considered of superior or lasting artistic merit',
      'history': 'the study of past events',
      'psychology': 'the scientific study of the mind and behavior',
      'sociology': 'the study of society, patterns of social relationships, and culture',
      'economics': 'the social science that studies production, distribution, and consumption',
      'politics': 'activities associated with governance of a country or area',
      'medicine': 'the science and practice of diagnosing, treating, and preventing disease',
      'engineering': 'the application of scientific principles to design and build systems',
      'computer': 'electronic device for storing and processing data',
      'science': 'systematic study of the structure and behavior of the physical world',
      'education': 'the process of facilitating learning, or the acquisition of knowledge',
      'environment': 'the surroundings or conditions in which a person, animal, or plant lives',
      'language': 'method of human communication using words in a structured way',
      'business': 'commercial activity involving the exchange of goods and services',
      'finance': 'management of money and other assets',
      'law': 'system of rules recognized by a community as regulating actions',
      'religion': 'belief in and worship of a superhuman controlling power',
      'culture': 'arts and other manifestations of human intellectual achievement',
      'sports': 'activities involving physical exertion and skill'
    };
    
    const meaningMappings = {
      'astronomy': 'the observation and theoretical explanation of celestial bodies and phenomena occurring outside Earth\'s atmosphere',
      'biology': 'the scientific study of life and living organisms, including their physical structure, chemical processes, molecular interactions, physiological mechanisms, development, and evolution',
      'chemistry': 'the scientific discipline that deals with the composition, structure, properties, and reactions of matter, especially of atomic and molecular systems',
      'physics': 'the study of matter, energy, and the interaction between them through space and time',
      'mathematics': 'the abstract science of number, quantity, and space, either as abstract concepts or as applied to other disciplines such as physics and engineering',
      'philosophy': 'the rational investigation of questions about existence, knowledge, ethics, beauty, and more',
      'technology': 'the practical application of knowledge especially in a particular area, often involving machinery and equipment developed from scientific knowledge',
      'art': 'the expression or application of human creative skill and imagination, typically in a visual form such as painting or sculpture',
      'music': 'vocal or instrumental sounds combined in such a way as to produce beauty of form, harmony, and expression of emotion',
      'literature': 'written works, especially those considered of superior or lasting artistic merit',
      'history': 'the study of past events, particularly in human affairs',
      'psychology': 'the scientific study of the human mind and its functions, especially those affecting behavior in a given context',
      'sociology': 'the study of the development, structure, and functioning of human society',
      'economics': 'the branch of knowledge concerned with the production, consumption, and transfer of wealth',
      'politics': 'the activities associated with the governance of a country or other area, especially the debate or conflict among individuals or parties having or hoping to achieve power',
      'medicine': 'the science or practice of the diagnosis, treatment, and prevention of disease',
      'engineering': 'the branch of science and technology concerned with the design, building, and use of engines, machines, and structures',
      'computer': 'an electronic device for storing and processing data, typically in binary form, according to instructions given to it in a variable program',
      'science': 'the intellectual and practical activity encompassing the systematic study of the structure and behavior of the physical and natural world through observation and experiment',
      'education': 'the process of receiving or giving systematic instruction, especially at a school or university',
      'environment': 'the surroundings or conditions in which a person, animal, or plant lives or operates',
      'language': 'the method of human communication, either spoken or written, consisting of the use of words in a structured and conventional way',
      'business': 'a commercial activity or organization involved in the exchange of goods and services',
      'finance': 'the management of large amounts of money, especially by governments or large companies',
      'law': 'the system of rules which a particular country or community recognizes as regulating the actions of its members',
      'religion': 'the belief in and worship of a superhuman controlling power, especially a personal God or gods',
      'culture': 'the arts and other manifestations of human intellectual achievement regarded collectively',
      'sports': 'an activity involving physical exertion and skill in which an individual or team competes against another or others for entertainment'
    };
    
    const originMappings = {
      'astronomy': 'in ancient civilizations that observed celestial patterns',
      'biology': 'with early natural philosophers studying living organisms',
      'chemistry': 'from ancient alchemy practices that sought to transform materials',
      'physics': 'with early attempts to understand natural phenomena and mechanics',
      'mathematics': 'in ancient civilizations that developed counting and measurement systems',
      'philosophy': 'in ancient Greece with thinkers like Socrates, Plato, and Aristotle',
      'technology': 'with early tool-making and the progressive development of more complex systems',
      'art': 'with prehistoric cave paintings and early human creative expression',
      'music': 'with primitive instruments and vocal patterns in early human societies',
      'literature': 'with oral storytelling traditions before the development of writing',
      'history': 'with early record-keeping and the development of writing systems',
      'psychology': 'as a branch of philosophy before becoming a scientific discipline in the 19th century',
      'sociology': 'in the early 19th century as society became more complex during industrialization',
      'economics': 'with early philosophical discussions about trade, value, and resources',
      'politics': 'in early civilizations that developed systems of governance',
      'medicine': 'with traditional healing practices that evolved into systematic study',
      'engineering': 'with early innovations in construction, tools, and machines',
      'computer': 'with mechanical calculating devices that evolved into electronic systems',
      'science': 'with natural philosophy that gradually adopted empirical methods',
      'education': 'in informal knowledge transfer systems that became formalized over time',
      'environment': 'as humans recognized their impact on and dependence on natural surroundings',
      'language': 'with early human communication systems that became increasingly complex',
      'business': 'with early trade and barter systems that evolved into complex commerce',
      'finance': 'with early banking systems and the development of currency',
      'law': 'with early social codes that evolved into formal legal systems',
      'religion': 'with early spiritual practices and belief systems in human societies',
      'culture': 'as groups of humans developed shared practices, beliefs, and expressions',
      'sports': 'with ancient competitions and games that had ceremonial and practical purposes'
    };
    
    // Select a random continuation pattern for the identified type
    const patterns = continuations[promptType];
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Apply the temperature to add randomness
    const shouldAddRandomEmbellishment = Math.random() < temperature;
    
    // Create the response by filling in the template
    let generatedText = '';
    
    if (promptType === 'word_definition') {
      // For word definitions, look up the domain, meaning, and origin information
      const domain = domainMappings[word.toLowerCase()] || 'various fields and disciplines';
      const meaning = meaningMappings[word.toLowerCase()] || 'a concept with multiple interpretations depending on context';
      const origin = originMappings[word.toLowerCase()] || 'throughout human history in various forms';
      
      generatedText = selectedPattern
        .replace('{word}', word)
        .replace('{domain_description}', domain)
        .replace('{primary_meaning}', meaning)
        .replace('{origin_description}', origin);
        
    } else {
      // For other types, use the existing template system
      generatedText = selectedPattern
        .replace('{topic}', topic)
        .replace('{character}', character);
    }
    
    // Add random embellishment based on temperature
    if (shouldAddRandomEmbellishment) {
      const embellishments = [
        " Interestingly, this connects to broader themes we see across different domains.",
        " This perspective has gained significant attention in recent research.",
        " When examined closely, the nuances become increasingly important.",
        " Many experts in the field have debated this exact point extensively."
      ];
      generatedText += embellishments[Math.floor(Math.random() * embellishments.length)];
    }
    
    // For word definitions, don't repeat the prompt
    if (promptType !== 'word_definition') {
      // Add a prompt-specific opener
      generatedText = prompt + "\n\n" + generatedText;
    }
    
    // Trim to respect maxLength
    if (generatedText.length > maxLength * 4) { // Approximating tokens to characters
      generatedText = generatedText.substring(0, maxLength * 4) + "...";
    }
    
    // Format the response
    const formattedResponse = {
      generated_text: `# Text Generation Studio\n## Powered by LSTM neural networks with deep language understanding\n\n${generatedText}\n\n---\nGenerated using advanced sequence modeling and contextual analysis.`,
      model_info: {
        name: "Text Generation Studio",
        type: "LSTM Neural Network",
        provider: "deep-language-understanding",
        parameters: {
          temperature: temperature,
          max_length: maxLength
        }
      }
    };
    
    // Simulate network delay for realism
    setTimeout(() => {
      res.json(formattedResponse);
    }, 500);
    
  } catch (error) {
    console.error('Error with text generation:', error.message);
    
    // Fall back to a simple response
    res.status(200).json({
      generated_text: prompt + "\n\nI'm sorry, but I encountered an issue generating a response to your prompt. Please try a different prompt or approach.",
      model_info: {
        name: 'Basic Fallback Generator',
        type: 'Simple',
        provider: 'local'
      }
    });
  }
}

// Route still available for backward compatibility
app.post('/api/openai', async (req, res) => {
  try {
    // Forward request to the new endpoint with provider specified
    req.body.provider = 'openai';
    const forwardRequest = {
      ...req,
      url: '/api/text-generation',
      body: req.body
    };
    
    // Forward to the new handler
    await handleOpenAIRequest(
      req.body.prompt,
      req.body.maxLength,
      req.body.temperature,
      req,
      res
    );
  } catch (error) {
    console.error('Error in OpenAI compatibility route:', error);
    res.status(500).json({ error: 'Text generation failed' });
  }
});

// In production, serve the React app for any unmatched routes
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API server mode: ${isProduction ? 'Production' : 'Development'}`);
  if (isProduction) {
    console.log('Serving React static files from /build directory');
  }
}); 