import React, { useEffect } from 'react';
import TranslationModelForm from './TranslationModelForm';
import { motion } from 'framer-motion';
import '../../App.css';
import Navbar from '../layout/Navbar';

interface AnimatedTranslationPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const AnimatedTranslationPage: React.FC<AnimatedTranslationPageProps> = (props) => {
  // Add a class to the body when this component mounts
  useEffect(() => {
    // Don't set overflow: hidden on body - allow scrolling
    document.body.classList.add('translation-page');
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('translation-page');
    };
  }, []);

  return (
    <div className="translation-page-container" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', overflowY: 'auto' }}>
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Animated Background */}
      <div className="translation-bg">
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
            className="text-4xl font-bold text-blue-800 mb-3 inline-block relative"
            whileHover={{ scale: 1.05 }}
          >
            <span className="relative z-10 glow-effect">Ultimate Translation Hub</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Powered by Google Translate API with AI-driven language processing
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
            <h3 className="text-blue-800 font-bold text-3xl">10+</h3>
            <p className="text-blue-600">Languages</p>
          </motion.div>
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-blue-800 font-bold text-3xl">99%</h3>
            <p className="text-blue-600">Accuracy</p>
          </motion.div>
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-blue-800 font-bold text-3xl">0.5s</h3>
            <p className="text-blue-600">Response Time</p>
          </motion.div>
        </motion.div>

        {/* Translation Form */}
        <TranslationModelForm {...props} />

        {/* Footer */}
        <motion.div 
          className="text-center mt-10 text-blue-500 text-sm pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>Translation service enhanced with Google Translate API</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedTranslationPage; 