# Airbnb Clone DevOps Project

This is a Node.js, Express, MongoDB and EJS property-listing application. It
supports user accounts, listing CRUD operations, owner authorisation, reviews,
image uploads through Cloudinary and maps through Mapbox.

The repository also contains a seven-stage Jenkins pipeline for the SIT223
7.3HD task: Build, Test, Code Quality, Security, Deploy, Release and Monitoring.

## Run locally

1. Install Node.js 22 or later and MongoDB.
2. Copy `.env.example` to `.env` and enter your own values.
3. Install dependencies with `npm install`.
4. Start the application with `npm start`.
5. Open `http://localhost:8080`.

The existing local database is not seeded or reset by these instructions.

## Checks

```bash
npm test
npm run test:coverage
npm run lint
npm run security
```

The tests use a temporary in-memory Express session and do not modify the local
MongoDB database.

## Health and monitoring endpoints

- `/health` confirms that the Node.js application is running.
- `/ready` confirms that MongoDB is connected.
- `/metrics` exposes two simple counters in Prometheus text format.

## Docker

Set the values from `.env.example`, then run:

```bash
docker compose up --build
```

The Compose database uses its own Docker volume, so it does not overwrite the
existing MongoDB database on the computer.

To include Prometheus and Grafana:

```bash
docker compose --profile monitoring up --build
```

Prometheus is available at `http://localhost:9090` and Grafana at
`http://localhost:3000`. Change the default Grafana password before showing a
production-style deployment.

## Jenkins preparation

Jenkins needs Node.js, Docker, Docker Compose, the SonarQube Scanner plugin and
the SonarQube Quality Gates plugin. Configure these names exactly:

- SonarQube server: `SonarQube`
- SonarQube scanner tool: `SonarScanner`

Create these Jenkins secret-text credentials:

- `airbnb-session-secret`
- `cloudinary-name`
- `cloudinary-key`
- `cloudinary-secret`
- `mapbox-token`

Set an `ALERT_EMAIL` environment variable in the Jenkins job if the Mailer
plugin should notify you when a stage fails.

The staging application uses port 8081 and a separate Docker database. The
release application uses port 8082 and another separate database, leaving
Jenkins free to use its usual port 8080. The same
versioned Docker image is promoted from staging to release.

## Monitoring alert demonstration

Prometheus loads two alert rules from `monitoring/alerts.yml`:

- the application is unavailable for one minute;
- more than five server errors occur within five minutes.

For the demo, stop the production application temporarily and show the
`AirbnbApplicationDown` rule changing from pending to firing in Prometheus.
Start the application again after recording the demonstration.

\
