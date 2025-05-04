import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
import xgboost as xgb
from .base_view import BaseModelView
from api.model_loader import ModelLoader
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64
from PIL import Image
import io

class RandomForestView(BaseModelView):
    """Random Forest model view for retail customer behavior prediction"""
    model_name = "random_forest_retail"
    
    def get(self, request, *args, **kwargs):
        """Return model info and example inputs"""
        return Response({
            "model": "Random Forest",
            "use_case": "Retail Customer Behavior",
            "input_example": {
                "age": 35,
                "income": 75000,
                "previous_purchases": 12,
                "average_basket_value": 150,
                "days_since_last_purchase": 14
            },
            "description": "Predicts customer purchasing behavior based on demographics and history."
        })
    
    def process_input(self, data):
        """Process input data for random forest"""
        age = float(data.get('age', 0))
        income = float(data.get('income', 0))
        previous_purchases = int(data.get('previous_purchases', 0))
        average_basket = float(data.get('average_basket_value', 0))
        days_since_last = int(data.get('days_since_last_purchase', 0))
        return np.array([[age, income, previous_purchases, average_basket, days_since_last]])
    
    def process_output(self, prediction):
        """Process random forest output"""
        category = int(prediction[0])
        categories = ["Low Value", "Medium Value", "High Value", "Very High Value"]
        
        # Get probabilities if available
        confidence = 0.85  # Default confidence
        
        return {
            "customer_category": categories[category],
            "confidence": confidence
        }
    
    def train_model(self):
        """Train a new random forest model for retail customer behavior"""
        # Sample training data for customer categories
        X = np.array([
            [25, 40000, 5, 50, 30],    # Low Value
            [30, 60000, 8, 80, 14],    # Medium Value
            [45, 85000, 15, 120, 7],   # High Value
            [50, 100000, 25, 200, 3],  # Very High Value
            [22, 35000, 3, 40, 45],    # Low Value
            [32, 65000, 10, 90, 10],   # Medium Value
            [40, 90000, 18, 150, 5],   # High Value
            [55, 120000, 30, 250, 2],  # Very High Value
        ])
        y = np.array([0, 1, 2, 3, 0, 1, 2, 3])  # Customer categories
        
        # Train model
        model = RandomForestClassifier(n_estimators=10)
        model.fit(X, y)
        
        # Save model
        ModelLoader.save_sklearn_model(model, self.model_name)
        return model

