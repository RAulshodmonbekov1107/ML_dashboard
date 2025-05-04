import React from 'react';
import RegressionModelForm from './RegressionModelForm';
import ClassificationModelForm from './ClassificationModelForm';
import NeuralNetworkModelForm from './NeuralNetworkModelForm';
import RNNModelForm from './RNNModelForm';
import LSTMModelForm from './LSTMModelForm';

export type ModelFormProps = {
  modelEndpoint: string;
  title: string;
  description: string;
};

type ModelFormComponent = React.FC<ModelFormProps>;

// Linear Regression - Housing prices
export const LinearRegressionModelForm: ModelFormComponent = (props) => (
  <RegressionModelForm
    {...props}
    inputFields={[
      { name: 'sqft', label: 'Square Footage', defaultValue: 1500 }
    ]}
  />
);

// Linear Regression - Sales prediction
export const LinearRegressionSalesModelForm: ModelFormComponent = (props) => (
  <RegressionModelForm
    {...props}
    inputFields={[
      { name: 'advertising_spend', label: 'Advertising Spend ($)', defaultValue: 1000 }
    ]}
  />
);

// Multiple Linear Regression - Medical costs
export const MultipleLinearRegressionModelForm: ModelFormComponent = (props) => (
  <RegressionModelForm
    {...props}
    inputFields={[
      { name: 'age', label: 'Age', defaultValue: 35 },
      { name: 'bmi', label: 'BMI', defaultValue: 25 },
      { name: 'smoker', label: 'Smoker (0/1)', defaultValue: 0 }
    ]}
    supportsCSV={true}
    targetColumn="cost"
  />
);

// General Regression - Stock prediction
export const GeneralRegressionModelForm: ModelFormComponent = (props) => (
  <RegressionModelForm
    {...props}
    inputFields={[
      { name: 'prev_price', label: 'Previous Price ($)', defaultValue: 100 },
      { name: 'volume', label: 'Trading Volume', defaultValue: 10000 },
      { name: 'market_index', label: 'Market Index', defaultValue: 3000 }
    ]}
    supportsCSV={true}
    targetColumn="price"
  />
);

// Classification - General
export const ClassificationModelForm: ModelFormComponent = (props) => (
  <ClassificationModelForm
    {...props}
    supportsText={true}
    supportsCSV={true}
    textField={{
      name: 'text',
      label: 'Email Content',
      placeholder: 'Enter email text to classify as spam or not...'
    }}
  />
);

// KNN - Movie recommendations
export const KNNModelForm: ModelFormComponent = (props) => (
  <ClassificationModelForm
    {...props}
    numericFields={[
      { name: 'action', label: 'Action (1-10)', defaultValue: 5 },
      { name: 'comedy', label: 'Comedy (1-10)', defaultValue: 5 },
      { name: 'drama', label: 'Drama (1-10)', defaultValue: 5 },
      { name: 'scifi', label: 'Sci-Fi (1-10)', defaultValue: 5 }
    ]}
    supportsCSV={true}
  />
);

// Logistic Regression - Credit card fraud
export const LogisticRegressionModelForm: ModelFormComponent = (props) => (
  <ClassificationModelForm
    {...props}
    numericFields={[
      { name: 'amount', label: 'Transaction Amount ($)', defaultValue: 100 },
      { name: 'frequency', label: 'Recent Transaction Frequency', defaultValue: 5 },
      { name: 'location_diff', label: 'Location Difference (miles)', defaultValue: 0 }
    ]}
    supportsCSV={true}
  />
);

// Naive Bayes - Sentiment analysis
export const NaiveBayesModelForm: ModelFormComponent = (props) => (
  <ClassificationModelForm
    {...props}
    supportsText={true}
    textField={{
      name: 'text',
      label: 'Text for Sentiment Analysis',
      placeholder: 'Enter text to analyze the sentiment...'
    }}
  />
);

// Decision Tree - Loan approval
export const DecisionTreeModelForm: ModelFormComponent = (props) => (
  <ClassificationModelForm
    {...props}
    numericFields={[
      { name: 'income', label: 'Annual Income ($)', defaultValue: 50000 },
      { name: 'loan_amount', label: 'Loan Amount ($)', defaultValue: 200000 },
      { name: 'credit_score', label: 'Credit Score', defaultValue: 700 },
      { name: 'debt_to_income', label: 'Debt-to-Income Ratio (%)', defaultValue: 30 }
    ]}
  />
);

// Random Forest - Retail Customer Behavior
export const RandomForestModelForm: ModelFormComponent = (props) => (
  <ClassificationModelForm
    {...props}
    numericFields={[
      { name: 'age', label: 'Customer Age', defaultValue: 35 },
      { name: 'income', label: 'Annual Income ($)', defaultValue: 75000 },
      { name: 'previous_purchases', label: 'Previous Purchases', defaultValue: 12 },
      { name: 'average_basket_value', label: 'Average Basket Value ($)', defaultValue: 150 },
      { name: 'days_since_last_purchase', label: 'Days Since Last Purchase', defaultValue: 14 }
    ]}
    supportsCSV={true}
  />
);

export const AdaBoostModelForm: ModelFormComponent = RandomForestModelForm;
export const XGBoostModelForm: ModelFormComponent = RandomForestModelForm;

// Neural Network - Image classification
export const NeuralNetworkModelForm: ModelFormComponent = NeuralNetworkModelForm;

// RNN - Speech to text
export const RNNModelForm: ModelFormComponent = RNNModelForm;

// LSTM - Text generation
export const LSTMModelForm: ModelFormComponent = LSTMModelForm;

// Translation
export const TranslationModelForm: ModelFormComponent = (props) => (
  <LSTMModelForm
    {...props}
  />
); 