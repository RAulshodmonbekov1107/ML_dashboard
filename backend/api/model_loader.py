import os
import joblib
import tensorflow as tf
from django.conf import settings

class ModelLoader:
    """
    Base class for loading ML models.
    This class provides methods to load various types of ML models.
    """
    
    @staticmethod
    def load_sklearn_model(model_name):
        """Load scikit-learn models using joblib"""
        model_path = os.path.join(settings.MODELS_DIR, f"{model_name}.joblib")
        if os.path.exists(model_path):
            return joblib.load(model_path)
        return None
    
    @staticmethod
    def load_tensorflow_model(model_name):
        """Load tensorflow models"""
        # Try loading with .keras extension first
        model_path = os.path.join(settings.MODELS_DIR, f"{model_name}.keras")
        if os.path.exists(model_path):
            return tf.keras.models.load_model(model_path)
        
        # Try loading with .h5 extension if .keras doesn't exist
        model_path = os.path.join(settings.MODELS_DIR, f"{model_name}.h5")
        if os.path.exists(model_path):
            return tf.keras.models.load_model(model_path)
        
        # Try loading as a directory as a last resort
        model_path = os.path.join(settings.MODELS_DIR, model_name)
        if os.path.exists(model_path) and os.path.isdir(model_path):
            return tf.keras.models.load_model(model_path)
        
        return None
    
    @staticmethod
    def save_sklearn_model(model, model_name):
        """Save scikit-learn models using joblib"""
        os.makedirs(settings.MODELS_DIR, exist_ok=True)
        model_path = os.path.join(settings.MODELS_DIR, f"{model_name}.joblib")
        joblib.dump(model, model_path)
        return model_path
    
    @staticmethod
    def save_tensorflow_model(model, model_name):
        """Save tensorflow models with proper extension"""
        os.makedirs(settings.MODELS_DIR, exist_ok=True)
        
        # Save with .keras extension (recommended for newer TF versions)
        model_path = os.path.join(settings.MODELS_DIR, f"{model_name}.keras")
        
        try:
            model.save(model_path)
            return model_path
        except Exception as e:
            # If .keras fails, try with .h5 extension
            print(f"Warning: Failed to save with .keras extension: {e}")
            model_path = os.path.join(settings.MODELS_DIR, f"{model_name}.h5")
            model.save(model_path)
            return model_path 