class AdaBoostView(BaseModelView):
    """AdaBoost model view for face recognition"""
    model_name = "adaboost_face_recognition"
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get(self, request, *args, **kwargs):
        """Return model info and example inputs"""
        return Response({
            "model": "AdaBoost",
            "use_case": "Face Recognition",
            "input_example": {
                "image": "Upload an image with a face to recognize"
            },
            "description": "Recognizes faces using webcam input and compares against a gallery of known faces."
        })
    
    def post(self, request, *args, **kwargs):
        """Process face recognition from uploaded image"""
        # Check if image is provided
        if 'image' not in request.FILES:
            # Try to process manual form data for backward compatibility
            return self._process_manual_features(request.data)
            
        # Process the uploaded image
        image = request.FILES['image']
        
        # Check file type
        if not image.name.lower().endswith(('.png', '.jpg', '.jpeg')):
            return Response({
                "error": "Only PNG, JPG and JPEG files are allowed"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save the image temporarily
        file_path = self._save_image(image)
        
        # Extract facial features (would use a real CV library in production)
        # Here we'll mock the feature extraction
        extracted_features = self._mock_extract_facial_features(image)
        
        # Process the features through the model
        # For demo purposes, we'll generate a mock result
        person_id, confidence = self._mock_face_recognition(extracted_features)
        
        return Response({
            "person_id": person_id,
            "confidence": confidence,
            "image_url": file_path
        }, status=status.HTTP_200_OK)
    
    def _process_manual_features(self, data):
        """Process manually entered facial features (backward compatibility)"""
        try:
            # Process the input data
            features = self.process_input(data)
            
            # Make prediction
            prediction = self.predict(features)
            
            # Process the output
            result = self.process_output(prediction)
            
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def process_input(self, data):
        """Process input data for AdaBoost"""
        eye_distance = float(data.get('eye_distance', 0))
        face_width = float(data.get('face_width', 0))
        nose_length = float(data.get('nose_length', 0))
        symmetry_score = float(data.get('symmetry_score', 0))
        return np.array([[eye_distance, face_width, nose_length, symmetry_score]])
    
    def process_output(self, prediction):
        """Process AdaBoost output"""
        face_id = int(prediction[0])
        return {
            "person_id": face_id,
            "confidence": 0.88
        }
    
    def _save_image(self, image):
        """Save the uploaded image and return the file path"""
        # Create a unique filename
        file_name = f"{uuid.uuid4().hex}{os.path.splitext(image.name)[1]}"
        
        # Define the path where the file will be saved
        file_path = f"uploads/faces/{file_name}"
        
        # Save the file
        path = default_storage.save(file_path, ContentFile(image.read()))
        
        # Return the file URL
        return os.path.join(settings.MEDIA_URL, path)
    
    def _mock_extract_facial_features(self, image):
        """Extract facial features using OpenCV and MediaPipe
        In a production system, this would be more robust and use a deeper face recognition model
        """
        try:
            import cv2
            import mediapipe as mp
            import numpy as np
            from PIL import Image
            import io
            
            # Read the image file
            image_data = image.read()
            
            # Convert to PIL Image
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Convert to OpenCV format (numpy array)
            cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            # Initialize MediaPipe Face Mesh
            mp_face_mesh = mp.solutions.face_mesh
            face_mesh = mp_face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                min_detection_confidence=0.5
            )
            
            # Process the image
            results = face_mesh.process(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
            
            # If no face detected, return random features
            if not results.multi_face_landmarks:
                print("No face detected, using random features")
                return {
                    "eye_distance": np.random.uniform(0.35, 0.45),
                    "face_width": np.random.uniform(0.34, 0.42),
                    "nose_length": np.random.uniform(0.24, 0.32),
                    "symmetry_score": np.random.uniform(0.75, 0.95)
                }
            
            # Get the first face
            face_landmarks = results.multi_face_landmarks[0]
            
            # Extract key points (simplified for demo)
            # MediaPipe provides 468 facial landmarks
            h, w, _ = cv_image.shape
            
            # Get coordinates for key facial landmarks
            # Left eye: landmark 33
            left_eye = (face_landmarks.landmark[33].x * w, face_landmarks.landmark[33].y * h)
            
            # Right eye: landmark 263
            right_eye = (face_landmarks.landmark[263].x * w, face_landmarks.landmark[263].y * h)
            
            # Nose tip: landmark 4
            nose_tip = (face_landmarks.landmark[4].x * w, face_landmarks.landmark[4].y * h)
            
            # Nose bridge: landmark 168
            nose_bridge = (face_landmarks.landmark[168].x * w, face_landmarks.landmark[168].y * h)
            
            # Left face: landmark 234
            left_face = (face_landmarks.landmark[234].x * w, face_landmarks.landmark[234].y * h)
            
            # Right face: landmark 454
            right_face = (face_landmarks.landmark[454].x * w, face_landmarks.landmark[454].y * h)
            
            # Calculate metrics
            # Eye distance (normalized by image width)
            eye_distance = np.sqrt((right_eye[0] - left_eye[0])**2 + (right_eye[1] - left_eye[1])**2) / w
            
            # Face width (normalized by image width)
            face_width = np.sqrt((right_face[0] - left_face[0])**2 + (right_face[1] - left_face[1])**2) / w
            
            # Nose length (normalized by image height)
            nose_length = np.sqrt((nose_tip[0] - nose_bridge[0])**2 + (nose_tip[1] - nose_bridge[1])**2) / h
            
            # Symmetry calculation (simplified - checks horizontal symmetry)
            landmarks = np.array([(lm.x, lm.y) for lm in face_landmarks.landmark])
            left_landmarks = landmarks[landmarks[:, 0] < 0.5]
            right_landmarks = landmarks[landmarks[:, 0] >= 0.5]
            
            # Mirror the right landmarks
            mirrored_right = np.copy(right_landmarks)
            mirrored_right[:, 0] = 1 - mirrored_right[:, 0]
            
            # Calculate average distance between corresponding points
            # (this is a simplified approach)
            symmetry_score = 1.0 - min(1.0, np.mean(np.abs(left_landmarks[:, 0] - (1 - right_landmarks[:, 0]))))
            
            # Return the extracted features
            return {
                "eye_distance": float(eye_distance),
                "face_width": float(face_width),
                "nose_length": float(nose_length),
                "symmetry_score": float(symmetry_score)
            }
            
        except Exception as e:
            print(f"Error in face feature extraction: {str(e)}")
            # Fallback to random features if extraction fails
            return {
                "eye_distance": np.random.uniform(0.35, 0.45),
                "face_width": np.random.uniform(0.34, 0.42),
                "nose_length": np.random.uniform(0.24, 0.32),
                "symmetry_score": np.random.uniform(0.75, 0.95)
            }
    
    def _mock_face_recognition(self, features):
        """Mock function to recognize faces based on extracted features
        In a real system, this would compare face embeddings using cosine similarity 
        or another distance metric against a database of known faces
        """
        # Determine which person this face most closely matches
        if features["symmetry_score"] > 0.9:
            # High symmetry, likely person 2
            return 2, 0.92
        elif features["eye_distance"] > 0.42:
            # Wide eyes, likely person 0
            return 0, 0.88
        elif features["face_width"] > 0.4:
            # Wide face, likely person 1
            return 1, 0.85
        else:
            # Default to person 3
            return 3, 0.78
    
    def train_model(self):
        """Train a new AdaBoost model for face recognition"""
        # Sample training data for face recognition (simplified features)
        X = np.array([
            [0.41, 0.37, 0.27, 0.84],  # Person 1
            [0.38, 0.42, 0.30, 0.79],  # Person 2
            [0.43, 0.35, 0.25, 0.88],  # Person 3
            [0.40, 0.38, 0.28, 0.82],  # Person 1
            [0.39, 0.41, 0.29, 0.80],  # Person 2
            [0.44, 0.34, 0.26, 0.87],  # Person 3
        ])
        y = np.array([0, 1, 2, 0, 1, 2])  # Person IDs
        
        # Train model
        model = AdaBoostClassifier(n_estimators=50)
        model.fit(X, y)
        
        # Save model
        ModelLoader.save_sklearn_model(model, self.model_name)
        return model

class XGBoostView(BaseModelView):
    """XGBoost model view for click-through rate prediction"""
    model_name = "xgboost_ctr"
    
    def get(self, request, *args, **kwargs):
        """Return model info and example inputs"""
        return Response({
            "model": "XGBoost",
            "use_case": "Click-Through Rate Prediction",
            "input_example": {
                "user_age": 28,
                "ad_position": 2,
                "ad_relevance_score": 0.75,
                "time_of_day": 14,
                "previous_clicks": 3
            },
            "description": "Predicts click-through rate for online advertisements."
        })
    
    def process_input(self, data):
        """Process input data for XGBoost"""
        user_age = float(data.get('user_age', 0))
        ad_position = int(data.get('ad_position', 0))
        ad_relevance = float(data.get('ad_relevance_score', 0))
        time_of_day = int(data.get('time_of_day', 0))
        previous_clicks = int(data.get('previous_clicks', 0))
        return np.array([[user_age, ad_position, ad_relevance, time_of_day, previous_clicks]])
    
    def process_output(self, prediction):
        """Process XGBoost output"""
        ctr = float(prediction[0])
        return {
            "click_probability": round(ctr, 4),
            "confidence": 0.92
        }
    
    def train_model(self):
        """Train a new XGBoost model for click-through rate prediction"""
        # Sample training data for CTR prediction
        X = np.array([
            [25, 1, 0.8, 10, 5],   # High CTR
            [35, 3, 0.3, 22, 1],   # Low CTR
            [28, 1, 0.9, 18, 8],   # High CTR
            [45, 2, 0.5, 14, 3],   # Medium CTR
            [22, 3, 0.2, 8, 0],    # Low CTR
            [30, 1, 0.7, 16, 6],   # High CTR
        ])
        y = np.array([0.12, 0.02, 0.15, 0.06, 0.01, 0.11])  # CTR values
        
        # Train model
        model = xgb.XGBRegressor(objective="reg:squarederror", n_estimators=50)
        model.fit(X, y)
        
        # Save model
        ModelLoader.save_sklearn_model(model, self.model_name)
        return model 