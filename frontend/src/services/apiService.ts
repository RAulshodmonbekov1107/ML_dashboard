import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8000/api';

// Types
export interface PredictionResult {
  prediction: string | number;
  confidence?: number;
  error?: string;
  probabilities?: { [key: string]: number } | Array<{class?: string; label?: string; probability?: number; confidence?: number}>;
  metrics?: { [key: string]: string | number };
  
  // Additional properties used throughout the codebase
  predicted_values?: any[];
  predicted_price?: number;
  predicted_cost?: number;
  predicted_sales?: number;
  predicted_class?: string;
  class_probabilities?: Array<{class?: string; label?: string; probability?: number; confidence?: number}>;
  generated_text?: string;
  transcription?: string;
  
  // Translation specific properties
  original_text?: string;
  translated_text?: string;
  source_language?: string;
  target_language?: string;
  translation_method?: string;
}

export interface TrainingStatus {
  status: 'idle' | 'uploading' | 'training' | 'completed' | 'failed' | 'error';
  progress: number;
  message?: string;
}

export interface TrainingResult {
  trainingId: string;
  status: TrainingStatus['status'];
  modelUrl?: string;
  error?: string;
}

export interface CustomModelData {
  modelId: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'training' | 'ready' | 'failed';
  classes: string[];
}

interface ModelInfo {
  id: string;
  name: string;
  description?: string;
}

interface ModelsResponse {
  models: ModelInfo[];
  error?: string;
}

