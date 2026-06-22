# Anime PostgreSQL Database

This directory hosts the PostgreSQL database configuration used to cache anime details and key characters in our local system.

---

## Database Credentials

The default credentials configured in `docker-compose.yml` are:
* **Host**: `localhost` (port `5432`)
* **Username**: `postgres`
* **Password**: `psswd`
* **Database Name**: `anime_db`

---

## How to Start the Database locally

Run the following command in this directory to start the PostgreSQL instance in the background:

```bash
docker compose up -d
```

To stop the database container and keep the volume data:
```bash
docker compose down
```

To stop the database container and destroy the cached volume data:
```bash
docker compose down -v
```
