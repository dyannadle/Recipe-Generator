# PURPOSE: Use a lightweight, official Python 3.9 image as the base.
# WHY: 'slim' reduces the final image size by excluding unnecessary packages, leading to faster deployments.
# ALTERNATIVE: Use 'python:3.9' (larger, includes more tools) or 'alpine' (even smaller, but can have compatibility issues with C-extensions).
# IMPACT: Sets the runtime environment for the backend server.
FROM python:3.9-slim

# PURPOSE: Set the primary working directory inside the container.
# WHY: Ensures all subsequent COPY and RUN commands happen in a predictable location (/app).
# IMPACT: Organizes the container's internal filesystem.
WORKDIR /app

# PURPOSE: Install essential Linux system libraries.
# WHY: 'libgl1-mesa-glx' and 'libglib2.0-0' are required by OpenCV (often used in image processing) to handle food images.
# ALTERNATIVE: Install these inside a custom script, but doing it in the Dockerfile ensures they are part of the immutable image.
# IMPACT: Prevents "ImportError: libGL.so.1 not found" during runtime.
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# PURPOSE: Copy the dependency list into the container.
# WHY: We copy ONLY the requirements file first to leverage Docker's 'layer caching'. This prevents re-installing all packages every time a line of code changes.
# IMPACT: Significantly speeds up subsequent builds.
COPY requirements.txt .

# PURPOSE: Install Python packages defined in requirements.txt.
# WHY: 'pip install' prepares the application's external library environment.
# IMPACT: Resolves all project dependencies (Flask, SQLAlchemy, etc.).
RUN pip install --no-cache-dir -r requirements.txt

# PURPOSE: Copy the backend source code into the container.
# WHY: Transfers the actual application logic (routes, models, utilities) into the runtime environment.
# IMPACT: Populates the /app/Foodimg2Ing directory.
COPY Foodimg2Ing/ ./Foodimg2Ing/

# PURPOSE: Copy the entry point script.
# WHY: Transfers the run.py file which initializes the Flask app.
# IMPACT: Makes the application bootable.
COPY run.py .

# PURPOSE: Document that the container listens on port 7860.
# WHY: Provides metadata for hosting platforms (like Hugging Face Spaces) to know how to route traffic.
# IMPACT: Communication metadata.
EXPOSE 7860

# PURPOSE: Define the command to start the production web server.
# WHY: 'gunicorn' is a robust, production-grade WSGI server. '0.0.0.0:7860' allows external access.
# ALTERNATIVE: 'python run.py' (suitable ONLY for development).
# IMPACT: Starts the live application inside the container.
CMD ["gunicorn", "-b", "0.0.0.0:7860", "--timeout", "120", "run:app"]

