# SnapCook AI: Cross-Modal Food Recipe Generator 🍳

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**Transform your food photography into culinary reality.** SnapCook AI leverages state-of-the-art **Inverse Cooking** Transformers to identify ingredients and generate step-by-step instructions from a single photo.

---

## 🚀 Key Features

*   📸 **Inverse Cooking Engine**: Sophisticated Cross-Modal Transformer that "sees" ingredients and transcribes them into recipes.
*   🥗 **Dynamic Nutritional Labels**: Instant macro-nutrient estimation (Calories, Protein, Carbs, Fat) per identified dish.
*   🛒 **Smart Shopping List**: Sync identified ingredients directly to a persistent, manageable checklist.
*   🔐 **Secure User Hub**: JWT-powered authentication to save, rate, and track your culinary history.
*   🌓 **Premium UI/UX**: Modern, responsive interface with full Dark Mode support and smooth Framer Motion animations.

---

## 🧠 How It Works

SnapCook AI operates on a **Cross-Modal Transformer** architecture:
1.  **Image Encoder (CNN)**: Extracts deep visual features from the uploaded food image.
2.  **Ingredient Predictor**: A multi-head attention mechanism predicts ingredients using a specialized loss function (**SoftIoU** and **Cardinality Penalty**).
3.  **Instruction Decoder**: An autoregressive transformer decodes sequential cooking steps based on the predicted ingredient embeddings and visual context.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Flask (Python), SQLAlchemy ORM, Flask-Limiter, Flask-Caching |
| **AI / ML** | PyTorch, Cross-Modal Transformers, CNN, NumPy, Pillow |
| **Database** | PostgreSQL / SQLite, SQLAlchemy |
| **DevOps** | Docker, Docker Compose, Nginx, Hugging Face Spaces |

---

## 📂 Project Structure

```text
.
├── Foodimg2Ing/            # Backend (Flask Application)
│   ├── modules/            # Transformer & CNN Layer Definitions
│   ├── utils/              # Security, Metrics, and Helper Logic
│   ├── data/               # AI Model Weights (.ckpt) and Vocabularies
│   └── static/             # Processed Demo Images
├── frontend/               # Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── components/     # UI Components (ImageUpload, RecipeCard, etc.)
│   │   └── contexts/       # Auth and Global State Management
├── documents/              # Roadmap, Deployment Guides, and API Docs
├── Dockerfile              # Docker Build Instructions
└── docker-compose.yml      # Multi-container Orchestration
```

---

## 🚦 Quick Start

### 1. Requirements
*   Docker & Docker Compose (Recommended)
*   **OR** Python 3.9+ & Node.js 18+

### 2. Setup
1. Clone the repository.
2. Rename `.env.example` to `.env` and configure your keys.

### 3. Run with Docker
```bash
docker-compose up --build
```
The app will be available at `http://localhost:8000`.

---

## 📖 Deployment & Docs
*   [Deployment Guide](./documents/DEPLOYMENT.md)
*   [Future Roadmap](./documents/FUTURE_ENHANCEMENTS.md)
*   [Machine Learning Details](./Foodimg2Ing/README.md)

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
