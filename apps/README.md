# AniCache Hub Stack

This repository contains a multi-tier application consisting of a PostgreSQL database, a Node.js/TypeScript API backend, and a React/TypeScript frontend UI. The application allows users to query, browse, and locally cache anime details and character profiles from the global AniList database.

---

## App Descriptions

### 1. Database Tier (`apps/anime-db`)
* **Technology**: PostgreSQL 15 (Alpine)
* **Description**: A private, persistent database that stores locally cached anime information and character lists. When the API fetches new data from AniList, it caches it here so future queries retrieve the data instantly without contacting AniList.

### 2. API Backend Tier (`apps/anime-api`)
* **Technology**: Node.js, Express, TypeORM, TypeScript
* **Description**: A REST API that handles client requests. It connects to the PostgreSQL database to retrieve cached data. On a cache miss (i.e. if the anime ID isn't in our database), it queries the external AniList GraphQL API, saves the data to the local DB, and returns it. It also supports fetching paginated character pages.

### 3. Frontend UI Tier (`apps/anime-ui`)
* **Technology**: React (Vite), TypeScript, Nginx (for production Docker container)
* **Description**: A clean, professional dark mode dashboard. Users can search for anime by AniList ID to trigger the caching mechanism. Displays cached anime in a grid with character avatar counts and allows opening a details modal with descriptions and a "Load More Characters" pagination button.

---

## How to Run Everything via Docker (Root Level)

You can launch the entire stack with a single command from the project root directory:

```bash
docker compose up --build
```

* **UI Dashboard**: Open [http://localhost:5002/](http://localhost:5002/) in your browser.
* **API Backend**: Runs on [http://localhost:5001/](http://localhost:5001/).
* **Database**: Runs on port `5432` internally/externally.

To stop the containers:
```bash
docker compose down
```

---

## How to Run Services Individually Locally

If you are developing locally, you can start the components one by one.

### Step 1: Start the PostgreSQL Database
We run the database inside Docker so you don't need to install PostgreSQL on your machine.
```bash
cd apps/anime-db
docker compose up -d
```

### Step 2: Start the Backend API
Navigate to the API folder, install packages, and start the development server:
```bash
cd apps/anime-api
npm install
npm run dev
```
The API starts on port `5001`.

### Step 3: Start the Frontend UI
Navigate to the UI folder, install packages, and start the development server:
```bash
cd apps/anime-ui
npm install
npm run dev
```
Open [http://localhost:5003/](http://localhost:5003/) (or the port Vite outputs in your terminal) in your browser.
