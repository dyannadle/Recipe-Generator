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

## 📖 Detailed Guides
- [Deployment Guide](./documents/DEPLOYMENT.md)
- [Backend Documentation](./Foodimg2Ing/README.md)

## 📄 License
MIT License - See [LICENSE](LICENSE) for details.