// API service object
const apiService = {
  // Predict using model
  async predict(modelEndpoint: string, imageFile: File): Promise<PredictionResult> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await axios.post(`${API_BASE_URL}/predict/${modelEndpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in prediction:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        return { 
          prediction: "",
          error: error.response.data.error || 'An error occurred during prediction' 
        };
      }
      return { 
        prediction: "", 
        error: 'Failed to make prediction' 
      };
    }
  },
  
  // Start model training with custom data
  async startTraining(
    modelEndpoint: string,
    className: string,
    images: File[],
    labels?: File,
    onProgress?: (progress: number) => void
  ): Promise<TrainingResult> {
    try {
      // In a real app, we would upload files to a backend
      // For this demo, we'll simulate training with TensorFlow.js
      
      console.log(`Starting training for class: ${className} with ${images.length} images`);
      
      // Simulate uploading progress
      if (onProgress) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          onProgress(progress);
          if (progress >= 100) clearInterval(interval);
        }, 200);
      }
      
      // Return a simulated training ID
      const trainingId = `train_${Date.now()}`;
      
      return { 
        trainingId,
        status: 'uploading',
      };
    } catch (error) {
      console.error('Error starting training:', error);
      return {
        trainingId: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start training'
      };
    }
  },
  
  // Get training status
  async getTrainingStatus(trainingId: string): Promise<TrainingStatus> {
    try {
      // In a real app, we would query the backend for training status
      // For this demo, we'll simulate a training process
      
      // Extract timestamp from training ID to simulate progress
      const timestamp = parseInt(trainingId.split('_')[1] || '0');
      const elapsed = Date.now() - timestamp;
      const trainingDuration = 10000; // 10 seconds for demo purposes
      
      if (elapsed < trainingDuration) {
        // Still training
        const progress = Math.min(99, Math.floor((elapsed / trainingDuration) * 100));
        return {
          status: 'training',
          progress,
          message: `Training in progress (${progress}%)...`
        };
      } else {
        // Training completed
        return {
          status: 'completed',
          progress: 100,
          message: 'Training completed successfully!'
        };
      }
    } catch (error) {
      console.error('Error getting training status:', error);
      return {
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to get training status'
      };
    }
  },
  
  // List custom trained models
  async getCustomModels(): Promise<CustomModelData[]> {
    try {
      // In a real app, we would fetch from a backend API
      // For this demo, we'll return some mock data
      
      return [
        {
          modelId: 'custom_obj_detection_1',
          name: 'My Custom Object Detector',
          description: 'Trained on custom images',
          createdAt: new Date().toISOString(),
          status: 'ready',
          classes: ['custom_object']
        }
      ];
    } catch (error) {
      console.error('Error fetching custom models:', error);
      return [];
    }
  },
  
  // List available models
  async listModels(): Promise<ModelsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/models`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving models:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        return { 
          models: [],
          error: error.response.data.error || 'An error occurred while listing models' 
        };
      }
      return { models: [], error: 'Failed to list models' };
    }
  },

  makePrediction: async <T = PredictionResult>(modelEndpoint: string, formData: Record<string, any>): Promise<T> => {
    try {
      console.log(`Making prediction with ${modelEndpoint} model:`, formData);

      // For classification model with CSV data
      if (modelEndpoint === 'classification' && formData.csv_data) {
        console.log('Processing CSV data for classification');

        // Log CSV structure for debugging
        const { headers, data } = formData.csv_data;
        console.log('CSV Headers:', headers);
        console.log('Sample data:', data.slice(0, 2));
        
        // Mock implementation for CSV classification
        const result = {
          prediction: Math.random() > 0.5 ? 'spam' : 'not spam',
          confidence: 0.7 + Math.random() * 0.25,
          probabilities: {
            'spam': Math.random() * 0.45 + 0.55,
            'not spam': Math.random() * 0.45
          }
        };

        console.log('Returning mock classification result for CSV:', result);
        return result as T;
      }
      
      // Handle KNN movie recommendations
      if (modelEndpoint === 'knn') {
        console.log('Using mock data for KNN movie recommendations');
        
        // Generate movie recommendations based on user preferences
        const action = formData.action || 5;
        const comedy = formData.comedy || 5;
        const drama = formData.drama || 5;
        const scifi = formData.scifi || 5;
        
        // Sample movie data with genre scores
        const movieDatabase = [
          { id: 1, title: "The Action Hero", genres: {action: 9, comedy: 2, drama: 4, scifi: 3}, rating: 7.8 },
          { id: 2, title: "Laugh Out Loud", genres: {action: 1, comedy: 9, drama: 2, scifi: 1}, rating: 8.1 },
          { id: 3, title: "Deep Emotions", genres: {action: 2, comedy: 3, drama: 9, scifi: 1}, rating: 8.4 },
          { id: 4, title: "Space Odyssey", genres: {action: 5, comedy: 1, drama: 4, scifi: 9}, rating: 8.9 },
          { id: 5, title: "Funny Action", genres: {action: 7, comedy: 8, drama: 2, scifi: 1}, rating: 7.2 },
          { id: 6, title: "Dramatic Space", genres: {action: 3, comedy: 1, drama: 8, scifi: 7}, rating: 8.5 },
          { id: 7, title: "Comedy Drama", genres: {action: 1, comedy: 7, drama: 8, scifi: 2}, rating: 7.9 },
          { id: 8, title: "Sci-Fi Action", genres: {action: 8, comedy: 2, drama: 3, scifi: 8}, rating: 8.3 },
          { id: 9, title: "Laugh in Space", genres: {action: 3, comedy: 8, drama: 2, scifi: 7}, rating: 7.6 },
          { id: 10, title: "Emotional Journey", genres: {action: 2, comedy: 3, drama: 9, scifi: 4}, rating: 8.7 }
        ];
        
        // Calculate similarity scores using a simplified Euclidean distance
        const similarities = movieDatabase.map(movie => {
          const distance = Math.sqrt(
            Math.pow(action - movie.genres.action, 2) +
            Math.pow(comedy - movie.genres.comedy, 2) +
            Math.pow(drama - movie.genres.drama, 2) +
            Math.pow(scifi - movie.genres.scifi, 2)
          );
          
          // Convert distance to similarity (smaller distance = greater similarity)
          return { ...movie, similarity: 1 / (1 + distance) };
        });
        
        // Sort by similarity (descending)
        similarities.sort((a, b) => b.similarity - a.similarity);
        
        // Take top 5 recommendations
        const recommendations = similarities.slice(0, 5);
        
        // Calculate genre affinities based on user preferences
        const genreMax = 10; // Maximum genre rating
        const genreAffinities = {
          action: action / genreMax,
          comedy: comedy / genreMax,
          drama: drama / genreMax,
          scifi: scifi / genreMax
        };
        
        const result = {
          prediction: "recommendations_generated",
          recommended_movies: recommendations.map(movie => ({
            title: movie.title,
            similarity: Math.round(movie.similarity * 100) / 100,
            rating: movie.rating
          })),
          genre_affinities: genreAffinities,
          confidence: 0.85
        };
        
        return result as T;
      }

      // Handle Logistic Regression for fraud detection
      if (modelEndpoint === 'logistic-regression') {
        console.log('Using mock data for Logistic Regression fraud detection');
        
        // Extract transaction details from form data
        const transactionAmount = formData.transactionAmount || 0;
        const merchantCategory = formData.merchantCategory || 'retail';
        const timeSincePrevTransaction = formData.timeSincePrevTransaction || 24;
        const distanceFromHome = formData.distanceFromHome || 5;
        const foreignTransaction = formData.foreignTransaction || false;
        const frequentMerchant = formData.frequentMerchant || true;
        
        // Calculate fraud risk score (0-1)
        let riskScore = 0;
        
        // High transaction amount increases risk
        if (transactionAmount > 1500) riskScore += 0.25;
        else if (transactionAmount > 1000) riskScore += 0.15;
        else if (transactionAmount > 500) riskScore += 0.05;
        
        // Merchant category affects risk
        if (merchantCategory === 'online') riskScore += 0.15;
        else if (merchantCategory === 'gaming') riskScore += 0.10;
        else if (merchantCategory === 'travel') riskScore += 0.05;
        
        // Short time since previous transaction is suspicious
        if (timeSincePrevTransaction < 0.5) riskScore += 0.2;
        else if (timeSincePrevTransaction < 1) riskScore += 0.15;
        else if (timeSincePrevTransaction < 3) riskScore += 0.05;
        
        // Distance from home increases risk
        if (distanceFromHome > 100) riskScore += 0.2;
        else if (distanceFromHome > 50) riskScore += 0.1;
        else if (distanceFromHome > 20) riskScore += 0.05;
        
        // Foreign transactions are higher risk
        if (foreignTransaction) riskScore += 0.2;
        
        // Non-frequent merchants are higher risk
        if (!frequentMerchant) riskScore += 0.15;
        
        // Add some randomness to make it interesting
        riskScore += (Math.random() * 0.1) - 0.05;
        
        // Clamp the risk score between 0 and 1
        riskScore = Math.max(0, Math.min(1, riskScore));
        
        // Determine if it's fraud based on threshold
        const isFraud = riskScore > 0.5;
        
        // Calculate class probabilities
        const fraudProb = riskScore;
        const legitProb = 1 - riskScore;
        
        const result = {
          prediction: isFraud ? 'fraud' : 'legitimate',
          confidence: isFraud ? fraudProb : legitProb,
          probabilities: {
            'fraud': fraudProb,
            'legitimate': legitProb
          }
        };
        
        return result as T;
      }

      // Handle Random Forest model mock data if needed
      if (modelEndpoint === 'random-forest') {
        console.log('Using mock data for Random Forest model');
        
        // Mock scoring algorithm for customer value
        const age = formData.age || 0;
        const income = formData.income || 0;
        const purchases = formData.previous_purchases || 0;
        const basket = formData.average_basket_value || 0;
        const days = formData.days_since_last_purchase || 0;
        
        // Score based on various factors (higher is better)
        let score = 0;
        
        // Age factor (25-45 is prime shopping demographic)
        if (age >= 25 && age <= 45) score += 1;
        else if (age > 45 && age <= 65) score += 0.7;
        else score += 0.3;
        
        // Income factor
        if (income > 80000) score += 1.5;
        else if (income > 50000) score += 1;
        else score += 0.5;
        
        // Purchase history
        if (purchases > 20) score += 1.5;
        else if (purchases > 10) score += 1;
        else score += 0.5;
        
        // Basket value
        if (basket > 200) score += 1.5;
        else if (basket > 100) score += 1;
        else score += 0.5;
        
        // Recency (lower days is better)
        if (days < 7) score += 1.5;
        else if (days < 14) score += 1;
        else score += 0.5;
        
        // Total possible score: 7.5
        const normalizedScore = score / 7.5;
        
        // Determine customer segment based on score
        let segment: string;
        if (normalizedScore > 0.8) {
          segment = 'high_value';
        } else if (normalizedScore > 0.6) {
          segment = 'loyal';
        } else if (normalizedScore > 0.4) {
          segment = 'occasional';
        } else if (normalizedScore > 0.2) {
          segment = 'at_risk';
        } else {
          segment = 'lost';
        }
        
        const result = {
          prediction: segment,
          confidence: normalizedScore,
          probabilities: {
            high_value: Math.random() * 0.2 + (segment === 'high_value' ? 0.8 : 0),
            loyal: Math.random() * 0.2 + (segment === 'loyal' ? 0.8 : 0.1),
            occasional: Math.random() * 0.3 + (segment === 'occasional' ? 0.7 : 0.1),
            at_risk: Math.random() * 0.3 + (segment === 'at_risk' ? 0.7 : 0.1),
            lost: Math.random() * 0.2 + (segment === 'lost' ? 0.8 : 0)
          },
          customer_score: Math.round(normalizedScore * 100)
        };

        return result as T;
      }

      // Handle Text Classification for spam
      if (modelEndpoint === 'classification' && formData.text) {
        const text = formData.text.toLowerCase();
        
        // Simple spam detection heuristics
        const spamWords = ['free', 'win', 'discount', 'offer', 'limited', 'urgent', 'money', 'cash', 'prize', 'click', 'now', 'viagra', 'enlargement', 'congratulations', 'claim', 'winner'];
        
        // Calculate how many spam words are in the text
        let spamWordCount = 0;
        spamWords.forEach(word => {
          if (text.includes(word)) spamWordCount++;
        });
        
        // Calculate spam probability based on spam word count
        const spamProbability = Math.min(0.95, spamWordCount / spamWords.length * 2);
        
        // Determine if it's spam based on probability
        const isSpam = spamProbability > 0.5;
        
        const result = {
          prediction: isSpam ? 'spam' : 'not spam',
          confidence: isSpam ? spamProbability : 1 - spamProbability,
          probabilities: {
            'spam': spamProbability,
            'not spam': 1 - spamProbability
          }
        };
        
        return result as T;
      }

      // Handle Naive Bayes sentiment analysis
      if (modelEndpoint === 'naive-bayes' && formData.text) {
        const text = formData.text.toLowerCase();
        
        // Simple sentiment analysis 
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'outstanding', 'superb', 'perfect', 'happy', 'love', 'best', 'awesome', 'incredible', 'impressive', 'exceptional', 'enjoy', 'enjoyed', 'pleased', 'recommend'];
        
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst', 'hate', 'dislike', 'disappointed', 'negative', 'fail', 'failure', 'problem', 'complaint', 'sucks', 'horrible', 'rubbish', 'waste', 'frustrating'];
        
        const neutralWords = ['okay', 'ok', 'average', 'neutral', 'fine', 'average', 'mediocre', 'ordinary', 'standard', 'acceptable', 'decent', 'fair', 'usual', 'common', 'regular', 'normal', 'moderate', 'alright', 'so-so'];
        
        // Count sentiment word occurrences
        let positiveScore = 0;
        let negativeScore = 0;
        let neutralScore = 0;
        
        const words = text.split(/\s+/);
        
        words.forEach((word: string) => {
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
          if (positiveWords.includes(cleanWord)) positiveScore++;
          if (negativeWords.includes(cleanWord)) negativeScore++;
          if (neutralWords.includes(cleanWord)) neutralScore++;
        });
        
        // Extract keywords to highlight
        const extractedKeywords: {
          positive: string[];
          negative: string[];
          neutral: string[];
        } = {
          positive: [],
          negative: [],
          neutral: []
        };
        
        words.forEach((word: string) => {
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
          if (positiveWords.includes(cleanWord) && !extractedKeywords.positive.includes(cleanWord)) {
            extractedKeywords.positive.push(cleanWord);
          }
          if (negativeWords.includes(cleanWord) && !extractedKeywords.negative.includes(cleanWord)) {
            extractedKeywords.negative.push(cleanWord);
          }
          if (neutralWords.includes(cleanWord) && !extractedKeywords.neutral.includes(cleanWord)) {
            extractedKeywords.neutral.push(cleanWord);
          }
        });
        
        // Add intensity boosters/reducers
        const boosters = ['very', 'really', 'extremely', 'absolutely', 'incredibly', 'truly', 'especially'];
        const reducers = ['somewhat', 'slightly', 'kind of', 'sort of', 'a bit', 'a little'];
        
        // Check for boosters and reducers
        words.forEach((word: string, index: number) => {
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
          
          if (boosters.includes(cleanWord)) {
            // Check next word for sentiment
            if (index < words.length - 1) {
              const nextWord = words[index + 1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
              if (positiveWords.includes(nextWord)) positiveScore += 0.5;
              if (negativeWords.includes(nextWord)) negativeScore += 0.5;
            }
          }
          
          if (reducers.includes(cleanWord)) {
            // Check next word for sentiment
            if (index < words.length - 1) {
              const nextWord = words[index + 1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
              if (positiveWords.includes(nextWord)) positiveScore -= 0.25;
              if (negativeWords.includes(nextWord)) negativeScore -= 0.25;
            }
          }
        });
        
        // Check for negations
        const negations = ['not', 'no', "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't", "won't", "wouldn't", "can't", "couldn't", "shouldn't"];
        
        words.forEach((word: string, index: number) => {
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
          
          if (negations.includes(cleanWord)) {
            // Check next word for sentiment (negation flips sentiment)
            if (index < words.length - 1) {
              const nextWord = words[index + 1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
              if (positiveWords.includes(nextWord)) {
                positiveScore -= 1;
                negativeScore += 1;
              }
              if (negativeWords.includes(nextWord)) {
                negativeScore -= 1;
                positiveScore += 1;
              }
            }
          }
        });
        
        // Ensure scores are not negative
        positiveScore = Math.max(0, positiveScore);
        negativeScore = Math.max(0, negativeScore);
        neutralScore = Math.max(0, neutralScore);
        
        // Calculate total score
        const totalScore = positiveScore + negativeScore + neutralScore;
        
        // Calculate probabilities
        let positiveProbability = totalScore > 0 ? positiveScore / totalScore : 0.33;
        let negativeProbability = totalScore > 0 ? negativeScore / totalScore : 0.33;
        let neutralProbability = totalScore > 0 ? neutralScore / totalScore : 0.34;
        
        // Add some randomness to make it more interesting
        const randomFactor = 0.1;
        positiveProbability += (Math.random() * randomFactor * 2) - randomFactor;
        negativeProbability += (Math.random() * randomFactor * 2) - randomFactor;
        neutralProbability += (Math.random() * randomFactor * 2) - randomFactor;
        
        // Normalize probabilities
        const sumProbabilities = positiveProbability + negativeProbability + neutralProbability;
        positiveProbability /= sumProbabilities;
        negativeProbability /= sumProbabilities;
        neutralProbability /= sumProbabilities;
        
        // Determine the sentiment
        let sentiment = 'neutral';
        let confidence = neutralProbability;
        
        if (positiveProbability > negativeProbability && positiveProbability > neutralProbability) {
          sentiment = 'positive';
          confidence = positiveProbability;
        } else if (negativeProbability > positiveProbability && negativeProbability > neutralProbability) {
          sentiment = 'negative';
          confidence = negativeProbability;
        }
        
        const result = {
          prediction: sentiment,
          confidence: confidence,
          probabilities: {
            positive: positiveProbability,
            negative: negativeProbability,
            neutral: neutralProbability
          },
          keywords: extractedKeywords
        };
        
        return result as T;
      }

      // Handle Decision Tree loan approval
      if (modelEndpoint === 'decision-tree') {
        const { income, credit_score, debt_to_income, loan_term, loan_amount } = formData;
        
        // Decision rules for loan approval
        const hasSufficientCreditScore = credit_score >= 680;
        const hasAcceptableDTI = debt_to_income <= 43;
        const hasReasonableLoanAmount = (loan_amount / income) <= 5;
        
        let isApproved = false;
        let confidence = 0.7; // Base confidence
        
        if (hasSufficientCreditScore) {
          confidence += 0.1;
          if (hasAcceptableDTI) {
            confidence += 0.1;
            if (hasReasonableLoanAmount) {
              isApproved = true;
              confidence += 0.1;
            } else {
              // Good credit and DTI but loan amount too high
              confidence -= 0.1;
            }
          } else {
            // Good credit but DTI too high
            confidence -= 0.2;
          }
        } else if (hasAcceptableDTI && hasReasonableLoanAmount && credit_score >= 640) {
          // Borderline case - approve with lower confidence
          isApproved = true;
          confidence -= 0.1;
        }
        
        // Add some randomness to make it interesting
        confidence += (Math.random() * 0.05) - 0.025;
        confidence = Math.min(0.99, Math.max(0.6, confidence));
        
        // Calculate monthly payment
        const annualRate = credit_score >= 740 ? 0.0375 : 
                          credit_score >= 700 ? 0.0425 : 
                          credit_score >= 660 ? 0.0475 : 0.055;
        const monthlyRate = annualRate / 12;
        const totalPayments = loan_term * 12;
        const monthlyPayment = (loan_amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
        
        // Calculate new DTI after loan
        const monthlyIncome = income / 12;
        const currentDebt = (debt_to_income / 100) * monthlyIncome;
        const newDTI = ((currentDebt + monthlyPayment) / monthlyIncome) * 100;
        
        // Create decision path for visualization
        const decisionPath = {
          nodes: [
            {
              question: "Credit Score Check",
              answer: hasSufficientCreditScore
            },
            {
              question: "Debt-to-Income Ratio Check",
              answer: hasAcceptableDTI
            },
            {
              question: "Loan-to-Income Ratio Check",
              answer: hasReasonableLoanAmount
            },
            {
              question: "Final Decision",
              answer: isApproved ? "Loan Approved" : "Loan Rejected"
            }
          ]
        };
        
        const result = {
          prediction: isApproved ? "Approved" : "Rejected",
          loan_approved: isApproved,
          confidence: confidence,
          metrics: {
            debt_to_income_ratio: newDTI,
            loan_to_income_ratio: loan_amount / income,
            monthly_payment: monthlyPayment,
            interest_rate: annualRate * 100
          },
          decision_path: decisionPath
        };
        
        return result as T;
      }
      
      // Handle Multiple Linear Regression medical cost prediction
      if (modelEndpoint === 'multiple-linear-regression') {
        const { age, bmi, smoker } = formData;
        
        // Simple calculation based on the formula for medical cost prediction
        // Medical Cost = (Age × 100) + (BMI × 200) + (Smoker × 5000) + 2000
        const baseCost = 2000;
        const ageCost = age * 100;
        const bmiCost = bmi * 200;
        const smokerCost = smoker * 5000;
        
        const predictedCost = baseCost + ageCost + bmiCost + smokerCost;
        
        // Add a minor random variation to make predictions more interesting
        const variation = (Math.random() * 0.1 - 0.05) * predictedCost;
        const finalCost = Math.round((predictedCost + variation) * 100) / 100;
        
        // Generate explanation text
        let explanation = `The predicted medical cost for a ${age} year old with BMI ${bmi.toFixed(1)}`;
        explanation += smoker ? ' who smokes' : ' who does not smoke';
        explanation += ` is $${finalCost.toLocaleString()}`;
        
        // Calculate R² score (mock value for demonstration)
        const r2Score = 0.82 + (Math.random() * 0.04 - 0.02);
        
        const result = {
          prediction: finalCost,
          explanation: explanation,
          r2_score: r2Score
        };
        
        return result as T;
      }
      
      // Handle General Regression stock price prediction
      if (modelEndpoint === 'general-regression') {
        const { prev_price, volume, market_index } = formData;
        
        // Calculate price change using the formula from the backend
        // price_change = (0.05 * prev_price) + (volume / 1000000) + (market_index / 10000) - 0.5
        const price_change_percent = (0.05 * prev_price) + (volume / 1000000) + (market_index / 10000) - 0.5;
        
        // Calculate predicted price
        // predicted_price = prev_price * (1 + price_change / 100)
        const predicted_price = prev_price * (1 + price_change_percent / 100);
        
        // Add a minor random variation to make predictions more interesting
        const variation = (Math.random() * 0.5 - 0.25);
        const final_price = Math.round((predicted_price + variation) * 100) / 100;
        
        // Generate explanation text
        const explanation = `The predicted stock price based on previous price $${prev_price}, ` +
                           `volume ${volume.toLocaleString()}, and market index ${market_index.toLocaleString()} ` +
                           `is $${final_price.toLocaleString()}`;
        
        // Calculate confidence (mock value for demonstration)
        const confidence = 0.78 + (Math.random() * 0.04 - 0.02);
        
        const result = {
          prediction: final_price,
          explanation: explanation,
          confidence: confidence
        };
        
        return result as T;
      }

      // Handle Linear Regression house price prediction
      if (modelEndpoint === 'linear-regression') {
        console.log('Using mock data for Linear Regression house price prediction');
        
        // Simple model: price = base_price + (sqft * price_per_sqft)
        const base_price = 50000;
        const price_per_sqft = 100; // $100 per square foot
        const sqft = formData.sqft || 1500;
        
        // Add some randomness to make predictions interesting (+/- 5%)
        const randomFactor = 1 + ((Math.random() * 10) - 5) / 100;
        
        // Calculate price
        const predictedPrice = Math.round((base_price + (sqft * price_per_sqft)) * randomFactor);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          prediction: predictedPrice,
          explanation: `Based on a base price of $${base_price} and a rate of $${price_per_sqft} per square foot, a ${sqft} sq ft house is estimated to cost $${predictedPrice.toLocaleString()}.`,
          confidence: 0.87
        } as T;
      }

      // Make the actual API call for other cases
      const response = await axios.post(
        `${API_BASE_URL}/predict/${modelEndpoint}`,
        formData
      );
      
      return response.data;
    } catch (error) {
      console.error('Error in makePrediction:', error);
      
      // Provide detailed error information
      let errorMessage = 'Failed to make prediction';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with an error status
          console.error('Response error data:', error.response.data);
          console.error('Response status:', error.response.status);
          
          errorMessage = error.response.data.error || 
                        `Server error: ${error.response.status}`;
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          errorMessage = 'No response from server';
        } else {
          // Something happened in setting up the request
          console.error('Request setup error:', error.message);
          errorMessage = `Request error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return { 
        prediction: '',
        error: errorMessage
      } as T;
    }
  }
};

export default apiService; 