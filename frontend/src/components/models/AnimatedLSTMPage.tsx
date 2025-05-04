import React, { useEffect } from 'react';
import LSTMModelForm from './LSTMModelForm';
import { motion } from 'framer-motion';
import '../../App.css';
import Navbar from '../layout/Navbar';

interface AnimatedLSTMPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const AnimatedLSTMPage: React.FC<AnimatedLSTMPageProps> = (props) => {
  useEffect(() => {
    document.body.classList.add('gpt2-page');
    
    // Create animated text particles
    const createTextParticles = () => {
      const container = document.querySelector('.gpt2-bg');
      if (!container) return;
      
      const phrases = ['GPT-2', 'AI', 'Text', 'Language', 'Model', 'Generation'];
      
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'text-particle';
        particle.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        particle.style.fontSize = `${Math.random() * 16 + 10}px`;
        particle.style.opacity = `${Math.random() * 0.2 + 0.1}`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        container.appendChild(particle);
      }
    };
    
    // Create the animated shapes for the background
    const createShapes = () => {
      const container = document.querySelector('.gpt2-bg');
      if (!container) return;
      
      for (let i = 1; i <= 4; i++) {
        const shape = document.createElement('div');
        shape.className = `floating-shape shape${i}`;
        container.appendChild(shape);
      }
      
      // Create animated lines
      const lines = document.createElement('div');
      lines.className = 'lines';
      for (let i = 0; i < 5; i++) {
        const line = document.createElement('div');
        line.className = 'line';
        lines.appendChild(line);
      }
      container.appendChild(lines);
    };
    
    // Initialize background effects with a slight delay
    setTimeout(() => {
      createShapes();
      createTextParticles();
    }, 100);
    
    return () => {
      document.body.classList.remove('gpt2-page');
      // Cleanup any created elements if needed
    };
  }, []);

  return (
    <div className="gpt2-page-container" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="gpt2-bg"></div>
      
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-purple-800 mb-4 typing-effect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Advanced AI Text Generation
          </motion.h1>
          
          <motion.div 
            className="prose prose-lg max-w-none mb-8 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <p>
              Experience powerful AI language models like OpenAI's GPT-3.5 Turbo, which can generate remarkably 
              coherent and contextually relevant text responses to your prompts.
              This advanced system uses a multi-tier approach for the highest quality text generation.
            </p>
          </motion.div>
          
          <motion.div
            className="gpt2-card p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5, type: 'spring', stiffness: 120 }}
          >
            <LSTMModelForm
              modelEndpoint="text-generation" 
              title="GPT-2 Text Generation"
              description="Generate coherent text using GPT-2 Small"
            />
          </motion.div>
          
          <motion.div 
            className="mt-12 p-6 bg-purple-50 rounded-lg border border-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, type: 'spring' }}
          >
            <h2 className="text-xl font-semibold text-purple-800 mb-3">About Our AI Text Generation</h2>
            <p className="text-gray-700">
              Our text generation system uses a multi-tier approach for the highest quality responses. 
              The primary engine is OpenAI's GPT-3.5 Turbo, a powerful language model that can understand 
              context and generate coherent, relevant text on virtually any topic.
            </p>
            <p className="text-gray-700 mt-3">
              If the primary service is unavailable, the system falls back to alternative models like 
              GPT-2 and OPT-1.3B through HuggingFace's Inference API. Even without internet access, 
              our advanced local fallback system provides contextually appropriate responses.
            </p>
            <p className="text-gray-700 mt-3">
              Try asking questions, requesting explanations, or prompting for creative content to see 
              how the system responds to different types of inputs.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedLSTMPage; 