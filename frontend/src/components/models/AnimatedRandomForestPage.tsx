import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import RandomForestModelForm from './RandomForestModelForm';
import './RandomForest.css';

interface AnimatedRandomForestPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const AnimatedRandomForestPage: React.FC<AnimatedRandomForestPageProps> = (props) => {
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
        staggerChildren: 0.2
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

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 overflow-hidden">
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            className="absolute rounded-full bg-green-200 bg-opacity-30 backdrop-blur-sm"
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
        className="relative z-10 pt-6 pb-4 px-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-t-xl border-b border-green-100"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold text-green-800">{props.title}</h2>
        <p className="text-green-600 mt-2">{props.description}</p>
      </motion.div>

      {/* Stats cards */}
      <motion.div 
        className="relative z-10 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white bg-opacity-70 backdrop-blur-sm"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-white rounded-lg shadow-sm p-4 border border-green-100"
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Accuracy</p>
              <h3 className="text-lg font-semibold text-gray-800">92%</h3>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Random forests provide excellent accuracy by combining multiple decision trees</p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm p-4 border border-green-100"
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Processing Time</p>
              <h3 className="text-lg font-semibold text-gray-800">~0.3s</h3>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Fast inference times make this model ideal for real-time customer analysis</p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm p-4 border border-green-100"
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">ROI Impact</p>
              <h3 className="text-lg font-semibold text-gray-800">+26%</h3>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Targeted marketing based on customer segmentation improves ROI</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Feature visualization */}
      <motion.div 
        className="relative z-10 p-4 bg-white bg-opacity-70 backdrop-blur-sm"
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold text-green-800 mb-4">Key Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { name: "Age", importance: 0.78 },
            { name: "Income", importance: 0.92 },
            { name: "Purchase History", importance: 0.88 },
            { name: "Basket Value", importance: 0.84 },
            { name: "Recency", importance: 0.76 }
          ].map((feature, index) => (
            <motion.div
              key={feature.name}
              className="bg-white rounded-lg p-3 border border-green-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <h4 className="text-sm font-medium text-gray-700">{feature.name}</h4>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <motion.div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${feature.importance * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 + (0.1 * index) }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Importance: {Math.round(feature.importance * 100)}%</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Forest visualization animation */}
      <motion.div 
        className="relative z-10 p-4 bg-white bg-opacity-70 backdrop-blur-sm"
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold text-green-800 mb-4">Random Forest Visualization</h3>
        
        <div className="tree-animation">
          <div className="tree"></div>
          <div className="tree"></div>
          <div className="tree"></div>
          <div className="tree"></div>
          <div className="tree"></div>
          
          <div className="forest-path">
            <div className="path-line"></div>
            <div className="path-line"></div>
            <div className="path-line"></div>
            <div className="path-line"></div>
          </div>
          
          <div className="particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-3 text-center">
          Each tree in the Random Forest analyzes customer data independently and votes on the final classification
        </p>
      </motion.div>

      {/* Main form */}
      <motion.div 
        className="relative z-10 p-6 bg-white rounded-b-xl shadow-inner"
        variants={itemVariants}
      >
        <RandomForestModelForm 
          modelEndpoint={props.modelEndpoint}
          title={props.title}
          description={props.description}
        />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedRandomForestPage; 