# Use official Python image
FROM python:3.11.8

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# Copy project code
COPY . /app/

# Expose port 8000
EXPOSE 8000

# Run migrations, collectstatic, then start server
CMD bash -c "python manage.py migrate && python manage.py collectstatic --noinput && python manage.py createsuperuser --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:8000"
