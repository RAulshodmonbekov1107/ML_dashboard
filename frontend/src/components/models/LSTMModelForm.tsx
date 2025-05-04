import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';
import apiService, { PredictionResult } from '../../services/apiService';
import textGenerator from '../../services/textGenerator.js';

interface LSTMModelFormProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

// Define a specific interface for text generation results
interface TextGenerationResult {
  generated_text: string;
  model_info?: {
    name?: string;
    type?: string;
    provider?: string;
    parameters?: {
      temperature?: number;
      max_length?: number;
      model?: string;
    }
  }
}

// GPT-2 model info
const MODEL_TYPES = [
  { id: 'gpt2', name: 'GPT-2 Small', description: 'Free Hugging Face version' }
];

const LSTMModelForm: React.FC<LSTMModelFormProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [maxLength, setMaxLength] = useState<number>(100);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextGenerationResult | null>(null);
  const [provider, setProvider] = useState<string>('api');
  const [modelType, setModelType] = useState<string>('gpt2');
  const [progress, setProgress] = useState<{progress: number, message: string} | null>(null);
  const [isModelsReady, setIsModelsReady] = useState<boolean>(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Preload models on component mount
  useEffect(() => {
    const preloadModels = async () => {
      try {
        await textGenerator.preloadDefaultModel();
        setIsModelsReady(true);
      } catch (error) {
        console.warn('Failed to preload models:', error);
        // Still mark as ready so user can try generating
        setIsModelsReady(true);
      }
    };
    
    preloadModels();
  }, []);

  // Render realistic text generation results
  const renderGeneratedText = () => {
    if (!result || !result.generated_text) return null;
    
    // Get the text to display
    let displayText = result.generated_text;
    
    // Format definitions differently if it looks like a definition
    if (prompt.trim().split(/\s+/).length <= 2 && 
        (displayText.includes('[') || displayText.includes(':')) && 
        displayText.length > 50) {
      return (
        <div className="whitespace-pre-wrap text-gray-800 bg-gradient-to-br from-white to-purple-50 p-4 rounded-md border border-purple-100">
          <div className="prose prose-sm max-w-none">
            {displayText.split('\n').map((line, i) => {
              // Bold the part of speech
              if (line.match(/^\[(.*)\]:$/)) {
                return <h4 key={i} className="text-purple-800 font-semibold mt-4 mb-2">{line}</h4>;
              }
              // Bold the definition numbers
              else if (line.match(/^\d+\./)) {
                const [num, ...rest] = line.split('. ');
                return (
                  <p key={i} className="mb-2">
                    <span className="font-bold">{num}.</span> {rest.join('. ')}
                  </p>
                );
              }
              // Italicize examples
              else if (line.includes('Example:')) {
                return (
                  <p key={i} className="pl-4 text-gray-600 italic mb-2">
                    {line}
                  </p>
                );
              }
              // Bold synonyms
              else if (line.startsWith('Synonyms:')) {
                return (
                  <p key={i} className="mb-2">
                    <span className="font-semibold">Synonyms:</span> {line.replace('Synonyms:', '')}
                  </p>
                );
              }
              // Bold origin
              else if (line.startsWith('Origin:')) {
                return (
                  <p key={i} className="mb-2">
                    <span className="font-semibold">Origin:</span> {line.replace('Origin:', '')}
                  </p>
                );
              }
              // Regular paragraphs
              else if (line.trim()) {
                return <p key={i} className="mb-2">{line}</p>;
              }
              // Empty lines
              return <br key={i} />;
            })}
          </div>
        </div>
      );
    }
    
    // For narrative text, add proper paragraph styling
    return (
      <div className="whitespace-pre-wrap text-gray-800 bg-gradient-to-br from-white to-purple-50 p-4 rounded-md border border-purple-100">
        <div className="prose prose-sm max-w-none">
          {displayText.split('\n\n').map((paragraph, i) => {
            if (!paragraph.trim()) return null;
            
            // If it looks like a list, format it as one
            if (paragraph.includes('\n- ')) {
              return (
                <div key={i} className="mb-4">
                  {paragraph.split('\n').map((line, j) => {
                    if (line.startsWith('- ')) {
                      return <li key={j} className="ml-4">{line.substring(2)}</li>;
                    }
                    return <p key={j} className="mb-2">{line}</p>;
                  })}
                </div>
              );
            }
            
            return <p key={i} className="mb-4">{paragraph}</p>;
          })}
        </div>
      </div>
    );
  };
  
  // Improve the prompt placeholders
  const getPlaceholderByTemperature = () => {
    if (temperature < 0.4) {
      return "Enter your prompt here for focused, factual responses...";
    } else if (temperature < 0.7) {
      return "Enter your prompt here for balanced, informative text...";
    } else {
      return "Enter your prompt here for creative, varied responses...";
    }
  };
  
  // Temperature description based on value
  const getTemperatureDescription = () => {
    if (temperature <= 0.3) {
      return "More focused, deterministic outputs";
    } else if (temperature <= 0.6) {
      return "Balanced creativity and coherence";
    } else {
      return "More varied, creative outputs";
    }
  };
  
  // Update the model description to emphasize OpenAI integration
  const getProviderDescription = () => {
    switch(provider) {
      case 'api':
        return "Uses OpenAI GPT-3.5 Turbo or HuggingFace for high-quality text generation";
      case 'local':
        return "Uses pre-written responses when APIs are unavailable";
      default:
        return "Select a model to generate text";
    }
  };

  // Enhanced form submission with model selection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt for text generation');
      return;
    }
    
    setLoading(true);
    setError(null);
    setProgress(null);
    
    try {
      if (provider === 'api') {
        // Try the API option
        try {
          // Add random delay to simulate thinking
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
          setProgress({progress: 0.5, message: 'Contacting API...'});
          
          // Use GPT-2 via textGenerator service
          const result = await textGenerator.generateText(prompt, {
            maxLength,
            temperature,
            modelType: 'gpt2'
          });
          
          setResult(result);
        } catch (apiError) {
          console.warn('API failed, falling back to local model:', apiError);
          
          // Fall back to local model
          setError(`API unavailable - falling back to local model. ${apiError instanceof Error ? apiError.message : ''}`);
          setProvider('local');
          
          // Try again with local model
          const result = await textGenerator.generateText(prompt, {
            maxLength,
            temperature,
            modelType: 'gpt2' // Use gpt2 model for fallback
          });
          
          setResult(result);
          // Clear the fallback error
          setError(null);
        }
      } else {
        // Fallback to simple local model
        const response = await textGenerator.generateText(prompt, {
          maxLength,
          temperature,
          modelType: 'gpt2'
        });
        
        setResult(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during text generation');
      console.error('Text generation error:', err);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <motion.form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants}>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Text Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full min-h-[160px] px-4 py-3 text-base text-gray-900 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder={getPlaceholderByTemperature()}
            />
          </motion.div>
          
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-6" variants={itemVariants}>
            <div>
              <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700 mb-2">
                Max Length: <span className="text-purple-600 font-semibold">{maxLength}</span>
              </label>
              <input
                id="maxLength"
                type="range"
                min="10"
                max="100"
                step="10"
                value={maxLength}
                onChange={(e) => setMaxLength(parseInt(e.target.value))}
                className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span>100</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                Temperature: <span className="text-purple-600 font-semibold">{temperature.toFixed(1)}</span>
              </label>
              <input
                id="temperature"
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1</span>
                <span>1.0</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{getTemperatureDescription()}</p>
            </div>
          </motion.div>
          
          <motion.div className="grid grid-cols-1 gap-6" variants={itemVariants}>
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                Text Generation Model
              </label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="api">Advanced AI Models (OpenAI + HuggingFace)</option>
                <option value="local">Fallback Responses (Offline)</option>
              </select>
              
              <p className="text-xs text-gray-500 mt-1">
                {getProviderDescription()}
              </p>
            </div>
          </motion.div>
          
          <motion.button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="gpt2-button w-full text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Generating Text{progress ? ` (${Math.round(progress.progress * 100)}%)` : '...'}</span>
              </div>
            ) : (
              'Generate Text with Advanced AI'
            )}
          </motion.button>
        </motion.form>
        
        <motion.div 
          className="mt-8 bg-purple-50 p-5 rounded-lg border border-purple-100"
          variants={itemVariants}
        >
          <h4 className="text-sm font-bold text-purple-800 mb-2">About Advanced Text Generation</h4>
          <p className="text-sm text-gray-700">
            This system uses OpenAI's GPT-3.5 Turbo as the primary model when available, 
            with fallbacks to GPT-2 and other models through HuggingFace. The temperature 
            setting controls creativity - lower values produce more focused responses, 
            while higher values generate more diverse and creative text.
          </p>
        </motion.div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <motion.h3 
          className="text-xl font-semibold text-purple-800 mb-4"
          variants={itemVariants}
        >
          Generated Text
        </motion.h3>
        
        <motion.div 
          className="gpt2-card p-6 min-h-[350px] transition-all duration-300"
          variants={resultVariants}
          whileHover={{ boxShadow: "0 10px 25px rgba(147, 51, 234, 0.15)" }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="lg" color="blue" />
              <span className="mt-4 text-purple-600">
                {progress ? progress.message : 'Generating text...'}
              </span>
              {progress && (
                <div className="w-48 bg-gray-200 rounded-full h-2.5 mt-3">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress.progress * 100}%` }}></div>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-md">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : result && result.generated_text ? (
            <div>
              <div className="font-medium text-purple-900 mb-2">Your Prompt:</div>
              <div className="bg-purple-50 p-4 rounded-md mb-6 text-gray-800 border border-purple-100">
                {prompt}
              </div>
              <div className="font-medium text-purple-900 mb-2">GPT-2 Response:</div>
              {renderGeneratedText()}
              {result.model_info && (
                <motion.div 
                  className="mt-4 text-xs text-gray-500 flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>
                    Generated using: <span className={result.model_info.name && result.model_info.name.includes("GPT-3.5") ? "text-green-600 font-medium" : ""}>{result.model_info.name || 'GPT-2 Small'}</span>
                    {result.model_info.parameters?.model && ` (${result.model_info.parameters.model})`}
                  </span>
                  <span className={result.model_info.provider === "OpenAI API" ? "text-green-600" : "text-purple-500"}>
                    Powered by {result.model_info.provider || 'Language Model API'}
                  </span>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 h-full flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-purple-200 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <p>Enter a prompt and click Generate to see AI-created text</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LSTMModelForm; 