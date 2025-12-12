# 📋 JS Task Manager

A production-ready Task Management System built with **Clean Architecture** principles using Node.js + Express + **SQL Server** + Frontend (HTML/CSS/JS).

## ✨ Features

### Backend
- ✅ **User Authentication**: Register, login, logout with JWT
- ✅ **Password Security**: bcrypt hashing with configurable salt rounds
- ✅ **Task Management**: Full CRUD operations with status tracking
- ✅ **Status Workflow**: Pending → In Progress → Completed with business rules
- ✅ **Authorization**: User-owned tasks with permission checks
- ✅ **Security**: Helmet, CORS, input validation, parameterized queries
- ✅ **Clean Architecture**: Domain-driven design, testable, maintainable
- ✅ **SQL Server**: T-SQL database with stored procedures and triggers
- ✅ **Comprehensive Tests**: Unit + integration tests with Jest
- ✅ **Deployment Ready**: Docker + SQL Server configurations

### Frontend
- ✅ **Responsive UI**: Mobile-first design with vanilla HTML/CSS/JS
- ✅ **Landing Page**: Feature showcase and call-to-action
- ✅ **Authentication Pages**: Login and registration with validation
- ✅ **Dashboard**: RSQL Server, JWT) │  ← Framework-specific
├─────────────────────────────────────┤
│   Adapters (Controllers, Repos)    │  ← HTTP & Data translation
├─────────────────────────────────────┤
│   Business (Use Cases, DTOs)       │  ← Application logic
├─────────────────────────────────────┤
│   Domain (Entities, Rules)         │  ← Pure business logic
└─────────────────────────────────────┘

Frontend (public/) → Backend API → SQL Serverre** with strict layer separation:

```
┌─────────────────────────────────────┐
│   Infrastructure (MongoDB, JWT)    │  ← Framework-specific
├─────────────────────────────────────┤
│   Adapters (Controllers, Repos)    │  ← HTTP & Data translation
├─────────────────────────────────────┤
│   Business (Use Cases, DTOs)       │  ← Application logic
├─────────────────────────────────────┤
│   Domain (Entities, Rules)         │  ← Pure business logic
└─────────────────────────────────────┘
```

**Key Benefits:**
- Database abstracted via repository pattern
- Clean separation between frontend and backendess layers have zero dependencies)
- Testable business logic in isolation
- Easy to swap databases or frameworks
- Maintainable for teams

