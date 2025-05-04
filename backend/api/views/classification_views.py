import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from .base_view import BaseModelView
from api.model_loader import ModelLoader
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class ClassificationView(APIView):
    """Classification model view for email spam detection"""
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get(self, request):
        """Return model info and example inputs"""
        return Response({
            "model": "Classification (Spam Detection)",
            "use_case": "Email Spam Detection",
            "input_example": {
                "text": "FREE OFFER! Limited time only. Click now to claim your prize!"
            },
            "description": "Classifies emails as spam or not spam based on text content.",
            "csv_support": True,
            "csv_format": {
                "headers": ["text"],
                "example_row": ["Email content to classify"]
            }
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Handle prediction requests for spam classification"""
        data = request.data
        
        # Check if CSV data is provided
        if 'headers' in data and 'rows' in data:
            return self._handle_csv_prediction(data)
        
        # Check if CSV file is provided
        elif 'csv' in request.FILES:
            return self._handle_csv_file_prediction(request.FILES['csv'])
        
        # Handle single text prediction
        else:
            try:
                # Get text input
                text = data.get('text', '')
                
                if not text:
                    return Response({
                        "error": "Please provide text to classify"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Run prediction (mock for demo)
                is_spam, confidence, features = self._classify_text(text)
                
                # Return result
                return Response({
                    "predicted_class": "spam" if is_spam else "not spam",
                    "confidence": confidence,
                    "class_probabilities": [
                        {"class": "spam", "probability": confidence if is_spam else 1 - confidence},
                        {"class": "not spam", "probability": 1 - confidence if is_spam else confidence}
                    ],
                    "features_detected": features
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_csv_prediction(self, data):
        """Handle CSV data provided directly in the request"""
        try:
            headers = data.get('headers', [])
            rows = data.get('rows', [])
            
            if not rows or not isinstance(rows, list):
                return Response({
                    "error": "Invalid CSV data format. Expected a list of rows."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract text column index
            text_idx = 0  # Assume first column is text if not specified
            if 'text' in headers:
                text_idx = headers.index('text')
            
            # Process each row
            results = []
            for i, row in enumerate(rows):
                if len(row) <= text_idx:
                    return Response({
                        "error": f"Row {i+1} does not have enough columns"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                text = row[text_idx]
                is_spam, confidence, _ = self._classify_text(text)
                results.append({
                    "text": text[:50] + "..." if len(text) > 50 else text,
                    "predicted_class": "spam" if is_spam else "not spam",
                    "confidence": confidence
                })
            
            # Return results
            return Response({
                "predictions": results,
                "rows_processed": len(rows),
                "model": "Spam Detection"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error processing CSV data: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_csv_file_prediction(self, csv_file):
        """Handle CSV file upload"""
        try:
            # Read CSV file
            df = pd.read_csv(csv_file)
            
            # Verify text column exists
            if 'text' not in df.columns:
                # Use the first column if 'text' is not present
                text_column = df.columns[0]
            else:
                text_column = 'text'
            
            # Process each row
            results = []
            for i, row in df.iterrows():
                text = str(row[text_column])
                is_spam, confidence, _ = self._classify_text(text)
                results.append({
                    "text": text[:50] + "..." if len(text) > 50 else text,
                    "predicted_class": "spam" if is_spam else "not spam",
                    "confidence": confidence
                })
            
            # Return results
            return Response({
                "predictions": results,
                "rows_processed": len(df),
                "model": "Spam Detection"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error processing CSV file: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _classify_text(self, text):
        """Classify text as spam or not spam (mock implementation for demo)"""
        # Simple keyword-based classification for demo
        spam_keywords = ['free', 'offer', 'limited', 'urgent', 'prize', 'winner', 'click', 
                         'cash', 'credit', 'guarantee', 'exclusive', 'restricted', 'clearance']
        
        # Count spam keywords in the text
        text_lower = text.lower()
        matched_keywords = [kw for kw in spam_keywords if kw in text_lower]
        keyword_count = len(matched_keywords)
        
        # Basic rules for demo classification
        has_exclamation = '!' in text
        all_caps_words = sum(1 for word in text.split() if word.isupper() and len(word) > 2)
        
        # Calculate spam probability based on features
        features = {
            "spam_keywords": keyword_count,
            "exclamation_marks": text.count('!'),
            "all_caps_words": all_caps_words,
            "text_length": len(text)
        }
        
        # Demo classification logic
        if keyword_count >= 3 or (keyword_count >= 2 and has_exclamation) or all_caps_words >= 5:
            is_spam = True
            confidence = min(0.9, 0.6 + (keyword_count * 0.1) + (all_caps_words * 0.05))
        else:
            is_spam = False
            confidence = min(0.9, 0.6 + ((len(spam_keywords) - keyword_count) * 0.015))
        
        return is_spam, round(confidence, 2), features

class KNNView(BaseModelView):
    """K-Nearest Neighbors model view for movie recommendations"""
    model_name = "knn_movie_recommendations"
    
    def get(self, request, *args, **kwargs):
        """Return model info and example inputs"""
        return Response({
            "model": "K-Nearest Neighbors",
            "use_case": "Movie Recommendations",
            "input_example": {
                "action_score": 0.7,
                "comedy_score": 0.3,
                "drama_score": 0.5,
                "scifi_score": 0.8
            },
            "description": "Recommends movies based on genre preferences using K-Nearest Neighbors."
        })
    
    def process_input(self, data):
        """Process input data for KNN"""
        action_score = float(data.get('action_score', 0))
        comedy_score = float(data.get('comedy_score', 0))
        drama_score = float(data.get('drama_score', 0))
        scifi_score = float(data.get('scifi_score', 0))
        return np.array([[action_score, comedy_score, drama_score, scifi_score]])
    
    def process_output(self, prediction):
        """Process KNN output"""
        movie_category = int(prediction[0])
        categories = ["Action", "Comedy", "Drama", "Sci-Fi", "Mixed"]
        
        return {
            "recommended_category": categories[movie_category],
            "confidence": 0.85
        }
    
    def train_model(self):
        """Train a new KNN model for movie recommendations"""
        # Sample training data for movie categories
        X = np.array([
            [0.8, 0.2, 0.3, 0.4],  # Action
            [0.3, 0.9, 0.2, 0.1],  # Comedy
            [0.2, 0.3, 0.9, 0.1],  # Drama
            [0.4, 0.2, 0.1, 0.9],  # Sci-Fi
            [0.5, 0.5, 0.5, 0.5],  # Mixed
        ])
        y = np.array([0, 1, 2, 3, 4])  # Movie categories
        
        # Train model
        model = KNeighborsClassifier(n_neighbors=1)
        model.fit(X, y)
        
        # Save model
        ModelLoader.save_sklearn_model(model, self.model_name)
        return model

class LogisticRegressionView(BaseModelView):
    """Logistic Regression model view for credit card fraud detection"""
    model_name = "logistic_regression_fraud"
    
    def get(self, request, *args, **kwargs):
        """Return model info and example inputs"""
        return Response({
            "model": "Logistic Regression",
            "use_case": "Credit Card Fraud Detection",
            "input_example": {
                "transaction_amount": 1250.0,
                "unusual_location": 1,
                "time_since_last_transaction": 2.5,
                "frequency_last_day": 5
            },
            "description": "Detects potentially fraudulent credit card transactions."
        })
    
    def process_input(self, data):
        """Process input data for logistic regression"""
        transaction_amount = float(data.get('transaction_amount', 0))
        unusual_location = int(data.get('unusual_location', 0))
        time_since_last = float(data.get('time_since_last_transaction', 0))
        frequency = int(data.get('frequency_last_day', 0))
        return np.array([[transaction_amount, unusual_location, time_since_last, frequency]])
    
    def process_output(self, prediction):
        """Process logistic regression output"""
        is_fraud = bool(prediction[0])
        prob = 0.92 if is_fraud else 0.89
        return {
            "is_fraudulent": is_fraud,
            "confidence": prob
        }
    
    def train_model(self):
        """Train a new logistic regression model for fraud detection"""
        # Sample training data for fraud detection
        X = np.array([
            [150, 0, 24, 2],    # Not fraud
            [2500, 1, 0.5, 10],  # Fraud
            [85, 0, 12, 1],     # Not fraud
            [3000, 1, 0.2, 8],   # Fraud
            [250, 0, 6, 3],     # Not fraud
            [1800, 1, 0.1, 15],  # Fraud
        ])
        y = np.array([0, 1, 0, 1, 0, 1])  # 0 = not fraud, 1 = fraud
        
        # Train model
        model = LogisticRegression()
        model.fit(X, y)
        
        # Save model
        ModelLoader.save_sklearn_model(model, self.model_name)
        return model

class NaiveBayesView(APIView):
    """Naive Bayes model view for sentiment analysis"""
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get(self, request):
        """Return model info and example inputs"""
        return Response({
            "model": "Naive Bayes",
            "use_case": "Sentiment Analysis",
            "input_example": {
                "text": "I really enjoyed the movie. The acting was superb and the story was compelling."
            },
            "description": "Analyzes text to determine sentiment (positive, negative, or neutral).",
            "csv_support": True,
            "csv_format": {
                "headers": ["text"],
                "example_row": ["Text to analyze sentiment"]
            }
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Handle prediction requests for sentiment analysis"""
        data = request.data
        
        # Check if CSV data is provided
        if 'headers' in data and 'rows' in data:
            return self._handle_csv_prediction(data)
        
        # Check if CSV file is provided
        elif 'csv' in request.FILES:
            return self._handle_csv_file_prediction(request.FILES['csv'])
        
        # Handle single text prediction
        else:
            try:
                # Get text input
                text = data.get('text', '')
                
                if not text:
                    return Response({
                        "error": "Please provide text for sentiment analysis"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Run prediction (mock for demo)
                sentiment, confidence, sentiment_scores = self._analyze_sentiment(text)
                
                # Return result
                return Response({
                    "predicted_class": sentiment,
                    "confidence": confidence,
                    "class_probabilities": [
                        {"class": "positive", "probability": sentiment_scores["positive"]},
                        {"class": "neutral", "probability": sentiment_scores["neutral"]},
                        {"class": "negative", "probability": sentiment_scores["negative"]}
                    ],
                    "text": text
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_csv_prediction(self, data):
        """Handle CSV data provided directly in the request"""
        try:
            headers = data.get('headers', [])
            rows = data.get('rows', [])
            
            if not rows or not isinstance(rows, list):
                return Response({
                    "error": "Invalid CSV data format. Expected a list of rows."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract text column index
            text_idx = 0  # Assume first column is text if not specified
            if 'text' in headers:
                text_idx = headers.index('text')
            
            # Process each row
            results = []
            for i, row in enumerate(rows):
                if len(row) <= text_idx:
                    return Response({
                        "error": f"Row {i+1} does not have enough columns"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                text = row[text_idx]
                sentiment, confidence, _ = self._analyze_sentiment(text)
                results.append({
                    "text": text[:50] + "..." if len(text) > 50 else text,
                    "predicted_class": sentiment,
                    "confidence": confidence
                })
            
            # Return results
            return Response({
                "predictions": results,
                "rows_processed": len(rows),
                "model": "Sentiment Analysis"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error processing CSV data: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_csv_file_prediction(self, csv_file):
        """Handle CSV file upload"""
        try:
            # Read CSV file
            df = pd.read_csv(csv_file)
            
            # Verify text column exists
            if 'text' not in df.columns:
                # Use the first column if 'text' is not present
                text_column = df.columns[0]
            else:
                text_column = 'text'
            
            # Process each row
            results = []
            for i, row in df.iterrows():
                text = str(row[text_column])
                sentiment, confidence, _ = self._analyze_sentiment(text)
                results.append({
                    "text": text[:50] + "..." if len(text) > 50 else text,
                    "predicted_class": sentiment,
                    "confidence": confidence
                })
            
            # Return results
            return Response({
                "predictions": results,
                "rows_processed": len(df),
                "model": "Sentiment Analysis"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"Error processing CSV file: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _analyze_sentiment(self, text):
        """Analyze sentiment of text (mock implementation for demo)"""
        # Simple keyword-based sentiment analysis for demo
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
                         'awesome', 'love', 'enjoy', 'happy', 'best', 'superb', 'brilliant',
                         'perfect', 'outstanding', 'impressive', 'recommend', 'positive']
        
        negative_words = ['bad', 'awful', 'terrible', 'horrible', 'poor', 'disappointing',
                         'dislike', 'hate', 'worst', 'sucks', 'failure', 'mediocre', 'negative',
                         'waste', 'regret', 'upset', 'frustrated', 'useless']
        
        # Count sentiment words in the text
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        # Calculate sentiment probabilities
        total_words = len(text_lower.split())
        positive_score = positive_count / max(total_words, 1) * 10
        negative_score = negative_count / max(total_words, 1) * 15  # Weighted more for negative
        
        # Normalize scores
        total_score = positive_score + negative_score + 0.5  # Add neutral weight
        positive_prob = positive_score / total_score
        negative_prob = negative_score / total_score
        neutral_prob = 1 - (positive_prob + negative_prob)
        
        # Determine sentiment class
        sentiment_scores = {
            "positive": round(positive_prob, 2),
            "neutral": round(neutral_prob, 2),
            "negative": round(negative_prob, 2)
        }
        
        if positive_prob > negative_prob and positive_prob > neutral_prob:
            sentiment = "positive"
            confidence = positive_prob
        elif negative_prob > positive_prob and negative_prob > neutral_prob:
            sentiment = "negative"
            confidence = negative_prob
        else:
            sentiment = "neutral"
            confidence = neutral_prob
        
        return sentiment, round(confidence, 2), sentiment_scores

class DecisionTreeView(BaseModelView):
    """Decision Tree model view for loan approval"""
    model_name = "decision_tree_loan"
    
    def get(self, request, *args, **kwargs):
        """Return model info and example inputs"""
        return Response({
            "model": "Decision Tree",
            "use_case": "Loan Approval System",
            "input_example": {
                "income": 60000,
                "credit_score": 720,
                "debt_to_income": 0.3,
                "loan_term": 15,
                "loan_amount": 250000
            },
            "description": "Determines loan approval based on financial attributes."
        })
    
    def process_input(self, data):
        """Process input data for decision tree"""
        income = float(data.get('income', 0))
        credit_score = float(data.get('credit_score', 0))
        debt_to_income = float(data.get('debt_to_income', 0))
        loan_term = float(data.get('loan_term', 0))
        loan_amount = float(data.get('loan_amount', 0))
        return np.array([[income, credit_score, debt_to_income, loan_term, loan_amount]])
    
    def process_output(self, prediction):
        """Process decision tree output"""
        is_approved = bool(prediction[0])
        return {
            "loan_approved": is_approved,
            "confidence": 0.90 if is_approved else 0.85
        }
    
    def train_model(self):
        """Train a new decision tree model for loan approval"""
        # Sample training data for loan approval
        X = np.array([
            [50000, 680, 0.4, 30, 200000],  # Not approved
            [80000, 750, 0.2, 15, 250000],  # Approved
            [40000, 600, 0.5, 30, 180000],  # Not approved
            [95000, 800, 0.1, 15, 300000],  # Approved
            [60000, 700, 0.3, 30, 220000],  # Approved
            [35000, 650, 0.6, 30, 250000],  # Not approved
        ])
        y = np.array([0, 1, 0, 1, 1, 0])  # 0 = not approved, 1 = approved
        
        # Train model
        model = DecisionTreeClassifier()
        model.fit(X, y)
        
        # Save model
        ModelLoader.save_sklearn_model(model, self.model_name)
        return model 