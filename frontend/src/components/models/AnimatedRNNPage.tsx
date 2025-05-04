import React, { useEffect } from 'react';
import RNNModelForm from './RNNModelForm';
import { motion } from 'framer-motion';
import '../../App.css';
import Navbar from '../layout/Navbar';

interface AnimatedRNNPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const AnimatedRNNPage: React.FC<AnimatedRNNPageProps> = (props) => {
  // Add a class to the body when this component mounts
  useEffect(() => {
    // Don't set overflow: hidden on body - allow scrolling
    document.body.classList.add('rnn-page');
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('rnn-page');
    };
  }, []);

  // Speech waveform animation for decoration
  const SpeechWaveAnimation = () => {
    return (
      <div className="speech-wave animate mb-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="wave-bar" />
        ))}
      </div>
    );
  };

  return (
    <div className="rnn-page-container" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', overflowY: 'auto' }}>
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Animated Background */}
      <div className="rnn-bg">
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
            className="text-4xl font-bold text-teal-800 mb-3 inline-block relative"
            whileHover={{ scale: 1.05 }}
          >
            <span className="relative z-10 teal-glow-effect">Speech Recognition Lab</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-teal-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Powered by Recurrent Neural Networks with advanced audio processing
          </motion.p>
          
          <SpeechWaveAnimation />
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
            style={{ background: 'rgba(204, 251, 241, 0.2)' }}
          >
            <h3 className="text-teal-800 font-bold text-3xl">95%</h3>
            <p className="text-teal-600">Accuracy</p>
          </motion.div>
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
            style={{ background: 'rgba(204, 251, 241, 0.2)' }}
          >
            <h3 className="text-teal-800 font-bold text-3xl">8+</h3>
            <p className="text-teal-600">Languages</p>
          </motion.div>
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
            style={{ background: 'rgba(204, 251, 241, 0.2)' }}
          >
            <h3 className="text-teal-800 font-bold text-3xl">1.1s</h3>
            <p className="text-teal-600">Response Time</p>
          </motion.div>
        </motion.div>

        {/* RNN Model Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl shadow-xl p-6 border border-teal-100"
        >
          <RNNModelForm {...props} />
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-10 text-teal-500 text-sm pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>Advanced speech recognition powered by RNN neural network architecture</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedRNNPage; 