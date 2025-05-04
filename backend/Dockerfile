FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir googletrans==4.0.0-rc1 httpx==0.13.3 gunicorn

# Copy the rest of the application code
COPY . .

# Run migrations and collect static files
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

# Expose port for Django
EXPOSE 8000

# Run the server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"] 