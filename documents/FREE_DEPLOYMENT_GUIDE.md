# ☁️ Free Deployment Guide: Hugging Face Spaces

Based on your project's requirements (specifically the **415MB AI model** and **PyTorch** dependencies), the best free platform is **Hugging Face Spaces**.

### 🏆 Why Hugging Face?
*   **16GB RAM for Free**: Most other free tiers (Render, Railway) only give 512MB, which will crash your AI model.
*   **Git LFS Support**: Handles the large `.ckpt` model file perfectly.
*   **Docker SDK**: Runs your existing `Dockerfile` without any changes.

---

## 🚀 Step-by-Step Deployment

### Phase 1: Preparation
1.  **Create Account**: Sign up at [huggingface.co](https://huggingface.co).
2.  **Create Space**: 
    *   Click **New Space**.
    *   Name it (e.g., `snapcook-ai`).
    *   **SDK**: Select **Docker**.
    *   **Hardware**: Choose **CPU Basic (Free)** - *This gives you 16GB RAM.*
    *   **Visibility**: Public or Private.

### Phase 2: Git LFS (Critical)
The model file is too large for standard Git. You MUST use Git LFS.
1.  Open your terminal in the project root.
2.  Install LFS: `git lfs install`
3.  Track model files: `git lfs track "*.ckpt"`
4.  Add attributes: `git add .gitattributes`

### Phase 3: Pushing to Hugging Face
1.  **Clone your Space** (it will be empty):
    ```bash
    git clone https://huggingface.co/spaces/YOUR_USERNAME/snapcook-ai
    ```
2.  **Copy Files**: Move all files from your `Recipe-Generator` folder into the newly cloned `snapcook-ai` folder.
3.  **Environment Setup**:
    *   Ensure `.env.example` is in the root.
    *   On the Hugging Face website, go to **Settings** -> **Variables and secrets**.
    *   Add your `SECRET_KEY` and `JWT_SECRET_KEY` as secrets.
4.  **Deploy**:
    ```bash
    git add .
    git commit -m "Initial AI Deployment"
    git push origin main
    ```

### Phase 4: Monitor & Test
1.  Go to the **Logs** tab in your Hugging Face Space.
2.  Wait for the Docker build to finish (takes ~5-10 minutes).
3.  Once the status turns **Running**, open the App!

---

## 🛠️ Performance Tips
> [!TIP]
> **Cold Starts**: The free tier "sleeps" after 48 hours of inactivity. The first person to visit after a while might see a 60-second boot-up time while the model loads into RAM.

> [!IMPORTANT]
> **Port Mapping**: Hugging Face expects the app on port **7860**. I have already pre-configured your [Dockerfile](file:///d:/Recipe-Generator/Dockerfile) and [README.md](file:///d:/Recipe-Generator/README.md) to use this port.
