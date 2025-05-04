import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../App.css';
import Navbar from '../layout/Navbar';
import FaceRecognitionModelForm from './FaceRecognitionModelForm';

interface AnimatedAdaBoostPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const AnimatedAdaBoostPage: React.FC<AnimatedAdaBoostPageProps> = (props) => {
  // Add a class to the body when this component mounts
  useEffect(() => {
    document.body.classList.add('adaboost-page');
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('adaboost-page');
    };
  }, []);

  // Animated particles for background
  const particles = Array.from({ length: 15 }, (_, i) => i);

  return (
    <div className="adaboost-page-container" style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      overflowX: 'hidden', 
      overflowY: 'auto',
      background: 'linear-gradient(135deg, #051937 0%, #004d7a 100%)'
    }}>
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Animated Background */}
      <div className="adaboost-bg" style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
        {particles.map((_, index) => (
          <motion.div
            key={index}
            className="floating-particle"
            style={{
              position: 'absolute',
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.5, 0.1],
              scale: [1, Math.random() * 0.5 + 1, 1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Decorative grid lines for tech feel */}
        <div className="grid-lines" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`h-${i}`} style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${i * 10}%`,
              height: '1px',
              background: 'rgba(255, 255, 255, 0.3)'
            }} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`v-${i}`} style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${i * 10}%`,
              width: '1px',
              background: 'rgba(255, 255, 255, 0.3)'
            }} />
          ))}
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
            className="text-4xl font-bold text-white mb-3 inline-block relative"
            whileHover={{ scale: 1.05 }}
          >
            <span className="relative z-10" style={{ textShadow: '0 0 15px rgba(0,149,255,0.5)' }}>
              Face Recognition Studio
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Powered by AdaBoost algorithm with advanced facial feature detection
          </motion.p>
        </motion.div>

        {/* Face Detection Animation */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative w-48 h-48 mx-auto">
            {/* Face outline */}
            <motion.div
              className="w-32 h-32 mx-auto rounded-full border-2 border-blue-400"
              style={{ 
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
                background: 'rgba(14, 165, 233, 0.1)'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            />
            
            {/* Scanning line */}
            <motion.div 
              className="absolute left-8 right-8 h-0.5 bg-blue-400" 
              style={{ top: '50%' }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: 1, 
                opacity: [0, 1, 1, 0],
                y: [-40, 40]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                delay: 1
              }}
            />
            
            {/* Feature points */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const x = Math.cos(angle) * 12 + 16;
              const y = Math.sin(angle) * 12 + 16;
              
              return (
                <motion.div
                  key={`point-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
                  style={{ 
                    left: `calc(50% + ${x}px)`, 
                    top: `calc(50% + ${y}px)`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 1, 0],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{ 
                    delay: 1 + (i * 0.1),
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
            style={{ background: 'rgba(3, 105, 161, 0.2)', width: '160px' }}
          >
            <h3 className="text-white font-bold text-3xl">99.1%</h3>
            <p className="text-blue-300">Accuracy</p>
          </motion.div>
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
            style={{ background: 'rgba(3, 105, 161, 0.2)', width: '160px' }}
          >
            <h3 className="text-white font-bold text-3xl">50ms</h3>
            <p className="text-blue-300">Detection Time</p>
          </motion.div>
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.05 }}
            style={{ background: 'rgba(3, 105, 161, 0.2)', width: '160px' }}
          >
            <h3 className="text-white font-bold text-3xl">1000+</h3>
            <p className="text-blue-300">Features</p>
          </motion.div>
        </motion.div>

        {/* AdaBoost Face Recognition Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-blue-900/30"
          style={{ boxShadow: '0 0 30px rgba(2, 132, 199, 0.2)' }}
        >
          <FaceRecognitionModelForm 
            modelEndpoint={props.modelEndpoint}
            title={props.title}
            description={props.description}
          />
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-10 text-blue-300 text-sm pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>AI-powered face recognition using state-of-the-art AdaBoost ensemble learning</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedAdaBoostPage; 