# Anime API Backend

A Node.js + Express API server written in TypeScript. It uses TypeORM to manage cache state in a PostgreSQL database and Axios to query the public AniList GraphQL endpoint.

---

## API Endpoints

* **`GET /api/anime`**: Returns a list of all locally cached anime records along with their character list.
* **`GET /api/anime/:id`**: Retrieves an anime by its AniList ID. If cached, it is served from the DB. On a cache miss, the server fetches it from AniList, caches it, and returns the result.
* **`GET /api/anime/:id/characters?page=N`**: Returns page `N` (default: 1) of characters for an anime. Fetches and caches the new characters in the database and updates relationships.

---

## How to Run Locally (Development Mode)

1. **Configure Environment**:
   Make sure you have a `.env` file containing database credentials (see `.env.example`).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the API Server**:
   ```bash
   npm run dev
   ```
   The API will listen on port `5001` (configured in `.env`).

---

## How to Build and Run via Docker

1. **Build the Docker Image**:
   ```bash
   docker build -t anime-api:latest .
   ```
2. **Run the Container**:
   Expose port `5001` and pass database connection environment variables (assuming database is running locally):
   ```bash
   docker run -p 5001:5001 \
     -e DB_HOST=host.docker.internal \
     -e DB_PORT=5432 \
     -e DB_USER=postgres \
     -e DB_PASSWORD=psswd \
     -e DB_NAME=anime_db \
     anime-api:latest
   ```
