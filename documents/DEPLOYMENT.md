# Recipe Generator - Complete Deployment Guide

This comprehensive guide covers deploying the Recipe Generator application from scratch using **Hugging Face Spaces** (recommended for free hosting with large AI models).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Deployment Strategy](#deployment-strategy)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Alternative Deployment Options](#alternative-deployment-options)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **Hugging Face Account**: Sign up at [huggingface.co](https://huggingface.co)
- **GitHub Account**: For version control (optional but recommended)

### Required Software
1. **Git & Git LFS**
   ```bash
   # Install Git LFS (required for large model file)
   git lfs install
   ```

2. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org)
   - Verify: `node --version`

3. **Python** (3.9 or higher)
   - Download from [python.org](https://python.org)
   - Verify: `python --version`

---

## Project Overview

### Architecture
```
Recipe-Generator/
├── frontend/          # React + Vite application
├── Foodimg2Ing/       # Flask backend with AI model
│   ├── data/          # Model files (~415MB)
│   ├── modules/       # AI model components
│   └── routes.py      # API endpoints
└── requirements.txt   # Python dependencies
```

### Key Components
- **Backend**: Flask API with PyTorch-based recipe generation model
- **Frontend**: React SPA with Tailwind CSS
- **Model**: Pre-trained transformer model (~415MB)

---

## Deployment Strategy

### Why Hugging Face Spaces?

| Feature | Hugging Face | Render | Railway | Vercel |
|---------|-------------|--------|---------|--------|
| **Free RAM** | 16GB | 512MB | 512MB | N/A |
| **Large Files** | ✅ Git LFS | ❌ | ❌ | ❌ |
| **Python + React** | ✅ Docker | ✅ | ✅ | Frontend only |
| **Cost** | Free | Free tier | Limited free | Free (Frontend) |

**Verdict**: Hugging Face Spaces is the only platform offering sufficient RAM (16GB) for free to run the 415MB model.

### Deployment Approach
We'll use a **monolith architecture** where Flask serves both the API and the built React frontend.

---

## Step-by-Step Deployment

### Phase 1: Prepare the Frontend

1. **Build the React Application**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   This creates a `dist` folder with optimized static files.

2. **Move Build to Backend**
   ```bash
   # Create static folder in backend if it doesn't exist
   mkdir -p ../Foodimg2Ing/static/react
   
   # Copy built files
   cp -r dist/* ../Foodimg2Ing/static/react/
   ```

### Phase 2: Configure Flask to Serve Frontend

1. **Update `Foodimg2Ing/routes.py`**
   
   Add this route to serve the React app:
   ```python
   from flask import send_from_directory
   import os
   
   @app.route("/", defaults={'path': ''})
   @app.route("/<path:path>")
   def serve_react(path):
       static_folder = os.path.join(app.root_path, 'static', 'react')
       if path != "" and os.path.exists(os.path.join(static_folder, path)):
           return send_from_directory(static_folder, path)
       else:
           return send_from_directory(static_folder, 'index.html')
   ```

2. **Update `Foodimg2Ing/__init__.py`**
   
   Ensure static folder is configured:
   ```python
   from flask import Flask
   from flask_cors import CORS
   
   app = Flask(__name__, 
               template_folder='Templates',
               static_folder='static/react')
   CORS(app)
   
   from Foodimg2Ing import routes
   ```

### Phase 3: Fix Requirements

1. **Update `requirements.txt`**
   
   Uncomment and fix PyTorch dependencies:
   ```txt
   Flask==2.2.2
   flask-cors==3.0.10
   werkzeug==2.2.2
   gunicorn==20.1.0
   
   # AI/ML Dependencies
   torch==2.0.1
   torchvision==0.15.2
   numpy==1.24.3
   Pillow==9.5.0
   matplotlib==3.7.1
   
   # Utils
   tqdm==4.65.0
   typing-extensions==4.5.0
   ```

### Phase 4: Create Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY Foodimg2Ing/ ./Foodimg2Ing/
COPY run.py .

# Expose port
EXPOSE 7860

# Run with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:7860", "--timeout", "120", "run:app"]
```

### Phase 5: Deploy to Hugging Face Spaces

1. **Create a New Space**
   - Go to [huggingface.co/spaces](https://huggingface.co/spaces)
   - Click "Create new Space"
   - Choose **Docker** as the SDK
   - Name your space (e.g., `recipe-generator`)

2. **Clone the Space Repository**
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/recipe-generator
   cd recipe-generator
   ```

3. **Copy Your Project Files**
   ```bash
   # Copy all files from your Recipe-Generator project
   cp -r /path/to/Recipe-Generator/* .
   ```

4. **Track Large Files with Git LFS**
   ```bash
   # Track the model file
   git lfs track "Foodimg2Ing/data/modelbest.ckpt"
   git lfs track "*.ckpt"
   
   # Add .gitattributes
   git add .gitattributes
   ```

5. **Create README.md for Hugging Face**
   
   Create `README.md` in the root:
   ```markdown
   ---
   title: Recipe Generator
   emoji: 🍳
   colorFrom: red
   colorTo: orange
   sdk: docker
   pinned: false
   ---
   
   # Recipe Generator
   
   AI-powered recipe generation from food images using deep learning.
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push
   ```

7. **Wait for Build**
   - Hugging Face will automatically build your Docker container
   - This may take 10-15 minutes
   - Monitor progress in the Space's "Logs" tab

8. **Access Your App**
   - Once built, your app will be available at:
   - `https://huggingface.co/spaces/YOUR_USERNAME/recipe-generator`

---

## Alternative Deployment Options

### Option A: Docker Compose (Local/VPS)

If deploying to your own server:

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  recipe-app:
    build: .
    ports:
      - "8000:7860"
    volumes:
      - ./Foodimg2Ing/data:/app/Foodimg2Ing/data
    environment:
      - FLASK_ENV=production
```

Run with:
```bash
docker-compose up -d
```

### Option B: Manual VPS Deployment

See the detailed VPS deployment guide in `DEPLOYMENT_VPS.md`.

---

## Troubleshooting

### Issue: Model File Too Large for Git

**Solution**: Use Git LFS
```bash
git lfs install
git lfs track "*.ckpt"
git add .gitattributes
git add Foodimg2Ing/data/modelbest.ckpt
git commit -m "Add model with LFS"
```

### Issue: Out of Memory Error

**Symptoms**: App crashes with "Killed" or OOM errors

**Solutions**:
1. Ensure you're using Hugging Face Spaces (16GB RAM)
2. Reduce batch size in model inference
3. Use CPU instead of GPU (already default)

### Issue: Frontend Not Loading

**Symptoms**: 404 errors or blank page

**Checklist**:
1. Verify `dist` folder was copied to `Foodimg2Ing/static/react`
2. Check Flask route for serving static files
3. Ensure `static_folder` is set correctly in `__init__.py`

### Issue: CORS Errors

**Solution**: Ensure `flask-cors` is installed and configured:
```python
from flask_cors import CORS
CORS(app)
```

### Issue: Slow Cold Starts

**Explanation**: Hugging Face Spaces may sleep after inactivity

**Solutions**:
- Upgrade to persistent hardware (paid)
- Accept the 30-60 second cold start on free tier

---

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Can upload an image
- [ ] Recipe generation works
- [ ] Frontend displays correctly
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

---

## Maintenance

### Updating the App

1. Make changes locally
2. Test thoroughly
3. Commit and push to Hugging Face Space:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```

### Monitoring

- Check Space logs regularly
- Monitor usage in Hugging Face dashboard
- Set up error tracking (optional)

---

## Support

For issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Hugging Face Spaces documentation
3. Check application logs in the Space

---

**Last Updated**: January 2026
