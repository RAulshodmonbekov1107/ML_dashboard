import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Layout from '../layout/Layout';
import ClassificationModelForm from './ClassificationModelForm';
import './KNN.css';

interface AnimatedKNNPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const AnimatedKNNPage: React.FC<AnimatedKNNPageProps> = (props) => {
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

  // Generate random positions for floating movie items
  const generateMovieItems = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 25 + Math.random() * 30,
      duration: 60 + Math.random() * 60,
      delay: Math.random() * 5,
      type: ['popcorn', 'ticket', 'film', 'star', 'camera'][Math.floor(Math.random() * 5)]
    }));
  };

  const movieItems = generateMovieItems(10);

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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 overflow-hidden rounded-xl">
          {movieItems.map((item) => (
            <motion.div
              key={item.id}
              className={`absolute movie-item movie-item-${item.type}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.size}px`,
                height: `${item.size}px`,
              }}
              animate={{
                x: [0, 30, -20, 10, 0],
                y: [0, -30, 20, -10, 0],
                rotate: [0, 60, 120, 180, 360]
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                delay: item.delay,
                ease: "linear",
                times: [0, 0.25, 0.5, 0.75, 1]
              }}
            />
          ))}
        </div>

        {/* Header section */}
        <motion.div 
          className="relative z-10 pt-6 pb-4 px-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-t-xl border-b border-purple-100"
          variants={itemVariants}
        >
          <motion.div variants={textAnimationVariants}>
            <AnimatedText 
              text={props.title} 
              className="text-2xl font-bold text-purple-800"
            />
          </motion.div>
          <motion.div 
            variants={textAnimationVariants}
            transition={{ delay: 0.2 }}
            className="text-purple-600 mt-2"
          >
            <AnimatedText text={props.description} />
          </motion.div>
        </motion.div>

        {/* Movie Genres */}
        <motion.div 
          className="relative z-10 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white bg-opacity-70 backdrop-blur-sm"
          variants={itemVariants}
        >
          {[
            { name: "Action", popularity: 0.85, icon: "🔥" },
            { name: "Comedy", popularity: 0.92, icon: "😂" },
            { name: "Drama", popularity: 0.78, icon: "🎭" },
            { name: "Sci-Fi", popularity: 0.83, icon: "🚀" }
          ].map((genre, index) => (
            <motion.div
              key={genre.name}
              className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 15px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              custom={index}
              variants={{
                animate: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.1 * index
                  }
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{genre.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">{genre.name}</h3>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${genre.popularity * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 + (0.1 * index) }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Popularity: {Math.round(genre.popularity * 100)}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Movie Recommendations Visualization */}
        <motion.div 
          className="relative z-10 p-4 bg-white bg-opacity-70 backdrop-blur-sm"
          variants={itemVariants}
        >
          <motion.h3 
            className="text-xl font-semibold text-purple-800 mb-4"
            variants={textAnimationVariants}
          >
            <AnimatedText text="How KNN Movie Recommendations Work" />
          </motion.h3>
          
          <div className="knn-visualization">
            <div className="knn-grid">
              <div className="knn-movie knn-your-movie">
                <div className="knn-movie-label">You</div>
              </div>
              
              <div className="knn-neighbors">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`knn-movie knn-neighbor knn-neighbor-${i+1}`}>
                    <div className="knn-movie-label">N{i+1}</div>
                  </div>
                ))}
              </div>
              
              <div className="knn-recommendations">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`knn-movie knn-recommendation knn-recommendation-${i+1}`}>
                    <div className="knn-movie-label">R{i+1}</div>
                  </div>
                ))}
              </div>
              
              <div className="knn-connection-lines">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`knn-line knn-line-${i+1}`}></div>
                ))}
              </div>
            </div>
          </div>
          
          <motion.p 
            className="text-sm text-gray-600 mt-3 text-center"
            variants={textAnimationVariants}
          >
            <AnimatedText text="KNN finds movies similar to ones you like by identifying your 'nearest neighbor' preferences" />
          </motion.p>
        </motion.div>

        {/* Recent Movies Section */}
        <motion.div 
          className="relative z-10 p-4 bg-white bg-opacity-70 backdrop-blur-sm"
          variants={itemVariants}
        >
          <motion.h3 
            className="text-xl font-semibold text-purple-800 mb-4"
            variants={textAnimationVariants}
          >
            <AnimatedText text="Popular Movie Categories" />
          </motion.h3>
          
          <div className="movie-categories">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                className="movie-category category-action"
                whileHover={{ scale: 1.03 }}
              >
                <h4>Action & Adventure</h4>
                <div className="category-rating">
                  <span>★★★★</span><span className="text-gray-300">★</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="movie-category category-comedy"
                whileHover={{ scale: 1.03 }}
              >
                <h4>Comedy</h4>
                <div className="category-rating">
                  <span>★★★★</span><span className="text-gray-300">★</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="movie-category category-drama"
                whileHover={{ scale: 1.03 }}
              >
                <h4>Drama</h4>
                <div className="category-rating">
                  <span>★★★★</span><span className="text-gray-300">★</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="movie-category category-scifi"
                whileHover={{ scale: 1.03 }}
              >
                <h4>Sci-Fi & Fantasy</h4>
                <div className="category-rating">
                  <span>★★★★</span><span className="text-gray-300">★</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="movie-category category-documentary"
                whileHover={{ scale: 1.03 }}
              >
                <h4>Documentary</h4>
                <div className="category-rating">
                  <span>★★★</span><span className="text-gray-300">★★</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="movie-category category-horror"
                whileHover={{ scale: 1.03 }}
              >
                <h4>Horror & Thriller</h4>
                <div className="category-rating">
                  <span>★★★</span><span className="text-gray-300">★★</span>
                </div>
              </motion.div>
            </div>
          </div>
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
            numericFields={[
              { name: 'action', label: 'Action (1-10)', defaultValue: 5 },
              { name: 'comedy', label: 'Comedy (1-10)', defaultValue: 5 },
              { name: 'drama', label: 'Drama (1-10)', defaultValue: 5 },
              { name: 'scifi', label: 'Sci-Fi (1-10)', defaultValue: 5 }
            ]}
            supportsCSV={true}
          />
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default AnimatedKNNPage; 