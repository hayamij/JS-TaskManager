# JS-TaskManager

**Task Management System with Clean Architecture** - Node.js + Express + SQL Server

## Installation

### System Requirements
- Node.js 16+
- SQL Server 2019+
- npm or yarn

### Installation Steps

1. **Clone repository**
```bash
git clone https://github.com/hayamij/JS-TaskManager.git
cd JS-TaskManager
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit the `.env` file:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_SERVER=localhost
DB_DATABASE=TaskManager
DB_USER=sa
DB_PASSWORD=your_password
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d

# Security
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

4. **Create database** (SQL Server)
```sql
CREATE DATABASE TaskManager;
```

Run scripts in `infrastructure/database/schemas/`

## Running the Application

### Development mode (with nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

Server will run at: `http://localhost:3000`

## Docker Deployment

### Quick Start
```bash
# Build and start containers
docker-compose up -d --build

# Wait for SQL Server to be ready (30s)
timeout /t 30

# Initialize database with sample data
docker cp docker-init.sql taskmanager-sqlserver:/tmp/
docker exec taskmanager-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i /tmp/docker-init.sql -C

# Restart app
docker-compose restart app
```

### Credentials
- **App user**: `fuongtuan` / `toilabanhmochi`
- **SA account**: `sa` / `YourStrong@Passw0rd`
- **Test users**: password `password123`

### Useful Commands
```bash
# Stop containers
docker-compose down

# View logs
docker-compose logs -f app

# Restart app only
docker-compose restart app
```

## Project Structure

### Clean Architecture - 4 Layers

```
├── domain/                    # Layer 1: Business Entities
│   ├── entities/              # User, Task (pure domain objects)
│   ├── valueobjects/          # TaskStatus, TaskDisplayData
│   └── exceptions/            # DomainException
│
├── business/                  # Layer 2: Business Logic
│   ├── dto/                   # Data Transfer Objects
│   ├── ports/                 # Interfaces (UserRepository, TaskRepository)
│   └── usecases/              # Use Case implementations
│       ├── auth/              # Register, Login, VerifyToken
│       └── tasks/             # CRUD operations, statistics
│
├── adapters/                  # Layer 3: Interface Adapters
│   ├── controllers/           # HTTP request handlers
│   ├── repositories/          # SQL repository implementations
│   └── middleware/            # Auth, Error handling
│
├── infrastructure/            # Layer 4: Frameworks & Drivers
│   ├── database/              # SQL Server connection & models
│   ├── security/              # JWT, Bcrypt implementations
│   └── config/                # Environment configuration
│
├── public/                    # Frontend files
│   ├── js/                    # API client, Dashboard logic
│   ├── css/                   # Styles
│   └── *.html                 # Pages
│
└── tests/                     # Test suites
    ├── domain/                # Domain entity tests
    ├── business/              # Use case tests
    ├── adapters/              # Controller & repo tests
    ├── infrastructure/        # Service tests
    └── integration/           # E2E tests
```

### Dependency Flow
```
Infrastructure → Adapters → Business → Domain
```
Each layer only depends on the layer inside it (Dependency Rule).

## Project Statistics

| Metric | Count |
|--------|-------|
| **Total Files** | 86 JavaScript files |
| **Source Files** | 61 files (production code) |
| **Test Files** | 25 test suites |
| **Test Cases** | **450 tests** (446 passed, 4 skipped) |
| **Source Lines** | 5,952 lines |
| **Test Lines** | 4,505 lines |
| **Total Lines** | ~10,500 lines |
| **Endpoints** | 16 REST APIs |

### Code Coverage (Jest)
```
─────────────────────────────────────────────────────────────
File                    % Stmts   % Branch   % Funcs   % Lines
─────────────────────────────────────────────────────────────
All files                75.09%     72.51%    74.82%    75.52%
─────────────────────────────────────────────────────────────
Controllers              82.92%     79.36%    82.60%    82.82%
Middleware               89.79%     82.50%    88.88%    89.79%
Repositories             80.82%     50.00%    87.50%    80.28%
Use Cases (auth)        100.00%    100.00%   100.00%   100.00%
Use Cases (tasks)        88.34%     89.83%    82.35%    88.34%
Domain Entities          91.70%     84.73%    94.23%    92.78%
Value Objects            96.15%     88.99%   100.00%    96.11%
Security Services        97.05%     95.00%   100.00%    97.05%
─────────────────────────────────────────────────────────────
```

### Layer Breakdown
- **Domain**: 5 entities/value objects, 1 exception class
- **Business**: 13 use cases, 11 DTOs, 4 ports
- **Adapters**: 3 controllers, 2 repositories, 2 middleware
- **Infrastructure**: Database, JWT, Bcrypt services
- **Tests**: 7 domain, 11 use case, 7 adapter/infra tests

## Features

### Authentication
- ✅ JWT-based authentication
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Token verification middleware
- ✅ Protected routes

### Task Management
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Task status: PENDING → IN_PROGRESS → COMPLETED
- ✅ Deadline tracking with overdue detection
- ✅ Progress calculation
- ✅ Task statistics with insights

### Display Endpoints (Frontend-ready)
- ✅ Enriched data: formatted dates, localized text
- ✅ Vietnamese localization
- ✅ Actionable insights
- ✅ Permission checks per task

## API Endpoints

### Public
- `GET /health` - Health check
- `GET /api` - API information
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Protected (require JWT)
- `GET /api/tasks/statistics` - Get statistics
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks (filter by status)
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Change status
- `GET /api/tasks/statistics/display` - Statistics with insights
- `GET /api/tasks/display` - Tasks with display data
- `GET /api/tasks/:id/display` - Task with display data

See details: [materials/api-list.txt](materials/api-list.txt)

## Testing

Tests cover:
- ✅ Domain logic validation
- ✅ Business rules enforcement
- ✅ Use case orchestration
- ✅ Repository operations
- ✅ API integration
- ✅ Authentication flows
- ✅ Error handling

**Run coverage report:**
```bash
npm test
# View report: coverage/lcov-report/index.html
```

## Security

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin access
- **JWT**: Stateless authentication
- **Bcrypt**: Strong password hashing
- **Prepared statements**: SQL injection prevention
- **Input validation**: Domain-level validation
- **No secrets in code**: Environment variables only

## Architecture

The project adheres to **Clean Architecture** principles:
- ✅ Dependency Rule (inward dependencies only)
- ✅ Framework-independent domain logic
- ✅ Testable business logic
- ✅ Replaceable infrastructure
- ✅ Repository pattern with ports & adapters
- ✅ Dependency injection via DIContainer

## Development

### Project Structure Convention
- **PascalCase**: Classes, Entities, DTOs
- **camelCase**: Functions, variables
- **SCREAMING_SNAKE_CASE**: Constants

### Coding Standards
- Pure domain entities (no framework imports)
- Business logic in domain layer
- Use cases orchestrate only
- Controllers handle HTTP only
- Repositories behind interfaces

## License

MIT License - see [LICENSE](LICENSE)

## Links

- Repository: [https://github.com/hayamij/JS-TaskManager](https://github.com/hayamij/JS-TaskManager)
- Issues: [https://github.com/hayamij/JS-TaskManager/issues](https://github.com/hayamij/JS-TaskManager/issues)
