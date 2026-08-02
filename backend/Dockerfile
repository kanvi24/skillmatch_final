# Use a official Python 3.12 slim image
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system utilities needed during build
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium and all its required OS-level dependencies
RUN playwright install chromium --with-deps

# Copy the rest of the application files
COPY . .

# Expose port (Render defaults to 10000)
EXPOSE 10000

# Start the application using Gunicorn, binding to the PORT environment variable
CMD ["sh", "-c", "gunicorn app.config.wsgi:application --bind 0.0.0.0:${PORT:-10000}"]
