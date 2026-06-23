# DevOps Kubernetes Assignment (AniCache Hub)

- Read the full assignment details [here](problem-statement.md)
- Read the app description and how to run them locally at [apps/README.md](apps/README.md) 

## High Level Summary of my approach

This repository contains a 3-tier web application (React UI, Node.js API, and Postgres DB) and the Kubernetes manifests to deploy it to Azure Kubernetes Service (AKS).

## Table of Contents
- [How the App Works](#how-the-app-works)
- [AKS Setup](#aks-setup)
- [Docker Images](#docker-images)
- [Project Structure & Paths](#project-structure--paths)
  - [Source Code](#source-code)
  - [Kubernetes Manifests (k8s)](#kubernetes-manifests-k8s)
- [How to Deploy on AKS](#how-to-deploy-on-aks)
- [Sample API Calls](#sample-api-calls)

---

## How the App Works

The app is called **AniCache Hub**. It fetches and displays details of different anime from the AniList API. 

* **Caching**: When you query an anime by its AniList ID, the API first checks the local Postgres database. If it's not there, it fetches it from AniList, caches it in Postgres, and returns the details.
* **Browse Samples**: Next to the search bar is a "Browse Sample IDs" button. It opens a modal with a table of ~1100 sample anime. You can filter them by name or ID, click one, and it auto-fills the search input.
* **HPA Load Testing**: There is a toggle button in the header ("HPA Test: Increase Load"). Clicking it triggers a background CPU busy loop on the API. This is used to test GKE/AKS Horizontal Pod Autoscaling (HPA) without blocking standard web server requests.
* **Health Checks**: The API has `/health` (checks Postgres connection) and `/version` endpoints for Kubernetes probes.

---

## AKS Setup

The app runs on **Azure Kubernetes Service (AKS)** behind an Nginx Ingress Controller. 
The Ingress controller routes traffic:
* `/api` routes to the backend service.
* `/` routes to the frontend React UI.
* The database is kept private inside the cluster and cannot be accessed externally.

---

## Docker Images

The container images are hosted on **GitHub Container Registry (GHCR)**:

* **Frontend UI**: `ghcr.io/code-licker/nagp-2026-anime-ui:2.0.0`
* **Backend API**: `ghcr.io/code-licker/nagp-2026-anime-api:1.0.0`
* **Postgres DB (Pre-seeded)**: `ghcr.io/code-licker/nagp-2026-anime-db:1.0.0`

---

## Project Structure & Paths

### Source Code
* **Postgres Setup**: [apps/anime-db](file:///home/rohanb/code/k8s-nagp-devops-asg/apps/anime-db)
* **Node.js Express API**: [apps/anime-api](file:///home/rohanb/code/k8s-nagp-devops-asg/apps/anime-api)
* **React Web UI**: [apps/anime-ui](file:///home/rohanb/code/k8s-nagp-devops-asg/apps/anime-ui)

### Kubernetes Manifests (k8s)
The files are organized inside the [k8s](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s) directory:

#### 1. Database Tier (`k8s/db/`)
* [db-postgres-secret.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/db/db-postgres-secret.yaml) - Secrets containing database user credentials and password.
* [db-pvc.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/db/db-pvc.yaml) - Request for a 1Gi persistent volume.
* [db-statefulset.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/db/db-statefulset.yaml) - StatefulSet (1 replica) pulling the pre-seeded DB image and mounting the persistent disk.
* [db-service.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/db/db-service.yaml) - ClusterIP service exposing the database internally on port 5432.

#### 2. Backend API Tier (`k8s/api/`)
* [api-configmap.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/api/api-configmap.yaml) - Env variables like database hostname, port, and API port.
* [api-deployment.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/api/api-deployment.yaml) - Deployment (4 replicas) with rolling update strategy, CPU/memory limits, and liveness/readiness probes.
* [api-service.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/api/api-service.yaml) - Service exposing the API internally on port 5001.
* [api-hpa.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/api/api-hpa.yaml) - Auto-scaler to scale the API between 4 to 10 pods when CPU usage passes 60%.

#### 3. Frontend UI Tier (`k8s/ui/`)
* [ui-deployment.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/ui/ui-deployment.yaml) - Deployment (2 replicas) serving the React UI.
* [ui-service.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/ui/ui-service.yaml) - Service exposing the UI internally on port 5002.

#### 4. Cluster Ingress
* [ingress.yaml](file:///home/rohanb/code/k8s-nagp-devops-asg/k8s/ingress.yaml) - Ingress rule using the `nginx` class to direct traffic to the UI (`/`) and API (`/api`).

---

## How to Deploy on AKS

Copy and run these commands in order to deploy the application:

```bash
# 1. Apply the database credentials, storage, pods, and service
kubectl apply -f ./k8s/db/db-postgres-secret.yaml
kubectl apply -f ./k8s/db/db-pvc.yaml
kubectl apply -f ./k8s/db/db-statefulset.yaml
kubectl apply -f ./k8s/db/db-service.yaml

# 2. Apply API configurations, deployment, service, and HPA autoscaling
kubectl apply -f ./k8s/api/api-configmap.yaml
kubectl apply -f ./k8s/api/api-deployment.yaml
kubectl apply -f ./k8s/api/api-service.yaml
kubectl apply -f ./k8s/api/api-hpa.yaml

# 3. Apply UI frontend deployment and service
kubectl apply -f ./k8s/ui/ui-deployment.yaml
kubectl apply -f ./k8s/ui/ui-service.yaml

# 4. Install the Nginx Ingress Controller on your cluster
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# 5. Apply Ingress routing rules
kubectl apply -f ./k8s/ingress.yaml
```

---

## Sample API Calls

You can query the backend endpoints directly using the cluster's public ingress address `http://135.235.144.73/`:

### 1. Get all cached anime in local DB
```bash
curl http://135.235.144.73/api/anime
```

### 2. Fetch and cache a specific anime (e.g. One Piece, ID: 21)
This queries AniList API (on cache miss), saves it to Postgres, and returns it:
```bash
curl http://135.235.144.73/api/anime/21
```

### 3. Get characters list for an anime (e.g. ID: 21)
```bash
curl http://135.235.144.73/api/anime/21/characters?page=1
```

### 4. Toggle HPA Load Test Simulation
Since requests are load-balanced across multiple replica pods, use a simple parallel loop to trigger load on all replicas at once:

* **Start generating load**:
  ```bash
  for i in {1..15}; do curl -s -X POST -H "Content-Type: application/json" -d '{"active":true}' http://135.235.144.73/api/load & done; wait
  ```
* **Stop generating load**:
  ```bash
  for i in {1..15}; do curl -s -X POST -H "Content-Type: application/json" -d '{"active":false}' http://135.235.144.73/api/load & done; wait
  ```
* **Check load status**:
  ```bash
  curl http://135.235.144.73/api/load
  ```

### 5. Health and Version Probes
* **Health Check** (verifies Postgres connection status):
  ```bash
  curl http://135.235.144.73/api/health
  ```
* **Version Check**:
  ```bash
  curl http://135.235.144.73/api/version
  ```
