# 📋 JS-TaskManager

**Task Management System with Clean Architecture** - Node.js + Express + SQL Server

## 📦 Cài Đặt

### Yêu cầu hệ thống
- Node.js 16+ 
- SQL Server 2019+
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/hayamij/JS-TaskManager.git
cd JS-TaskManager
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**
```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
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

4. **Tạo database** (SQL Server)
```sql
CREATE DATABASE TaskManager;
```

Chạyscripts trong `infrastructure/database/schemas/`

## 🚀 Chạy Ứng Dụng

### Development mode (với nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

### Testing
```bash
# Chạy tất cả tests
npm test

# Chạy tests với watch mode
npm run test:watch

# Chạy unit tests only
npm run test:unit

# Chạy integration tests only
npm run test:integration
```

Server sẽ chạy tại: `http://localhost:3000`

## 🏗️ Cấu Trúc Dự Án

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
Mỗi layer chỉ phụ thuộc vào layer bên trong (Dependency Rule).

## 📊 Thống Kê Dự Án

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

### Phân tích theo layer:
- **Domain**: 5 entities/value objects, 1 exception class
- **Business**: 13 use cases, 11 DTOs, 4 ports
- **Adapters**: 3 controllers, 2 repositories, 2 middleware
- **Infrastructure**: Database, JWT, Bcrypt services
- **Tests**: 7 domain, 11 use case, 7 adapter/infra tests

## 🔐 Tính Năng

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

## 🔗 API Endpoints

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

Xem chi tiết: [materials/api-list.txt](materials/api-list.txt)

## 🧪 Testing

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
# Xem report: coverage/lcov-report/index.html
```

## 🛡️ Security

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin access
- **JWT**: Stateless authentication
- **Bcrypt**: Strong password hashing
- **Prepared statements**: SQL injection prevention
- **Input validation**: Domain-level validation
- **No secrets in code**: Environment variables only

## 🏛️ Kiến Trúc

Dự án tuân thủ **Clean Architecture** principles:
- ✅ Dependency Rule (inward dependencies only)
- ✅ Framework-independent domain logic
- ✅ Testable business logic
- ✅ Replaceable infrastructure
- ✅ Repository pattern with ports & adapters
- ✅ Dependency injection via DIContainer

## 👨‍💻 Development

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

## 📄 License

MIT License - xem [LICENSE](LICENSE)

## 🔗 Links

- Repository: [https://github.com/hayamij/JS-TaskManager](https://github.com/hayamij/JS-TaskManager)
- Issues: [https://github.com/hayamij/JS-TaskManager/issues](https://github.com/hayamij/JS-TaskManager/issues)

---

**Built with Clean Architecture principles** 
