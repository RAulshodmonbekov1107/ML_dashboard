import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ResultDisplay from '../ui/ResultDisplay';
import LoadingSpinner from '../ui/LoadingSpinner';
import apiService, { PredictionResult } from '../../services/apiService';

interface TranslationModelFormProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

// Create a type that extends PredictionResult for translation
interface TranslationResult extends PredictionResult {
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  translation_method?: string;
}

// Create language flag mapping
const languageFlags: Record<string, string> = {
  'English': '🇺🇸',
  'Spanish': '🇪🇸',
  'French': '🇫🇷',
  'German': '🇩🇪',
  'Chinese': '🇨🇳',
  'Japanese': '🇯🇵',
  'Russian': '🇷🇺',
  'Arabic': '🇦🇪',
  'Portuguese': '🇵🇹',
  'Italian': '🇮🇹',
  'Auto-detect': '🔍'
};

const TranslationModelForm: React.FC<TranslationModelFormProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  const [text, setText] = useState<string>('');
  const [sourceLanguage, setSourceLanguage] = useState<string>('Auto-detect');
  const [targetLanguage, setTargetLanguage] = useState<string>('Spanish');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [supportedLanguages] = useState<string[]>([
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
    'Russian', 'Arabic', 'Portuguese', 'Italian'
  ]);
  const [animateTranslation, setAnimateTranslation] = useState<boolean>(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.9 },
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

  const switchLanguages = () => {
    if (sourceLanguage !== 'Auto-detect') {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
      setAnimateTranslation(true);
      setTimeout(() => setAnimateTranslation(false), 1000);
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('Please enter text to translate');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending translation request with data:', {
        text,
        source_language: sourceLanguage === 'Auto-detect' ? null : sourceLanguage,
        target_language: targetLanguage
      });
      
      // Fix: Make sure we're using the correct endpoint
      // The backend expects it in the format "translation/"
      const endpoint = "translation/";
      console.log('Using model endpoint:', endpoint);
      
      const response = await apiService.makePrediction<PredictionResult>(
        endpoint,
        { 
          text: text,
          source_language: sourceLanguage === 'Auto-detect' ? null : sourceLanguage,
          target_language: targetLanguage
        }
      );
      
      console.log('Translation response received:', response);
      
      setLoading(false);
      
      if ('error' in response && response.error) {
        setError(response.error || 'Unknown error occurred');
        return;
      }
      
      // Handle the translation result
      if (response.translated_text) {
        // Create a translation-specific result object
        const translationResult: TranslationResult = {
          prediction: response.translated_text,
          original_text: text,
          translated_text: response.translated_text,
          source_language: response.source_language || sourceLanguage,
          target_language: response.target_language || targetLanguage,
          translation_method: response.translation_method
        };
        
        setResult(translationResult);
      } else if (typeof response.prediction === 'string') {
        // Fallback to using prediction field
        const translationResult: TranslationResult = {
          prediction: response.prediction,
          original_text: text,
          translated_text: response.prediction,
          source_language: sourceLanguage,
          target_language: targetLanguage
        };
        
        setResult(translationResult);
      } else {
        setError('Received an invalid translation result');
      }
    } catch (err) {
      setLoading(false);
      console.error('Detailed translation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during translation');
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ position: 'relative', zIndex: 5 }}
    >
      <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-xl p-6 border border-blue-100">
        <motion.h3 
          className="text-2xl font-bold text-blue-700 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
        
        <motion.form 
          onSubmit={(e) => { e.preventDefault(); handleTranslate(); }} 
          className="space-y-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Text to Translate
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[150px] px-4 py-3 text-base text-gray-900 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300"
              placeholder="Enter text to translate..."
            />
          </motion.div>
          
          <motion.div 
            className="relative flex items-center"
            variants={itemVariants}
          >
            <div className="flex-1">
              <label htmlFor="sourceLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                Source Language
              </label>
              <div className="relative">
                <select
                  id="sourceLanguage"
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-base text-gray-900 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none transition-all duration-200 hover:border-blue-300"
                >
                  <option value="Auto-detect">🔍 Auto-detect</option>
                  {supportedLanguages.map(lang => (
                    <option key={lang} value={lang}>{languageFlags[lang]} {lang}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xl">
                  {languageFlags[sourceLanguage]}
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l7 7a1 1 0 01-1.414 1.414L10 5.414 3.707 11.707a1 1 0 01-1.414-1.414l7-7A1 1 0 0110 3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <motion.div 
              className="mx-2 bg-blue-50 p-2 rounded-full cursor-pointer hover:bg-blue-100 transition-colors duration-200"
              onClick={switchLanguages}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={animateTranslation ? { rotate: 180 } : {}}
              transition={{ duration: 0.5 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </motion.div>
            
            <div className="flex-1">
              <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                Target Language
              </label>
              <div className="relative">
                <select
                  id="targetLanguage"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-base text-gray-900 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none transition-all duration-200 hover:border-blue-300"
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang} value={lang}>{languageFlags[lang]} {lang}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xl">
                  {languageFlags[targetLanguage]}
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l7 7a1 1 0 01-1.414 1.414L10 5.414 3.707 11.707a1 1 0 01-1.414-1.414l7-7A1 1 0 0110 3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.button
            type="submit"
            disabled={loading || !text.trim() || !targetLanguage}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Translating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Translate Text
              </div>
            )}
          </motion.button>
        </motion.form>
        
        <motion.div 
          className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-inner"
          variants={itemVariants}
        >
          <h4 className="text-sm font-bold text-blue-800">About Neural Machine Translation</h4>
          <p className="text-sm text-blue-700 mt-2">
            Neural Machine Translation uses deep learning models to translate text from one language to another. 
            These models analyze the entire context of sentences rather than just individual words, 
            resulting in more accurate and natural-sounding translations.
          </p>
          <div className="flex items-center justify-center mt-3">
            <motion.div 
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "loop", 
                duration: 4
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-lg shadow-xl p-6 border border-blue-100"
        variants={itemVariants}
      >
        <motion.h3 
          className="text-2xl font-bold text-blue-700 mb-4 flex items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Translation Result
        </motion.h3>
        
        {(result || error || loading) ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={resultVariants}
          >
            <ResultDisplay
              result={result}
              isLoading={loading}
              error={error}
            />
            
            {result && (
              <motion.div 
                className="mt-4 bg-gradient-to-br from-white to-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="mb-5">
                  <div className="font-bold text-blue-800 mb-2 flex items-center">
                    <span className="text-xl mr-2">{languageFlags[result.source_language]}</span>
                    Original Text ({result.source_language}):
                  </div>
                  <div className="bg-white p-4 rounded-lg mb-4 text-gray-800 whitespace-pre-wrap border border-gray-200 shadow-inner">
                    {result.original_text}
                  </div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="font-bold text-blue-800 mb-2 flex items-center">
                    <span className="text-xl mr-2">{languageFlags[result.target_language]}</span>
                    Translated Text ({result.target_language}):
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap border border-blue-200 shadow-inner">
                    {result.translated_text}
                  </div>
                  
                  {result.translation_method && (
                    <div className="mt-3 text-xs text-gray-600 italic flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Translated using: {result.translation_method === "google_translate" ? "Google Translate API" : "Dictionary-based translation"}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg border border-blue-100 text-center min-h-[300px] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="text-blue-500 mb-4"
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "loop", 
                duration: 2
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </motion.div>
            <p className="text-blue-700 font-medium">Enter text and select languages to see translation</p>
            <p className="text-blue-600 text-sm mt-2">Powered by Google Translate API</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TranslationModelForm; 