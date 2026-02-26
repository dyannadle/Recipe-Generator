---
title: SnapCook AI - Recipe Generator
emoji: 🍳
colorFrom: red
colorTo: orange
sdk: docker
pinned: false
---

# SnapCook AI: Food Image to Recipe Generator 🍳

![Banner](banner.png)

**Transform your food photos into culinary masterpieces.** SnapCook uses state-of-the-art Transformer models to identify ingredients and generate step-by-step instructions instantly.

## 🚀 Key Features

- 📸 **AI Image Recognition**: Upload any food photo and get an instant recipe.
- 🥗 **Nutritional Estimation**: Get calorie counts and macro-nutrients automatically.
- 🛒 **Smart Shopping List**: Save ingredients directly into an integrated checklist.
- 🔐 **Secure Accounts**: JWT-powered authentication to save your favorite recipes.
- 🌓 **Premium UI**: Sleek, modern design with full Dark Mode support and smooth micro-animations.
- 🐳 **Docker Ready**: Fully containerized for easy deployment to Hugging Face Spaces or VPS.

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Flask (Python), SQLAlchemy ORM, Flask-Limiter |
| **Authentication** | JWT (JSON Web Tokens) |
| **AI/ML Engine** | PyTorch, Transformer Models (ckpt) |
| **Infrastructure** | Docker, Docker Compose, Hugging Face Spaces |

## 🚦 Quick Start

### 1. Prerequisites
- Docker (for easy setup) OR Python 3.9+ and Node.js 18+

### 2. Environment Setup
Rename `.env.example` to `.env` and fill in your secrets.

### 3. Run with Docker (Recommended)
```bash
docker-compose up -d
```
Access the app at `http://localhost:8000`.

## 📖 How to Use

1.  **Upload**: Select or drag-and-drop an image of a prepared dish into the scanner.
2.  **Generate**: Click "Predict" and wait for the AI to transcribe the image into a recipe.
3.  **Refine**: (Optional) Use the manually override fields if you want to tweak the title or ingredients.
4.  **Save & Shop**: Click "Save Recipe" to add it to your dashboard, or "Add to Shopping List" to sync ingredients to your checklist.

## ⚙️ Installation & Setup

### Option 1: Docker (Fastest)
```bash
docker-compose up --build
```

### Option 2: Manual Setup (Development)

**1. Backend (Flask)**
```bash
cd Foodimg2Ing
python -m venv venv
source venv/bin/scripts/activate  # Windows: venv\Scripts\activate
pip install -r ../requirements.txt
python ../run.py
```

**2. Frontend (React)**
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation
- [Recommended Free Deployment (Hugging Face)](./documents/FREE_DEPLOYMENT_GUIDE.md)
- [Complete General Deployment Guide](./documents/DEPLOYMENT.md)
- [Backend Documentation](./Foodimg2Ing/README.md)
- [Annotated Codebase Walkthrough](file:///C:/Users/Deepak%20Yannadle/.gemini/antigravity/brain/c602dfd9-c675-44d0-838d-8e04f2e9fd43/walkthrough.md)

## 📄 License
MIT License - See [LICENSE](LICENSE) for details.

