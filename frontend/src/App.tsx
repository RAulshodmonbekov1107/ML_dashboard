import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ModelDetailPage from './pages/ModelDetailPage';
import CustomObjectDetectionForm from './components/models/CustomObjectDetectionForm';
import AnimatedTranslationPage from './components/models/AnimatedTranslationPage';
import AnimatedLSTMPage from './components/models/AnimatedLSTMPage';
import AnimatedRNNPage from './components/models/AnimatedRNNPage';
import AnimatedNNPage from './components/models/AnimatedNNPage';
import AnimatedAdaBoostPage from './components/models/AnimatedAdaBoostPage';
import AnimatedXGBoostPage from './components/models/AnimatedXGBoostPage';
import AnimatedClassificationPage from './components/models/AnimatedClassificationPage';
import AnimatedKNNPage from './components/models/AnimatedKNNPage';
import AnimatedLogisticRegressionPage from './components/models/AnimatedLogisticRegressionPage';
import AnimatedNaiveBayesPage from './components/models/AnimatedNaiveBayesPage';
import AnimatedDecisionTreePage from './components/models/AnimatedDecisionTreePage';
import AnimatedMultipleLinearRegressionPage from './components/models/AnimatedMultipleLinearRegressionPage';
import AnimatedGeneralRegressionPage from './components/models/AnimatedGeneralRegressionPage';
import AnimatedLinearRegressionPage from './components/models/AnimatedLinearRegressionPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Special route for translation page with its own layout */}
        <Route path="/model/translation" element={
          <AnimatedTranslationPage 
            modelEndpoint="translation"
            title="Neural Machine Translation"
            description="Language translation for communication and content localization"
          />
        } />
        
        {/* Special route for LSTM page with its own layout */}
        <Route path="/model/lstm" element={
          <AnimatedLSTMPage 
            modelEndpoint="lstm"
            title="LSTM Text Generation"
            description="Generate creative text using Long Short-Term Memory neural networks"
          />
        } />
        
        {/* Special route for RNN page with its own layout */}
        <Route path="/model/rnn" element={
          <AnimatedRNNPage 
            modelEndpoint="rnn"
            title="RNN Speech Recognition"
            description="Convert spoken language to text with advanced neural networks"
          />
        } />
        
        {/* Special route for Neural Network page with its own layout */}
        <Route path="/model/neural-network" element={
          <AnimatedNNPage 
            modelEndpoint="neural-network"
            title="Image Recognition"
            description="Recognize objects in images using deep neural networks"
          />
        } />
        
        {/* Special route for AdaBoost Face Recognition page with its own layout */}
        <Route path="/model/adaboost" element={
          <AnimatedAdaBoostPage 
            modelEndpoint="adaboost"
            title="Face Recognition"
            description="Real-time face recognition using AdaBoost ensemble learning"
          />
        } />
        
        {/* Special route for XGBoost Phishing Detection page with its own layout */}
        <Route path="/model/xgboost" element={
          <AnimatedXGBoostPage 
            modelEndpoint="xgboost"
            title="Phishing URL Detection"
            description="Detect malicious phishing websites using XGBoost machine learning"
          />
        } />
        
        {/* Special route for Classification page with its own layout */}
        <Route path="/model/classification" element={
          <AnimatedClassificationPage 
            modelEndpoint="classification"
            title="Email Spam Detection"
            description="Classify emails as spam or not spam based on text content and features"
          />
        } />
        
        {/* Special route for KNN movie recommendations page with its own layout */}
        <Route path="/model/knn" element={
          <AnimatedKNNPage 
            modelEndpoint="knn"
            title="Movie Recommendations"
            description="Get personalized movie suggestions based on your preferences and similar users"
          />
        } />
        
        {/* Special route for Logistic Regression fraud detection page with its own layout */}
        <Route path="/model/logistic-regression" element={
          <AnimatedLogisticRegressionPage 
            modelEndpoint="logistic-regression"
            title="Credit Card Fraud Detection"
            description="Identify potentially fraudulent credit card transactions using logistic regression"
          />
        } />
        
        {/* Special route for Naive Bayes sentiment analysis with its own layout */}
        <Route path="/model/naive-bayes" element={
          <AnimatedNaiveBayesPage 
            modelEndpoint="naive-bayes"
            title="Sentiment Analysis"
            description="Analyze text sentiment and classify it as positive, negative, or neutral using Naive Bayes"
          />
        } />

        {/* Special route for Decision Tree loan approval with its own layout */}
        <Route path="/model/decision-tree" element={
          <AnimatedDecisionTreePage 
            modelEndpoint="decision-tree"
            title="Loan Approval System"
            description="Determine loan approval based on financial attributes using decision trees"
          />
        } />
        
        {/* Special route for Multiple Linear Regression medical cost prediction with its own layout */}
        <Route path="/model/multiple-linear-regression" element={
          <AnimatedMultipleLinearRegressionPage 
            modelEndpoint="multiple-linear-regression"
            title="Medical Cost Prediction"
            description="Predict healthcare costs based on patient attributes like age, BMI, and smoking status"
          />
        } />
        
        {/* Special route for General Regression stock price prediction with its own layout */}
        <Route path="/model/general-regression" element={
          <AnimatedGeneralRegressionPage 
            modelEndpoint="general-regression"
            title="Stock Price Prediction"
            description="Forecast stock prices based on previous price, trading volume, and market index"
          />
        } />
        
        {/* Special route for Linear Regression house price prediction with its own layout */}
        <Route path="/model/linear-regression" element={
          <AnimatedLinearRegressionPage 
            modelEndpoint="linear-regression"
            title="House Price Prediction"
            description="Estimate house prices based on square footage using simple linear regression"
          />
        } />
        
        {/* Standard routes with the default layout */}
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout>
            <DashboardPage />
          </Layout>
        } />
        <Route path="/model/:modelEndpoint" element={
          <Layout>
            <ModelDetailPage />
          </Layout>
        } />
        <Route path="/models/custom-object-detection" element={
          <Layout>
            <CustomObjectDetectionForm 
              title="Custom Object Detection"
              description="Train your own object detection model to recognize specific objects"
            />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
