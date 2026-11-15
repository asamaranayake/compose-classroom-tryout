# Docker Compose Classroom Tryout

Build and run a four-service notes app to see how a browser request travels through a typical web stack.

## The Four Roles

| Service | Role | What it does |
|---------|------|--------------|
| `frontend` | Frontend | Serves the HTML, CSS, and browser JavaScript for the notes form. |
| `web` | Web server / reverse proxy | Nginx is the only service published to the host. It routes `/` to the frontend and `/api/` to the API. |
| `api` | Backend | Validates note submissions, reads and writes notes, and talks to PostgreSQL. |
| `database` | Database | PostgreSQL stores notes in the `postgres-data` named volume. |

Request flow:

```text
Browser -> web (Nginx :8080) -> frontend (HTML/CSS/JS)
Browser -> web (Nginx :8080) -> api (/api/notes) -> database (PostgreSQL)
```

The `frontend` and `api` share the `edge` network. The `api` and `database` share the separate `data` network. The database is not published to the host and the frontend cannot connect directly to it.

## What You Need

- Docker Desktop (Windows or macOS), or Docker Engine with the Compose plugin (Linux)
- Docker must be running
- A browser
- Host port `8080` must be available

No Node.js, npm, or PostgreSQL installation is needed on the host. Docker builds and runs those components in containers.

## Set Up and Start

1. Open a terminal at the repository root and move into the demo folder:

	```bash
	cd mindmapcreator/NVQLevel6/DevOps/LabPractices/compose-classroom-tryout
	```

2. Confirm Docker is available:

	```bash
	docker --version
	docker compose version
	docker info
	```

	`docker info` should show the server section. If it reports that it cannot connect, start Docker Desktop or the Docker Engine service.

3. Check that Compose can read the configuration:

	```bash
	docker compose config
	```

4. Build the two local images and start all four services in the background:

	```bash
	docker compose up --build -d
	```

	On the first run, Docker downloads the Nginx and PostgreSQL base images and installs the Node dependencies while building the frontend and API images. This can take a few minutes and requires registry access.

5. Check the service status:

	```bash
	docker compose ps
	```

	Wait until `database` and `api` report healthy and the other services are running. Then open http://localhost:8080.

6. Enter a short note and select **Add note**. Refresh the browser; the saved note should still appear.

## How One Note Travels Through the App

1. The browser requests `http://localhost:8080/`. The `8080:80` port mapping sends that host request to Nginx in the `web` container.
2. Nginx reads `nginx/default.conf`. Requests for `/` go to the `frontend` service, which returns the HTML, CSS, and browser JavaScript.
3. The browser JavaScript requests `GET /api/notes` through the same address. Nginx matches `/api/` and forwards the request to `api:3000`.
4. When a learner submits a note, the browser sends `POST /api/notes` with JSON. The backend checks that the note has 1-200 characters.
5. The backend connects to PostgreSQL at `database:5432` and runs a parameterized `INSERT` query. `database` resolves to the database container because both services are on the `data` network.
6. The API returns the saved note as JSON. The browser requests the notes again and renders the response.

Compose creates the `edge` and `data` networks. `web` and `frontend` are on `edge`; `api` is on both networks; `database` is only on `data`. Only Nginx publishes a host port, so the browser cannot connect directly to the API or database. The database health check must pass before the API starts, and the API health check must pass before Nginx starts.

## Verify and Explore

Check the app through Nginx:

```bash
curl http://localhost:8080/api/notes
```

Inspect saved rows in PostgreSQL:

```bash
docker compose exec database psql -U classroom -d classroom -c "SELECT id, body FROM notes ORDER BY id;"
```

Follow all service logs, or limit them to one service:

```bash
docker compose logs -f
docker compose logs -f api
```

Press `Ctrl+C` to stop following logs; this does not stop the containers. To inspect containers and networks:

```bash
docker compose ps
docker compose top
docker network ls
docker volume ls
```

## Stop, Restart, and Reset

```bash
docker compose stop       # Stop containers but keep them
docker compose start      # Start the stopped containers again
docker compose down       # Remove containers and networks; keep database data
```

The named `postgres-data` volume preserves notes when containers are removed. To permanently delete the saved notes and reset the exercise:

```bash
docker compose down -v
```

> `down -v` deletes the database volume and its data. The `classroom-demo-only` database password is for local learning only; do not reuse it in a real deployment.

## Common Problems

| Problem | Check or fix |
|---------|--------------|
| Docker daemon is unavailable | Start Docker Desktop or Docker Engine, then rerun `docker info`. |
| Port `8080` is already in use | Change the host side of the `web` port mapping, for example to `8081:80`, restart with `docker compose up -d`, and open http://localhost:8081. |
| A service is unhealthy or exits | Run `docker compose ps` and `docker compose logs api database web` to find the failing service and its error. |
| Image download fails | Check network/registry access and retry `docker compose up --build -d`. The first run needs to download base images and npm packages. |
| A note is missing after restart | Use `docker compose down` without `-v`; `down -v` removes the database volume and saved notes. |

For a complete fresh start, including a rebuilt database, run `docker compose down -v` and then `docker compose up --build -d`.
