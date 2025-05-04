import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ClassificationModelForm from './ClassificationModelForm';
import Layout from '../layout/Layout';
import './Classification.css';

interface AnimatedClassificationPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const AnimatedClassificationPage: React.FC<AnimatedClassificationPageProps> = (props) => {
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    });
  }, [controls]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.15
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }
    }
  };

  const textAnimationVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 12
      }
    }
  };

  const charAnimVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  };

  // Generate random positions for floating shapes
  const generateShapes = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 10 + Math.random() * 60,
      duration: 15 + Math.random() * 30,
      delay: Math.random() * 5
    }));
  };

  const shapes = generateShapes(8);

  // Animation for text characters
  const AnimatedText = ({ text, className = "" }: { text: string, className?: string }) => {
    return (
      <motion.div 
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.03
            }
          }
        }}
        className={className}
      >
        {text.split("").map((char, index) => (
          <motion.span 
            key={index} 
            variants={charAnimVariants}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.02,
              type: "spring",
              damping: 12
            }}
            style={{ display: "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <Layout>
      <motion.div
        className="relative overflow-hidden max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden rounded-xl">
          {shapes.map((shape) => (
            <motion.div
              key={shape.id}
              className="absolute rounded-full bg-blue-200 bg-opacity-30 backdrop-blur-sm"
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: `${shape.size}px`,
                height: `${shape.size}px`,
              }}
              animate={{
                x: [0, 30, -20, 10, 0],
                y: [0, -30, 20, -10, 0],
                rotate: [0, 90, 180, 270, 360]
              }}
              transition={{
                duration: shape.duration,
                repeat: Infinity,
                delay: shape.delay,
                ease: "linear",
                times: [0, 0.25, 0.5, 0.75, 1]
              }}
            />
          ))}
        </div>

        {/* Header section */}
        <motion.div 
          className="relative z-10 pt-6 pb-4 px-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-t-xl border-b border-blue-100"
          variants={itemVariants}
        >
          <motion.div variants={textAnimationVariants}>
            <AnimatedText 
              text={props.title} 
              className="text-2xl font-bold text-indigo-800"
            />
          </motion.div>
          <motion.div 
            variants={textAnimationVariants}
            transition={{ delay: 0.2 }}
            className="text-indigo-600 mt-2"
          >
            <AnimatedText text={props.description} />
          </motion.div>
        </motion.div>

        {/* Stats cards */}
        <motion.div 
          className="relative z-10 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white bg-opacity-70 backdrop-blur-sm"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-4 border border-blue-100"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <motion.p 
                  className="text-sm text-gray-500"
                  variants={textAnimationVariants}
                >
                  Spam Detection
                </motion.p>
                <motion.h3 
                  className="text-lg font-semibold text-gray-800"
                  variants={textAnimationVariants}
                >
                  98.5%
                </motion.h3>
              </div>
            </div>
            <motion.div 
              className="mt-2"
              variants={textAnimationVariants}
            >
              <p className="text-xs text-gray-500">Accurate spam email detection helps protect your inbox</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-sm p-4 border border-blue-100"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <motion.p 
                  className="text-sm text-gray-500"
                  variants={textAnimationVariants}
                >
                  Processing Time
                </motion.p>
                <motion.h3 
                  className="text-lg font-semibold text-gray-800"
                  variants={textAnimationVariants}
                >
                  ~0.1s
                </motion.h3>
              </div>
            </div>
            <motion.div 
              className="mt-2"
              variants={textAnimationVariants}
            >
              <p className="text-xs text-gray-500">Fast classification enables real-time analysis of incoming messages</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-sm p-4 border border-blue-100"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <motion.p 
                  className="text-sm text-gray-500"
                  variants={textAnimationVariants}
                >
                  Security
                </motion.p>
                <motion.h3 
                  className="text-lg font-semibold text-gray-800"
                  variants={textAnimationVariants}
                >
                  Enhanced
                </motion.h3>
              </div>
            </div>
            <motion.div 
              className="mt-2"
              variants={textAnimationVariants}
            >
              <p className="text-xs text-gray-500">Protect against phishing and malicious content with email classification</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Feature visualization */}
        <motion.div 
          className="relative z-10 p-4 bg-white bg-opacity-70 backdrop-blur-sm"
          variants={itemVariants}
        >
          <motion.h3 
            className="text-xl font-semibold text-indigo-800 mb-4"
            variants={textAnimationVariants}
          >
            <AnimatedText text="Classification Features" />
          </motion.h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Word Count", importance: 0.68 },
              { name: "Urgent Words", importance: 0.82 },
              { name: "Money Terms", importance: 0.91 },
              { name: "Sender Verification", importance: 0.76 }
            ].map((feature, index) => (
              <motion.div
                key={feature.name}
                className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.h4 
                  className="text-sm font-medium text-gray-700"
                  variants={textAnimationVariants}
                >
                  {feature.name}
                </motion.h4>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <motion.div 
                    className="bg-indigo-500 h-1.5 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${feature.importance * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 + (0.1 * index) }}
                  />
                </div>
                <motion.p 
                  className="text-xs text-gray-500 mt-1"
                  variants={textAnimationVariants}
                >
                  Weight: {Math.round(feature.importance * 100)}%
                </motion.p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Classification visualization */}
        <motion.div 
          className="relative z-10 p-4 bg-white bg-opacity-70 backdrop-blur-sm"
          variants={itemVariants}
        >
          <motion.h3 
            className="text-xl font-semibold text-indigo-800 mb-4"
            variants={textAnimationVariants}
          >
            <AnimatedText text="Classification Process" />
          </motion.h3>
          
          <div className="classification-animation">
            <div className="documents">
              <div className="document">
                <div className="doc-line"></div>
                <div className="doc-line"></div>
                <div className="doc-line"></div>
              </div>
              <div className="document">
                <div className="doc-line"></div>
                <div className="doc-line"></div>
                <div className="doc-line"></div>
              </div>
              <div className="document">
                <div className="doc-line"></div>
                <div className="doc-line"></div>
                <div className="doc-line"></div>
              </div>
            </div>
            
            <div className="processing-arrow">
              <div className="arrow-line"></div>
              <div className="arrow-head"></div>
            </div>
            
            <div className="categories">
              <div className="category spam">Spam</div>
              <div className="category ham">Not Spam</div>
            </div>
            
            <div className="classification-dots">
              <div className="dot dot-spam"></div>
              <div className="dot dot-ham"></div>
              <div className="dot dot-spam"></div>
              <div className="dot dot-ham"></div>
              <div className="dot dot-ham"></div>
            </div>
          </div>
          
          <motion.p 
            className="text-sm text-gray-600 mt-3 text-center"
            variants={textAnimationVariants}
          >
            <AnimatedText text="Our classification algorithm analyzes email features to accurately categorize messages as spam or legitimate" />
          </motion.p>
        </motion.div>

        {/* Main form */}
        <motion.div 
          className="relative z-10 p-6 bg-white rounded-b-xl shadow-inner"
          variants={itemVariants}
        >
          <ClassificationModelForm 
            modelEndpoint={props.modelEndpoint}
            title={props.title}
            description={props.description}
            supportsText={true}
            supportsCSV={true}
            textField={{
              name: 'text',
              label: 'Email Content',
              placeholder: 'Enter email text to classify as spam or not...'
            }}
          />
        </motion.div>
        
        {/* Floating email elements */}
        <div className="email-elements">
          <div className="email-element element-at">@</div>
          <div className="email-element element-dollar">$</div>
          <div className="email-element element-urgent">URGENT!</div>
          <div className="email-element element-free">FREE</div>
          <div className="email-element element-now">NOW</div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default AnimatedClassificationPage; 