📖 **Read more:** [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📁 Project Structure

```
domain/                  # Pure business entities
├── entities/           # User, Task
├── valueobjects/       # TaskStatus
└── exceptions/         # DomainException

business/               # Use cases & interfaces
├── usecases/
│   ├── auth/          # Register, Login, Verify
│   └── tasks/         # CRUD + Statistics
├── dto/               # Input/Output DTOs
└── ports/             # Repository interfaces

adapters/               # Controllers & Repositories
├── controllers/        # AuthController, TaskController
├── middleware/         # AuthMiddleware
└── repositor
│   ├── models/        # SQL Server query classes
│   └── schemas/       # SQL table definitions
├── security/          # bcrypt, JWT
└── config/            # Environment config

public/                 # Frontend files
├── index.html         # Landing page
├── login.html         # Login page
├── register.html      # Registration
├── dashboard.html     # Main app
├── css/              # Styles
└── js/               # Frontend logic

tests/                  # Comprehensive coverage
├── domain/            # Entity tests
├─**SQL Server 2019+** (Express/Developer/Standard)
  - Windows: Download from Microsoft
  - Linux/Mac: Use Docker

### Installation

**Step 1: Setup SQL Server**
```bash
# Using Docker (recommended for Linux/Mac)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Password" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

**Step 2: Create Database**
```sql
CREATE DATABASE TaskManager;
GO
USE TaskManager;
GO
-- Run: infrastructure/database/schemas/create-tables.sql
```

**Step 3: Install & Configure**
```powershell
# Clone repository
cd JS-TaskManager

# Install dependencies
npm install

# Setup environment
Copy-Item .env.example .env
# Edit .env with your SQL Server credentials:
# DB_USER=sa
# DB_PASSWORD=YourStrong@Password
# DB_SERVER=localhost
# DB_DATABASE=TaskManager

# Start server
npm run dev
```

**Step 4: Access Application**
- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api`
- Health: `http://localhost:3000/health
npm install

# Setup environment
Copy-Item .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm run dev
```

Server runs at `http://localhost:3000`

📖 **Full guide:** [QUICK_START.md](./QUICK_START.md)

## 🧪 Testing

```powershell
# Run all tests with coverage
npm test
## 📡 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Client-side logout

### Tasks (Protected - requires JWT)
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List user's tasks (filter by status)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Change status
- `GET /api/tasks/statistics` - Get task stats

**Example:**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Create Task (use token from login)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs"}'
```

📖 **Full API docs:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🎨 Frontend Usage

### Pages

1. **Landing Page** (`/`)
   - Features overview
   - Links to login/register

2. **Register** (`/register.html`)
   - Create new account
   - Username, email, password validation

3. **Login** (`/login.html`)
   - Authenticate with email/password
   - Receives JWT token

4. **Dashboard** (`/dashboard.html`)
   - View statistics (total, pending, in progress, completed)
   - Create new tasks
   - Filter tasks by status
   - Edit/delete tasks
   - Change task status

### Usage Flow

```
1. Open http://localhost:3000
2. Click "Đăng ký" → Register account
3. Login with credentials
4. Dashboard loads with statistics
5. Click "+ Tạo công việc mới" → Create task
6. View/filter tasks by status
7. Click status buttons to update task progress
8. Edit/delete tasks as needed
```

📖 **Full frontend guide:** [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)

---

## 🔄 MongoDB → SQL Server Migration

This project has been migrated from MongoDB to SQL Server. Key changes:

- **Database:** MongoDB → Microsoft SQL Server
- **Driver:** Mongoose → mssql
- **IDs:** ObjectId → UNIQUEIDENTIFIER (GUID)
- **Schema:** Collections → Tables with constraints
- **Queries:** Mongoose methods → Parameterized SQL

📖 **Full migration guide:** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## 🔒 Security Notes

- **Passwords:** bcrypt hashing with configurable salt rounds
- **Authentication:** JWT with expiration
- **SQL Injection:** All queries use parameterized statements
- **XSS:** User input escaped in frontend
- **CORS:** Configurable origins
- **Headers:** Helmet middleware for security headers
## 🐳 Docker Deployment

### SQL Server + Application

```powershell
# 1. Start SQL Server in Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Password" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# 2. Build application
docker build -t js-task-manager .

# 3. Run application (connect to SQL Server)
docker run -d -p 3000:3000 \
  -e DB_SERVER=host.docker.internal \
  -e DB_USER=sa \
  -e DB_PASSWORD=YourStrong@Password \
  -e DB_DATABASE=TaskManager \
  js-task-manager
```

## ☁️ Azure Deployment

### With Azure SQL Database

```powershell
# 1. Create Azure SQL Database
az sql server create --name yourserver --resource-group yourgroup
az sql db create --name TaskManager --server yourserver

# 2. Deploy to Azure App Service
az webapp create --name your-app --resource-group yourgroup
az webapp deployment source config --name your-app --repo-url YOUR_REPO

# 3. Configure connection string
az webapp config appsettings set --name your-app --settings \
  DB_SERVER=yourserver.database.windows.net \
  DB_USER=youradmin \
  DB_PASSWORD=YourPassword \
  DB_DATABASE=TaskManager \
  JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## 🔐 Security Features

- **Password hashing:** bcrypt with configurable salt rounds
- **JWT authentication:** Stateless session management
- **Input validation:** Domain-level validation rules
- **Authorization:** User ownership checks on all operations
- **HTTP security:** Helmet middleware for secure headers
- **CORS:** Configurable cross-origin resource sharing

## 🎯 Business Rules Enforced

- Username: 3-50 chars, alphanumeric + underscore
- Email: Valid format, unique
- Password: 6+ chars
- Task status transitions: `Completed → Pending` blocked
- Task ownership: Only owner can modify/delete

## 📚 Documentation

- 📖 [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- 📖 [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- 📖 [Architecture Guide](./ARCHITECTURE.md) - Clean Architecture explained

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Follow Clean Architecture principles
4. Write tests (maintain 90%+ coverage)
5. Commit: `git commit -m 'Add AmazingFeature'`
6. Push: `git push origin feature/AmazingFeature`
7. Open Pull Request

## 📝 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

- Clean Architecture by Robert C. Martin
- Domain-Driven Design principles
- SOLID principles for maintainable code
MIT

A full-stack Task Management System web application featuring robust user authentication (Register/Login/Logout) using bcrypt for password hashing and JWT for session security. The system utilizes MongoDB/Mongoose for data management and provides full CRUD functionality for tasks, allowing classification by status (Pending, In Progress, Completed). Security is enhanced via Helmet/CORS and configuration managed by dotenv. Deployment target is Heroku/Docker.
