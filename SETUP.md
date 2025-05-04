# ML Showcase Setup Instructions

This document provides detailed setup instructions for the ML Showcase application.

## Backend Setup

### 1. Create a virtual environment (optional but recommended)

```bash
# On Linux/Mac
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
.\venv\Scripts\activate
```

### 2. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run migrations

```bash
python manage.py migrate
```

### 4. Train the ML models

```bash
python train_models.py
```

This script will train all 12 machine learning models and save them to the `/models` directory. This might take some time, especially for the neural network models.

### 5. Start the Django server

```bash
python manage.py runserver
```

The backend server will be available at http://localhost:8000/api/

## Frontend Setup

### 1. Install Node.js dependencies

```bash
cd frontend
npm install
```

### 2. Start the development server

```bash
npm start
```

The React application will be available at http://localhost:3000/

## Troubleshooting

### Common Issues

#### Backend

1. **Missing dependencies**
   - Ensure all packages from requirements.txt are installed
   - Some packages might require additional system dependencies

2. **Model training failures**
   - Check Python and dependency versions match the requirements
   - Ensure you have enough disk space for model storage

3. **API errors**
   - Verify the Django server is running
   - Check the models directory exists and contains trained models

#### Frontend

1. **Build errors**
   - Clear node_modules and reinstall dependencies
   - Update npm if you encounter compatibility issues

2. **API connection issues**
   - Verify the backend URL in `frontend/src/services/api.ts`
   - Check CORS settings if running on different domains

3. **Rendering issues**
   - Clear browser cache and reload
   - Check browser console for JavaScript errors

## Deployment Tips

### For Production Deployment

1. Set Django `DEBUG = False` in production
2. Configure proper database settings
3. Use a production web server (Gunicorn, uWSGI)
4. Build the React app with `npm run build`
5. Serve static files from a CDN or web server

### Docker Deployment

A `docker-compose.yml` file will be added in the future for easier deployment. 