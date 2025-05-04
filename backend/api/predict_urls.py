from django.urls import path
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

urlpatterns = [
    # Regression models
    path('linear-regression/', LinearRegressionView.as_view(), name='linear_regression'),
    path('multiple-linear-regression/', MultipleLinearRegressionView.as_view(), name='multiple_linear_regression'),
    path('general-regression/', GeneralRegressionView.as_view(), name='general_regression'),
    
    # Classification models
    path('classification/', ClassificationView.as_view(), name='classification'),
    path('knn/', KNNView.as_view(), name='knn'),
    path('logistic-regression/', LogisticRegressionView.as_view(), name='logistic_regression'),
    path('naive-bayes/', NaiveBayesView.as_view(), name='naive_bayes'),
    path('decision-tree/', DecisionTreeView.as_view(), name='decision_tree'),
    
    # Ensemble models
    path('random-forest/', RandomForestView.as_view(), name='random_forest'),
    path('adaboost/', AdaBoostView.as_view(), name='adaboost'),
    path('xgboost/', XGBoostView.as_view(), name='xgboost'),
    
    # Neural networks
    path('neural-network/', NeuralNetworkView.as_view(), name='neural_network'),
    path('rnn/', RNNView.as_view(), name='rnn'),
    path('lstm/', LSTMView.as_view(), name='lstm'),
    path('translation/', TranslationView.as_view(), name='translation'),
] 