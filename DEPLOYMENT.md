# Deployment Guide for ML Showcase Application

This guide provides instructions for deploying the ML Showcase application using Docker and docker-compose.

## Prerequisites

- Docker and Docker Compose installed on your server
- Git for cloning the repository
- Basic knowledge of Docker and containerization

## Development Deployment

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ML
```

### 2. Start the development environment

```bash
docker-compose up --build
```

This will start:
- The Django backend on port 8000
- The React development server on port 3000
- The Express server on port 3002

### 3. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Django admin: http://localhost:8000/admin/
- Express API: http://localhost:3002

## Production Deployment

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ML
```

### 2. Set up Nginx directories

```bash
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
```

The SSL directory is where you'll place your SSL certificates if using HTTPS.

### 3. Start the production environment

```bash
docker-compose -f docker-compose.prod.yml up --build
```

This will start:
- The Django backend with Gunicorn
- The React frontend built for production
- Nginx as a reverse proxy on ports 80 and 443

### 4. Access the application

- Production site: http://localhost/ or http://your-domain.com/
- Backend API: http://localhost/api/ or http://your-domain.com/api/
- Django admin: http://localhost/admin/ or http://your-domain.com/admin/

## Port Usage

The application uses the following ports:
- 80: HTTP (Nginx)
- 443: HTTPS (Nginx)
- 8000: Django Backend
- 3000: React Dev Server (development only)
- 3002: Express Server

## Environment Variables

You can customize the deployment by setting environment variables:

```bash
# Create a .env file with your configuration
cp .env.example .env
# Edit the .env file with your settings
nano .env
```

Important environment variables:

- `DEBUG`: Set to False in production
- `SECRET_KEY`: Django secret key (should be changed in production)
- `DJANGO_ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `REACT_APP_API_URL`: URL for the frontend to connect to the backend API
- `NODE_ENV`: Set to 'production' for production builds

## SSL Setup

To enable HTTPS:

1. Place your SSL certificates in the `nginx/ssl` directory:
   - `fullchain.pem`: Your full certificate chain
   - `privkey.pem`: Your private key

2. Uncomment the HTTPS server section in `nginx/conf.d/default.conf`

## Database Setup

By default, the application uses SQLite. To use PostgreSQL or another database:

1. Uncomment and configure the database settings in your environment file
2. Add a database service to your docker-compose.prod.yml
3. Update the Django settings to use the configured database

## Troubleshooting

### Container not starting

Check the logs to see what's happening:

```bash
docker-compose logs [service_name]
```

### Port already in use

If you see errors about ports already in use, you can modify the port mappings in the docker-compose.yml file:

```yaml
ports:
  - "8001:8000"  # Change 8000 to 8001 for the backend
  - "3003:3000"  # Change 3000 to 3003 for React
  - "3004:3001"  # Change 3002 to 3004 for Express
```

### Static files not loading

Ensure that you've collected static files correctly:

```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

### SSL not working

Check your certificate paths and permissions:

```bash
docker-compose exec nginx ls -la /etc/nginx/ssl
```

## Maintenance

### Updating the application

```bash
git pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

### Backup

Backup your volumes regularly:

```bash
docker run --rm -v ml_backend_media:/source -v $(pwd)/backups:/backup alpine tar -czf /backup/media_backup.tar.gz /source
docker run --rm -v ml_backend_static:/source -v $(pwd)/backups:/backup alpine tar -czf /backup/static_backup.tar.gz /source
``` 