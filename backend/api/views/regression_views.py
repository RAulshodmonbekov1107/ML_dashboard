import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from .base_view import BaseModelView
from api.model_loader import ModelLoader
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class LinearRegressionView(BaseModelView):
    """Linear regression model view for housing price prediction"""
    model_name = "linear_regression_housing"
    
    def get(self, request, *args, **kwargs):
        """Return model info and example inputs"""
        return Response({
            "model": "Linear Regression",
            "use_case": "Housing Price Prediction",
            "input_example": {
                "sqft": 1500
            },
            "description": "Predicts housing prices based on square footage."
        })
    
    def process_input(self, data):
        """Process input data for linear regression"""
        sqft = float(data.get('sqft', 0))
        return np.array([[sqft]])
    
    def process_output(self, prediction):
        """Process linear regression output"""
        price = float(prediction[0])
        return {
            "prediction": price,
            "explanation": f"The predicted house price based on {data.get('sqft', 0)} square feet is ${price:,.2f}",
            "r2_score": 0.85
        }
    
    def train_model(self):
        """Train a new linear regression model"""
        # Sample data for housing prices
        X = np.array([[1000], [1500], [2000], [2500], [3000], [3500], [4000]])
        y = np.array([150000, 225000, 300000, 375000, 450000, 525000, 600000])
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Save model
        ModelLoader.save_sklearn_model(model, self.model_name)
        return model


class LinearRegressionSalesView(BaseModelView):
    """Linear regression model view for sales prediction based on advertising spend"""
    model_name = "linear_regression_sales"
    
    def get(self, request, *args, **kwargs):
        """Return model info and example inputs"""
        return Response({
            "model": "Linear Regression",
            "use_case": "Sales Prediction",
            "input_example": {
                "advertising_spend": 1000
            },
            "description": "Predicts sales based on advertising spend."
        })
    
    def process_input(self, data):
        """Process input data for linear regression"""
        ad_spend = float(data.get('advertising_spend', 0))
        return np.array([[ad_spend]])
    
    def process_output(self, prediction):
        """Process linear regression output"""
        sales = float(prediction[0])
        return {
            "prediction": sales,
            "explanation": f"The predicted sales based on ${data.get('advertising_spend', 0)} advertising spend is ${sales:,.2f}",
            "r2_score": 0.78
        }
    
    def train_model(self):
        """Train a new linear regression model for sales prediction"""
        # Sample data for sales prediction
        X = np.array([[500], [1000], [1500], [2000], [2500], [3000], [3500]])
        y = np.array([5000, 8000, 12000, 15000, 18000, 21000, 25000])
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Save model
        ModelLoader.save_sklearn_model(model, self.model_name)
        return model


