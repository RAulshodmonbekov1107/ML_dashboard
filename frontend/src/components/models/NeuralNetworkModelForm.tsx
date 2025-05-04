import React from 'react';
import EnhancedNeuralNetworkModelForm from './EnhancedNeuralNetworkModelForm';

interface NeuralNetworkModelFormProps {
  modelEndpoint?: string;
  title?: string;
  description?: string;
}

const NeuralNetworkModelForm: React.FC<NeuralNetworkModelFormProps> = (props) => {
  const defaultProps = {
    modelEndpoint: props.modelEndpoint || 'neural-network',
    title: props.title || 'Neural Network Image Recognition',
    description: props.description || 'Recognize objects in images using deep neural networks'
  };

  return <EnhancedNeuralNetworkModelForm {...defaultProps} />;
};

export default NeuralNetworkModelForm; 