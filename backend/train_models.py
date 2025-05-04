"""
Train all machine learning models for the ML Showcase application.
This script should be run from the backend directory with Python.
"""

import os
import sys
import django

# Set up Django environment
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ml_showcase.settings")
django.setup()

# Import model views
from api.views import (
    # Regression models
    LinearRegressionView,
    MultipleLinearRegressionView,
    GeneralRegressionView,
    
    # Classification models
    ClassificationView,
    KNNView,
    LogisticRegressionView,
    NaiveBayesView,
    DecisionTreeView,
    
    # Ensemble models
    RandomForestView,
    AdaBoostView,
    XGBoostView,
    
    # Neural networks
    NeuralNetworkView,
    RNNView,
    LSTMView,
    TranslationView,
)

# Create models directory
from django.conf import settings
os.makedirs(settings.MODELS_DIR, exist_ok=True)

def train_all_models():
    """Train all machine learning models"""
    # List of model view classes
    model_classes = [
        # Regression models
        LinearRegressionView,
        MultipleLinearRegressionView,
        GeneralRegressionView,
        
        # Classification models
        ClassificationView,
        KNNView,
        LogisticRegressionView,
        NaiveBayesView,
        DecisionTreeView,
        
        # Ensemble models
        RandomForestView,
        AdaBoostView,
        XGBoostView,
        
        # Neural networks (these could take longer)
        NeuralNetworkView,
        RNNView,
        LSTMView,
        TranslationView,
    ]
    
    # Train each model
    for model_class in model_classes:
        print(f"Training {model_class.__name__}...")
        view = model_class()
        model = view.train_model()
        print(f"✅ {model_class.__name__} trained successfully!")
    
    print("\nAll models trained successfully!")

if __name__ == "__main__":
    print("Training ML models for the ML Showcase Application...")
    train_all_models() 