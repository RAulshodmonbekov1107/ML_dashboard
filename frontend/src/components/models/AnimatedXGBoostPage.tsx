import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../App.css';
import Navbar from '../layout/Navbar';
import PhishingDetectionForm from './PhishingDetectionForm';

interface AnimatedXGBoostPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const AnimatedXGBoostPage: React.FC<AnimatedXGBoostPageProps> = (props) => {
  useEffect(() => {
    document.body.classList.add('xgboost-page');
    
    return () => {
      document.body.classList.remove('xgboost-page');
    };
  }, []);

  return (
    <div className="xgboost-page-container" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', overflowY: 'auto' }}>
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Animated Background */}
      <div className="xgboost-bg">
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
        <div className="floating-shape shape3"></div>
        <div className="floating-shape shape4"></div>
        <div className="lines">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 pb-8" style={{ position: 'relative', zIndex: 1 }}>
        {/* Animated Header */}
        <motion.div 
          className="text-center mb-8 mt-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <motion.h1 
            className="text-4xl font-bold text-green-800 mb-3 inline-block relative"
            whileHover={{ scale: 1.05 }}
          >
            <span className="relative z-10 green-glow-effect">XGBoost Phishing Detection</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-green-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Intelligent URL analysis with machine learning to identify phishing threats
          </motion.p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="flex justify-center gap-8 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-green-800 font-bold text-3xl">97%</h3>
            <p className="text-green-600">Accuracy</p>
          </motion.div>
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-green-800 font-bold text-3xl">500k+</h3>
            <p className="text-green-600">URLs Analyzed</p>
          </motion.div>
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-green-800 font-bold text-3xl">Real-time</h3>
            <p className="text-green-600">Analysis</p>
          </motion.div>
        </motion.div>

        {/* Security Features Visualization */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="security-viz">
            <div className="security-icons">
              <div className="security-icon">
                <div className="shield-icon">
                  <div className="shield-inner">
                    <span>🔒</span>
                  </div>
                </div>
                <p>SSL Verification</p>
              </div>
              <div className="security-icon">
                <div className="shield-icon">
                  <div className="shield-inner">
                    <span>🔍</span>
                  </div>
                </div>
                <p>URL Analysis</p>
              </div>
              <div className="security-icon">
                <div className="shield-icon">
                  <div className="shield-inner">
                    <span>📊</span>
                  </div>
                </div>
                <p>Pattern Recognition</p>
              </div>
              <div className="security-icon">
                <div className="shield-icon">
                  <div className="shield-inner">
                    <span>⚠️</span>
                  </div>
                </div>
                <p>Threat Alerts</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Phishing Detection Form */}
        <motion.div
          className="bg-white shadow-xl rounded-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PhishingDetectionForm />
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-10 text-green-500 text-sm pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>XGBoost: Advanced tree boosting algorithm for phishing detection with high precision</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedXGBoostPage; 