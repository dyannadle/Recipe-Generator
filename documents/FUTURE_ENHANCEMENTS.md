# 🚀 Future Enhancement Roadmap: SnapCook AI

This document outlines the strategic vision for the next phases of development for the Recipe Generator platform.

---

## 🛠️ Phase 1: Enhanced AI & Personalization
*   **LLM Integration**: Transition from static Transformer models to dynamic LLMs (like GPT-4o-mini or Llama 3) for more creative and natural-sounding cooking instructions.
*   **Voice Assistant**: Implement a hands-free "Cooking Mode" using Web Speech API to read instructions aloud.
*   **Dietary Profiling**: Advanced filtering that automatically excludes allergens (nuts, gluten) from generated instructions based on user profiles.

## 🤝 Phase 2: Social & Community Features
*   **Public Recipe Feed**: A "Discover" page where users can share their high-quality generated recipes.
*   **Rating System**: Allow the community to rate and comment on the accuracy of AI-generated recipes.
*   **Chef Profiles**: Public user profiles displaying a curated collection of "Signature Dishes."

## 📱 Phase 3: Mobile & UX Optimization
*   **PWA Support**: Transform the site into a Progressive Web App for offline access to the shopping list.
*   **Pantry Manager**: A feature to track what ingredients you already have, allowing the AI to suggest recipes based on "Image + Inventory."
*   **Kitchen Timer Integration**: Build-in timers directly into the recipe steps for easier multi-tasking.

## ⚙️ Phase 4: Enterprise Infrastructure
*   **Managed Database**: Migration from SQLite to **PostgreSQL** (Supabase or AWS RDS) for better performance and scaling.
*   **Image Lifecycle Management**: Automated cron jobs to clean up `demo_imgs` older than 24 hours to save server space.
*   **Global CDN**: Deploy static assets via Cloudflare to ensure fast load times for international users.

---

## 💡 How to Contribute
If you're a developer interested in picking up one of these "Future" tasks, please check our [GitHub Issues](https://github.com/dyannadle/Recipe-Generator/issues) or reach out via the community discussion board!
