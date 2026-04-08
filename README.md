# JS-TaskManager

Task management system with Clean Architecture: Node.js + Express + SQL Server, including JWT auth, task lifecycle APIs, and display-focused task endpoints.

## 1) About project

- Focus: authentication, task CRUD, status transitions, statistics, and display-ready task views.
- Runtime: REST API with static frontend pages served from `public`.
- Layering: Domain, Business, Adapters, Infrastructure.

## 2) Tech stack

| Frontend | Backend API | Security | Database | Testing | Tooling |
|---|---|---|---|---|---|
| HTML, CSS, vanilla JavaScript | Node.js, Express 5 | JWT, bcrypt, helmet, CORS | Microsoft SQL Server (`mssql`) | Jest, Supertest | Nodemon, Docker, npm scripts |

## 3) Quick setup

- Prerequisites: Node.js 16+, SQL Server 2019+, npm.
- Install:

```bash
npm install
```

- Database reset + seed: run `infrastructure/database/schemas/database-setup.sql` in SSMS. The script recreates `TaskManager`, creates schema objects, and inserts sample data.
- Environment: copy `.env.example` to `.env` and adjust values if needed.

```env
PORT=3000
NODE_ENV=development
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!
DB_SERVER=localhost
DB_DATABASE=TaskManager
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

- Run commands:

```bash
npm run dev          # development
npm start            # production
npm test             # all tests + coverage
npm run test:watch
npm run test:unit
npm run test:integration
```

App URL: `http://localhost:3000`

## 4) Docker quick start

```bash
docker-compose up -d --build
docker cp docker-init.sql taskmanager-sqlserver:/tmp/
docker exec taskmanager-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i /tmp/docker-init.sql -C
docker-compose restart app
```

- SQL Server account: `sa` / `YourStrong@Passw0rd`
- Seed test users in DB script use password: `password123`

## 5) Architecture and patterns

- Clean architecture layout:
	- Domain: `domain` (entities, value objects, exceptions)
	- Business: `business` (use cases, DTOs, ports)
	- Adapters: `adapters` (controllers, middleware, repositories)
	- Infrastructure: `infrastructure` (DB/config/security/routes)
- Dependency direction: `Infrastructure -> Adapters -> Business -> Domain`.
- Patterns: use-case interactor, repository + port interfaces, controller adapters, dependency injection via `DIContainer.js`.

## 6) Source inventory (snapshot)

Snapshot date: 2026-04-08

| Area | Files | Lines | Details |
|---|---:|---:|---|
| JS code volume | 84 | 8,811 | Source 59 / 4,379; Test 25 / 4,432 |
| Repository footprint (tracked files) | 101 | 11,273 | `package.json` dependencies/devDependencies: 7 / 3; npm scripts: 6 |
| Architecture components | - | - | Entities 2; Value objects 3; Exceptions 1; Use cases 13; DTOs 11; Ports 4; Controllers 3; Repositories 2; Middleware 2 |
| Layer JS distribution | - | - | Domain 7; Business 29; Adapters 7; Infrastructure 7; Public JS 5 |
| Database script scale | - | - | CREATE TABLE 2; CREATE INDEX 7; CREATE TRIGGER 2; CREATE PROCEDURE 1; INSERT INTO 4 |

| API surface | Count | Notes |
|---|---:|---|
| Total routes | 16 | Defined in `app.js` |
| Public routes | 6 | System + auth endpoints |
| Protected routes | 10 | Task and display endpoints (JWT middleware) |
| HTTP method split | GET 9, POST 4, PUT 1, PATCH 1, DELETE 1 | |

## 7) API groups

| Group | Endpoints |
|---|---|
| System | `GET /health`, `GET /api` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Tasks (protected) | `GET /api/tasks`, `GET /api/tasks/:id`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`, `PATCH /api/tasks/:id/status`, `GET /api/tasks/statistics` |
| Display (protected) | `GET /api/tasks/display`, `GET /api/tasks/:id/display`, `GET /api/tasks/statistics/display` |

## 8) Testing and quality

- Test suites by folder: domain 6, business/usecases 11, adapters 5, infrastructure 2, integration 1.
- Coverage output (after `npm test`): `coverage/lcov-report/index.html`.
- Security controls: helmet headers, CORS policy, JWT auth, bcrypt password hashing, parameterized SQL via `mssql`.

## 9) Demo credentials (seed)

- Seed users from DB script: `johndoe`, `janedoe`, `testuser`, `hayami`.
- Default user password: `password123`.
- Example login: `john.doe@example.com` / `password123`.
- Docker SQL admin: `sa` / `YourStrong@Passw0rd`.

## 10) License and links

- License: MIT (see [LICENSE](LICENSE)).
- Repository: [https://github.com/hayamij/JS-TaskManager](https://github.com/hayamij/JS-TaskManager)
- Issues: [https://github.com/hayamij/JS-TaskManager/issues](https://github.com/hayamij/JS-TaskManager/issues)
