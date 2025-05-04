import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import Navbar from '../layout/Navbar';
import './NaiveBayes.css';

interface AnimatedNaiveBayesPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface PredictionResult {
  prediction: string;
  confidence: number;
  probabilities?: {
    [key: string]: number;
  };
  keywords?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  error?: string;
}

const AnimatedNaiveBayesPage: React.FC<AnimatedNaiveBayesPageProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  const [text, setText] = useState<string>('');
  const [exampleTexts, setExampleTexts] = useState<{ text: string; category: string }[]>([
    { text: "This product is amazing! I absolutely love it.", category: "positive" },
    { text: "I'm not very impressed with the quality, quite disappointed.", category: "negative" },
    { text: "The service was okay, not great but not terrible either.", category: "neutral" },
    { text: "Absolutely horrible experience, would never recommend.", category: "negative" },
    { text: "This exceeded all my expectations, truly outstanding!", category: "positive" }
  ]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'examples' | 'explanation'>('input');
  const [animationState, setAnimationState] = useState({
    headerVisible: false,
    formVisible: false,
    resultVisible: false
  });
  
  // Trigger animations when the component mounts
  useEffect(() => {
    setTimeout(() => setAnimationState(prev => ({ ...prev, headerVisible: true })), 300);
    setTimeout(() => setAnimationState(prev => ({ ...prev, formVisible: true })), 700);
    if (prediction) {
      setTimeout(() => setAnimationState(prev => ({ ...prev, resultVisible: true })), 300);
    }
  }, [prediction]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsLoading(true);
    setPrediction(null);
    setAnimationState(prev => ({ ...prev, resultVisible: false }));
    
    try {
      const result = await apiService.makePrediction<PredictionResult>(
        modelEndpoint,
        { text }
      );
      
      setPrediction(result);
      setTimeout(() => setAnimationState(prev => ({ ...prev, resultVisible: true })), 300);
    } catch (error) {
      console.error('Error making prediction:', error);
      setPrediction({
        prediction: 'Error',
        confidence: 0,
        error: 'Failed to make prediction. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (text: string) => {
    setText(text);
    setActiveTab('input');
    // Auto submit after a short delay
    setTimeout(() => {
      const form = document.getElementById('sentiment-form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 500);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1 
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Emojis for sentiment
  const sentimentEmojis = {
    positive: "😊",
    negative: "😞",
    neutral: "😐"
  };

  // Get color for confidence bar
  const getConfidenceColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#4ade80'; // green
      case 'negative': return '#ef4444'; // red
      case 'neutral': return '#facc15'; // yellow
      default: return '#6b7280'; // gray
    }
  };

  // Word Cloud component
  const WordCloud = ({ text }: { text: string }) => {
    // Extract individual words, removing punctuation and making lowercase
    const words = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/);
    
    // Count word frequency
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
      if (word.length > 2) { // Only count words with more than 2 characters
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Only take top 20 words
    
    // Scale font sizes between 1 and 3.5rem based on frequency
    const maxFreq = sortedWords.length > 0 ? sortedWords[0][1] : 1;
    const minFreq = sortedWords.length > 0 ? sortedWords[sortedWords.length - 1][1] : 1;
    const fontScale = (freq: number) => {
      return 1 + 2.5 * ((freq - minFreq) / (maxFreq - minFreq || 1));
    };
    
    return (
      <div className="word-cloud">
        {sortedWords.map(([word, freq], index) => (
          <motion.span
            key={word}
            className="word-cloud-item"
            style={{ 
              fontSize: `${fontScale(freq)}rem`,
              opacity: 0.6 + 0.4 * (freq / maxFreq)
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.6 + 0.4 * (freq / maxFreq), y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  };

  // Confidence gauge
  const ConfidenceGauge = ({ sentiment, confidence }: { sentiment: string, confidence: number }) => {
    const angle = confidence * 180;
    const color = getConfidenceColor(sentiment);
    
    return (
      <div className="confidence-gauge-container">
        <div className="confidence-gauge">
          <div className="gauge-scale">
            <div className="gauge-label gauge-label-low">Low</div>
            <div className="gauge-label gauge-label-med">Medium</div>
            <div className="gauge-label gauge-label-high">High</div>
          </div>
          <motion.div 
            className="gauge-needle"
            initial={{ rotate: 0 }}
            animate={{ rotate: angle }}
            transition={{ type: "spring", stiffness: 60, damping: 10 }}
          />
          <div className="gauge-center" style={{ backgroundColor: color }}></div>
        </div>
        <motion.div 
          className="confidence-value"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <span>{(confidence * 100).toFixed(1)}%</span>
          <span className="confidence-label">Confidence</span>
        </motion.div>
      </div>
    );
  };

  // Feature extraction visualization
  const FeatureHighlighter = ({ text, keywords }: { text: string, keywords: { positive: string[], negative: string[], neutral: string[] } }) => {
    if (!keywords) return <div className="text-gray-500">No keyword data available</div>;
    
    // Process the text to highlight keywords
    const processedText = text.split(' ').map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      
      if (keywords.positive.includes(cleanWord)) {
        return <span key={index} className="highlight-positive">{word} </span>;
      } else if (keywords.negative.includes(cleanWord)) {
        return <span key={index} className="highlight-negative">{word} </span>;
      } else if (keywords.neutral.includes(cleanWord)) {
        return <span key={index} className="highlight-neutral">{word} </span>;
      } else {
        return <span key={index}>{word} </span>;
      }
    });
    
    return (
      <div className="feature-highlighter">
        <h3 className="text-lg font-semibold mb-2">Feature Extraction</h3>
        <div className="highlighted-text">{processedText}</div>
        <div className="feature-key mt-4 grid grid-cols-3 gap-2">
          <div className="key-item">
            <span className="key-dot key-positive"></span>
            <span className="key-label">Positive</span>
          </div>
          <div className="key-item">
            <span className="key-dot key-negative"></span>
            <span className="key-label">Negative</span>
          </div>
          <div className="key-item">
            <span className="key-dot key-neutral"></span>
            <span className="key-label">Neutral</span>
          </div>
        </div>
      </div>
    );
  };

  // Sentiment breakdown
  const SentimentProbabilities = ({ probabilities }: { probabilities?: { [key: string]: number } }) => {
    if (!probabilities) return null;
    
    const sentiments = [
      { name: 'Positive', value: probabilities.positive || 0, color: '#4ade80' },
      { name: 'Negative', value: probabilities.negative || 0, color: '#ef4444' },
      { name: 'Neutral', value: probabilities.neutral || 0, color: '#facc15' }
    ];
    
    return (
      <div className="sentiment-probabilities">
        <h3 className="text-lg font-semibold mb-4">Sentiment Breakdown</h3>
        <div className="probability-bars">
          {sentiments.map((sentiment, index) => (
            <motion.div 
              key={sentiment.name}
              className="probability-bar-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <div className="sentiment-name">{sentiment.name}</div>
              <div className="probability-bar-bg">
                <motion.div 
                  className="probability-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${sentiment.value * 100}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  style={{ backgroundColor: sentiment.color }}
                />
              </div>
              <div className="probability-value">{(sentiment.value * 100).toFixed(1)}%</div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="naive-bayes-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          className="page-header text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: animationState.headerVisible ? 1 : 0, 
            y: animationState.headerVisible ? 0 : -20 
          }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
          <p className="text-xl text-gray-600 mt-2 max-w-3xl mx-auto">{description}</p>
          
          <motion.div 
            className="emoji-animation"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="emoji-container">
              <div className="emoji emoji-positive">😊</div>
              <div className="emoji emoji-neutral">😐</div>
              <div className="emoji emoji-negative">😞</div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <motion.div 
            className="md:col-span-5 bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            animate={{ 
              opacity: animationState.formVisible ? 1 : 0, 
              x: animationState.formVisible ? 0 : -50 
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="tab-navigation bg-gray-50 border-b flex">
              <button 
                className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
                onClick={() => setActiveTab('input')}
              >
                Text Input
              </button>
              <button 
                className={`tab-button ${activeTab === 'examples' ? 'active' : ''}`}
                onClick={() => setActiveTab('examples')}
              >
                Examples
              </button>
              <button 
                className={`tab-button ${activeTab === 'explanation' ? 'active' : ''}`}
                onClick={() => setActiveTab('explanation')}
              >
                How It Works
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'input' && (
                <form id="sentiment-form" onSubmit={handleSubmit}>
                  <h2 className="text-2xl font-semibold mb-4">Analyze Sentiment</h2>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Enter text for sentiment analysis</label>
                    <textarea
                      value={text}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                      placeholder="Type or paste text here to analyze its sentiment..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
                  </button>
                </form>
              )}
              
              {activeTab === 'examples' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-2xl font-semibold mb-4">Example Texts</h2>
                  <p className="text-gray-600 mb-4">Click on an example to analyze it:</p>
                  
                  <div className="example-list space-y-4">
                    {exampleTexts.map((example, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`example-item cursor-pointer p-4 rounded-lg border hover:bg-gray-50 transition-colors example-${example.category}`}
                        onClick={() => handleExampleClick(example.text)}
                      >
                        <div className="flex items-start">
                          <span className="example-emoji mr-3 text-2xl">
                            {sentimentEmojis[example.category as keyof typeof sentimentEmojis]}
                          </span>
                          <p className="example-text">{example.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'explanation' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="explanation-content"
                >
                  <h2 className="text-2xl font-semibold mb-4">How Naive Bayes Works</h2>
                  
                  <div className="space-y-6">
                    <motion.div variants={itemVariants} className="explanation-step">
                      <div className="step-number">1</div>
                      <div>
                        <h3 className="text-lg font-medium">Text Preprocessing</h3>
                        <p>The text is cleaned, tokenized into words, and converted to features.</p>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="explanation-step">
                      <div className="step-number">2</div>
                      <div>
                        <h3 className="text-lg font-medium">Feature Extraction</h3>
                        <p>Words are extracted as features and their frequencies are calculated.</p>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="explanation-step">
                      <div className="step-number">3</div>
                      <div>
                        <h3 className="text-lg font-medium">Probability Calculation</h3>
                        <p>Bayes' theorem calculates the probability of each sentiment class.</p>
                        <div className="formula">
                          P(class|text) = P(text|class) × P(class) / P(text)
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="explanation-step">
                      <div className="step-number">4</div>
                      <div>
                        <h3 className="text-lg font-medium">Classification</h3>
                        <p>The sentiment with the highest probability is selected as the prediction.</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            className="md:col-span-7 bg-white rounded-lg shadow-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: animationState.resultVisible && prediction ? 1 : 0, 
              x: animationState.resultVisible && prediction ? 0 : 50 
            }}
            transition={{ duration: 0.5 }}
          >
            {prediction && !prediction.error ? (
              <div className="p-6">
                <div className="mb-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="prediction-result"
                  >
                    <div className="sentiment-emoji">
                      {sentimentEmojis[prediction.prediction as keyof typeof sentimentEmojis]}
                    </div>
                    <h2 className="text-2xl font-bold mt-3 mb-1">
                      {prediction.prediction.charAt(0).toUpperCase() + prediction.prediction.slice(1)} Sentiment
                    </h2>
                    <p className="text-gray-600">
                      This text expresses a {prediction.prediction} sentiment with {(prediction.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </motion.div>
                  
                  <ConfidenceGauge 
                    sentiment={prediction.prediction} 
                    confidence={prediction.confidence}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <SentimentProbabilities probabilities={prediction.probabilities} />
                    {prediction.keywords && (
                      <FeatureHighlighter text={text} keywords={prediction.keywords} />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Word Frequency Analysis</h3>
                    <div className="word-cloud-container">
                      <WordCloud text={text} />
                    </div>
                    
                    <motion.div 
                      className="model-insights mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <h3 className="text-lg font-semibold mb-2">Model Insights</h3>
                      <p className="text-gray-700">
                        The Naive Bayes classifier identified this text as having a 
                        <span className={`font-medium ${
                          prediction.prediction === 'positive' ? 'text-green-600' : 
                          prediction.prediction === 'negative' ? 'text-red-600' : 'text-yellow-600'
                        }`}> {prediction.prediction} </span> 
                        sentiment based on the word usage patterns and statistical analysis.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full py-24">
                <div className="loading-container">
                  <div className="loading-emojis">
                    <div className="loading-emoji">😊</div>
                    <div className="loading-emoji">😐</div>
                    <div className="loading-emoji">😞</div>
                  </div>
                  <div className="mt-4 text-gray-600">Analyzing sentiment...</div>
                </div>
              </div>
            ) : prediction && prediction.error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-xl mb-4">Error</div>
                <p>{prediction.error}</p>
                <button 
                  onClick={() => handleSubmit(new Event('submit') as any)}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full py-24 px-6 text-center">
                <motion.div 
                  className="placeholder-illustration"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 5
                  }}
                >
                  <div className="placeholder-emojis">
                    <div className="placeholder-emoji">😊</div>
                    <div className="placeholder-emoji">😐</div>
                    <div className="placeholder-emoji">😞</div>
                  </div>
                </motion.div>
                <h3 className="text-xl text-gray-600 mt-6">Enter text and click 'Analyze Sentiment'</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Our Naive Bayes model will analyze the sentiment of your text and classify it as positive, negative, or neutral
                </p>
              </div>
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-12 bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: animationState.headerVisible ? 1 : 0, 
            y: animationState.headerVisible ? 0 : 20 
          }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Applications of Sentiment Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="application-card">
              <div className="application-icon">📱</div>
              <h3 className="text-xl font-medium mb-2">Social Media Monitoring</h3>
              <p>Track brand reputation and customer feedback by analyzing social media posts and comments in real-time.</p>
            </div>
            
            <div className="application-card">
              <div className="application-icon">📊</div>
              <h3 className="text-xl font-medium mb-2">Market Research</h3>
              <p>Understand consumer opinions and attitudes toward products, services, and brands through review analysis.</p>
            </div>
            
            <div className="application-card">
              <div className="application-icon">💬</div>
              <h3 className="text-xl font-medium mb-2">Customer Support</h3>
              <p>Prioritize and route customer inquiries based on sentiment, addressing negative feedback more urgently.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedNaiveBayesPage; 