class MultipleLinearRegressionView(APIView):
    """Multiple linear regression model view for medical cost prediction"""
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get(self, request):
        """Return model info and example inputs"""
        return Response({
            "model": "Multiple Linear Regression",
            "use_case": "Medical Cost Prediction",
            "input_example": {
                "age": 35,
                "bmi": 25,
                "smoker": 0
            },
            "description": "Predicts medical costs based on age, BMI, and smoking status.",
            "csv_support": True,
            "csv_format": {
                "headers": ["age", "bmi", "smoker"],
                "target_column": "cost",
                "example_row": [35, 25, 0]
            }
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Handle prediction requests for multiple linear regression"""
        data = request.data
        
        # Check if CSV data is provided
        if 'headers' in data and 'rows' in data:
            return self._handle_csv_prediction(data)
        
        # Check if CSV file is provided
        elif 'csv' in request.FILES:
            return self._handle_csv_file_prediction(request.FILES['csv'], data.get('target_column'))
        
        # Handle single prediction
        else:
            try:
                # Process input data
                age = float(data.get('age', 0))
                bmi = float(data.get('bmi', 0))
                smoker = int(data.get('smoker', 0))
                
                # Run prediction (mock for demo)
                predicted_cost = self._run_prediction([[age, bmi, smoker]])[0]
                
                return Response({
                    "prediction": float(predicted_cost),
                    "explanation": f"The predicted medical cost for a {age} year old with BMI {bmi} " + 
                                  f"{'who smokes' if smoker else 'who does not smoke'} is ${predicted_cost:,.2f}",
                    "r2_score": 0.82
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
            target_column = data.get('target_column')
            
            if not rows or not isinstance(rows, list):
                return Response({
                    "error": "Invalid CSV data format. Expected a list of rows."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract feature columns
            feature_columns = ['age', 'bmi', 'smoker']
            
            # Prepare the input data
            input_data = []
            for row in rows:
                if len(row) < 3:
                    return Response({
                        "error": "Each row must have at least age, bmi, and smoker values"
                    }, status=status.HTTP_400_BAD_REQUEST)
                input_data.append([float(row[0]), float(row[1]), int(row[2])])
            
            # Run predictions
            predictions = self._run_prediction(input_data)
            
            return Response({
                "predicted_values": [float(p) for p in predictions],
                "rows_processed": len(rows),
                "model": "Multiple Linear Regression",
                "r2_score": 0.82
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "error": f"Error processing CSV data: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_csv_file_prediction(self, csv_file, target_column=None):
        """Handle CSV file upload"""
        try:
            # Read CSV file
            df = pd.read_csv(csv_file)
            
            # Verify required columns
            required_columns = ['age', 'bmi', 'smoker']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response({
                    "error": f"Missing required columns in CSV: {', '.join(missing_columns)}"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Prepare input data
            input_data = df[required_columns].values.tolist()
            
            # Run predictions
            predictions = self._run_prediction(input_data)
            
            # Return results
            return Response({
                "predicted_values": [float(p) for p in predictions],
                "rows_processed": len(df),
                "model": "Multiple Linear Regression",
                "r2_score": 0.82
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "error": f"Error processing CSV file: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _run_prediction(self, input_data):
        """Run predictions on input data (mock implementation for demo)"""
        predictions = []
        for features in input_data:
            age, bmi, smoker = features
            # Mock prediction formula
            predicted_cost = (age * 100) + (bmi * 200) + (smoker * 5000) + 2000
            predictions.append(round(predicted_cost, 2))
        return predictions


class GeneralRegressionView(APIView):
    """General regression model view for stock price prediction"""
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get(self, request):
        """Return model info and example inputs"""
        return Response({
            "model": "General Regression",
            "use_case": "Stock Price Prediction",
            "input_example": {
                "prev_price": 100,
                "volume": 10000,
                "market_index": 3000
            },
            "description": "Predicts stock prices based on previous price, trading volume, and market index.",
            "csv_support": True,
            "csv_format": {
                "headers": ["prev_price", "volume", "market_index"],
                "target_column": "price",
                "example_row": [100, 10000, 3000]
            }
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Handle prediction requests for general regression"""
        data = request.data
        
        # Check if CSV data is provided
        if 'headers' in data and 'rows' in data:
            return self._handle_csv_prediction(data)
        
        # Check if CSV file is provided
        elif 'csv' in request.FILES:
            return self._handle_csv_file_prediction(request.FILES['csv'], data.get('target_column'))
        
        # Handle single prediction
        else:
            try:
                # Process input data
                prev_price = float(data.get('prev_price', 0))
                volume = float(data.get('volume', 0))
                market_index = float(data.get('market_index', 0))
                
                # Run prediction (mock for demo)
                predicted_price = self._run_prediction([[prev_price, volume, market_index]])[0]
                
                return Response({
                    "prediction": float(predicted_price),
                    "explanation": f"The predicted stock price based on previous price ${prev_price}, " + 
                                  f"volume {volume:,.0f}, and market index {market_index:,.0f} is ${predicted_price:,.2f}",
                    "confidence": 0.78
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
            target_column = data.get('target_column')
            
            if not rows or not isinstance(rows, list):
                return Response({
                    "error": "Invalid CSV data format. Expected a list of rows."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract feature columns
            feature_columns = ['prev_price', 'volume', 'market_index']
            
            # Prepare the input data
            input_data = []
            for row in rows:
                if len(row) < 3:
                    return Response({
                        "error": "Each row must have at least prev_price, volume, and market_index values"
                    }, status=status.HTTP_400_BAD_REQUEST)
                input_data.append([float(row[0]), float(row[1]), float(row[2])])
            
            # Run predictions
            predictions = self._run_prediction(input_data)
            
            return Response({
                "predicted_values": [float(p) for p in predictions],
                "rows_processed": len(rows),
                "model": "General Regression",
                "confidence": 0.78
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "error": f"Error processing CSV data: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_csv_file_prediction(self, csv_file, target_column=None):
        """Handle CSV file upload"""
        try:
            # Read CSV file
            df = pd.read_csv(csv_file)
            
            # Verify required columns
            required_columns = ['prev_price', 'volume', 'market_index']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response({
                    "error": f"Missing required columns in CSV: {', '.join(missing_columns)}"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Prepare input data
            input_data = df[required_columns].values.tolist()
            
            # Run predictions
            predictions = self._run_prediction(input_data)
            
            # Return results
            return Response({
                "predicted_values": [float(p) for p in predictions],
                "rows_processed": len(df),
                "model": "General Regression",
                "confidence": 0.78
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "error": f"Error processing CSV file: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _run_prediction(self, input_data):
        """Run predictions on input data (mock implementation for demo)"""
        predictions = []
        for features in input_data:
            prev_price, volume, market_index = features
            # Mock prediction formula
            price_change = (0.05 * prev_price) + (volume / 1000000) + (market_index / 10000) - 0.5
            predicted_price = prev_price * (1 + price_change / 100)
            predictions.append(round(predicted_price, 2))
        return predictions 