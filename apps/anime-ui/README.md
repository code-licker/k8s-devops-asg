# Anime UI Frontend

A React + TypeScript application built with Vite and styled with clean, professional dark-mode CSS. It connects to the `anime-api` backend to fetch, display, and paginate anime data.

---

## How to Run Locally (Development Mode)

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start the Dev Server**:
   ```bash
   npm run dev
   ```
   Open the URL printed in the terminal (usually [http://localhost:5003/](http://localhost:5003/)).

*Note: Make sure your `anime-api` backend is running on `http://localhost:5001` so the UI can fetch data.*

---

## How to Build and Run via Docker (Production Mode)

The UI uses a multi-stage Docker build to compile the React code and serve the static files using Nginx.

1. **Build the Docker Image**:
   * **For Kubernetes/Single-Origin Deployments (relative paths)**:
     ```bash
     docker build -t anime-ui:latest .
     ```
   * **For Custom External Backend (e.g. mapping to host port 5001)**:
     ```bash
     docker build --build-arg ANIME_API_URL=http://localhost:5001 -t anime-ui:latest .
     ```

2. **Run the Container**:
   Map container port `5002` to host port `5002`:
   ```bash
   docker run -p 5002:5002 anime-ui:latest
   ```
   Open [http://localhost:5002/](http://localhost:5002/) to view the application.