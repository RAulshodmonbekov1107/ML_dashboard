from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.model_loader import ModelLoader

class BaseModelView(APIView):
    """Base view for all ML model endpoints"""
    
    model_name = None  # To be defined by subclasses
    model_type = 'sklearn'  # 'sklearn' or 'tensorflow'
    
    def get_model(self):
        """Load model based on model type"""
        if self.model_type == 'sklearn':
            return ModelLoader.load_sklearn_model(self.model_name)
        elif self.model_type == 'tensorflow':
            return ModelLoader.load_tensorflow_model(self.model_name)
        return None
    
    def process_input(self, data):
        """Process input data - to be overridden by subclasses"""
        raise NotImplementedError("Subclasses must implement process_input")
    
    def process_output(self, prediction):
        """Process model output - to be overridden by subclasses"""
        raise NotImplementedError("Subclasses must implement process_output")
    
    def post(self, request, *args, **kwargs):
        """Handle POST requests with prediction"""
        model = self.get_model()
        
        # If model doesn't exist, train a new one
        if model is None:
            return Response(
                {"error": "Model not found. Please train the model first."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # Process input data
            input_data = self.process_input(request.data)
            
            # Make prediction
            prediction = model.predict(input_data)
            
            # Process output
            result = self.process_output(prediction)
            
            return Response(result)
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 