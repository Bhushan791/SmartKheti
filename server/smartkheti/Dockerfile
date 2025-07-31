# Use official Python 3.8.18 image
FROM python:3.8.18

# Set working directory in container
WORKDIR /app

# Copy requirements.txt into container
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# Copy all project files into container
COPY . .

# Expose port 8000 (default Django port)
EXPOSE 8000

# Start Gunicorn server with your Django wsgi application
CMD ["sh", "-c", "gunicorn core.wsgi:application --bind 0.0.0.0:8000"]