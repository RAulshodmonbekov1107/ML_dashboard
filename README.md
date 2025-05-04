# ML Showcase Application

A full-stack machine learning showcase application demonstrating various ML models and techniques, including:

- Text Translation with Neural Machine Translation
- Classification Models
- Regression Models
- Neural Networks
- And more!

## Tech Stack

### Frontend
- React 19
- TypeScript
- TailwindCSS
- Framer Motion
- TensorFlow.js
- React Router
- Axios

### Backend
- Django 5.2
- Django REST Framework
- TensorFlow
- scikit-learn
- XGBoost
- Google Translate API

## Getting Started

### Prerequisites
- Docker and Docker Compose (for containerized deployment)
- Node.js 18+ and npm (for local frontend development)
- Python 3.10+ (for local backend development)

### Running with Docker (Recommended)

The easiest way to get started is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd ML

# Start the development environment
docker-compose up --build
```

This will start:
- Frontend React UI: http://localhost:3000
- Express API server: http://localhost:3002
- Backend Django API: http://localhost:8000/api/

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install googletrans==4.0.0-rc1 httpx==0.13.3
python manage.py migrate
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

#### Express Server Setup
```bash
cd frontend
npm install --legacy-peer-deps
node server.js
```

## Features

1. **Translation Model**:
   - Translates text between multiple languages
   - Uses Google Translate API with fallback to dictionary-based translation
   - Supports language auto-detection

2. **Classification Models**:
   - Text classification
   - KNN for recommendations
   - Logistic Regression for fraud detection
   - Naive Bayes for sentiment analysis
   - Decision Trees for loan approval

3. **Regression Models**:
   - Linear Regression for house price prediction
   - Multiple Linear Regression for medical cost prediction
   - General Regression for stock price prediction

4. **Neural Networks**:
   - Object detection
   - Text generation with LSTM
   - And more!

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Production Deployment

```bash
# Start the production environment
docker-compose -f docker-compose.prod.yml up --build -d
```

This will deploy the application with:
- Optimized production build of React
- Django with Gunicorn for production serving
- Nginx as a reverse proxy

## Architecture

The application follows a client-server architecture:
- Frontend React SPA communicates with the backend API
- Backend Django API serves model endpoints
- Express server provides additional API proxying capabilities

## License

[MIT License](LICENSE)

## Acknowledgements

- TensorFlow team for the amazing ML framework
- React team for the frontend library
- Django team for the backend framework
- And all the open-source libraries used in this project 