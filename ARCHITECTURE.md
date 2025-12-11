# Clean Architecture - Task Manager

## 📁 Project Structure

```
domain/                          # Layer 1: Domain (Pure business logic)
├── entities/                    # Business entities with behavior
│   ├── User.js                 # User entity with validation
│   └── Task.js                 # Task entity with status management
├── valueobjects/               # Immutable domain concepts
│   └── TaskStatus.js          # Task status enumeration
├── exceptions/                 # Domain-specific exceptions
│   └── DomainException.js     # Business rule violations
└── index.js                    # Domain exports

business/                        # Layer 2: Business Logic (Use Cases)
├── usecases/
│   ├── auth/                   # Authentication use cases
│   │   ├── RegisterUserUseCase.js
│   │   ├── LoginUserUseCase.js
│   │   └── VerifyTokenUseCase.js
│   └── tasks/                  # Task management use cases
│       ├── CreateTaskUseCase.js
│       ├── GetTasksUseCase.js
│       ├── GetTaskByIdUseCase.js
│       ├── UpdateTaskUseCase.js
│       ├── DeleteTaskUseCase.js
│       ├── ChangeTaskStatusUseCase.js
│       └── GetTaskStatisticsUseCase.js
├── dto/                        # Data Transfer Objects
│   ├── RegisterUserDTO.js
│   ├── LoginUserDTO.js
│   ├── CreateTaskDTO.js
│   ├── UpdateTaskDTO.js
│   ├── GetTaskDTO.js
│   └── DeleteTaskDTO.js
├── ports/                      # Interfaces (contracts)
│   ├── UserRepository.js      # User data access interface
│   ├── TaskRepository.js      # Task data access interface
│   ├── PasswordService.js     # Password hashing interface
│   └── TokenService.js        # JWT token interface
└── index.js                    # Business exports

adapters/                        # Layer 3: Adapters (TO BE IMPLEMENTED)
├── controllers/                # HTTP controllers
├── presenters/                 # Response formatters
├── repositories/               # Repository implementations
└── middleware/                 # Express middleware

infrastructure/                  # Layer 4: Infrastructure (TO BE IMPLEMENTED)
├── database/                   # MongoDB setup
├── config/                     # Configuration
└── security/                   # bcrypt, JWT implementations
```

## 🎯 Clean Architecture Principles Applied

### 1. **Dependency Rule** ✅
- Domain layer has ZERO dependencies
- Business layer depends only on Domain
- Adapters depend on Business & Domain
- Infrastructure depends on outer layers

### 2. **Rich Domain Model** ✅
- Entities contain business logic (not anemic data classes)
- `User` validates username, email, password
- `Task` manages status transitions with business rules
- Example: Cannot move from Completed → Pending directly

### 3. **Use Case Single Responsibility** ✅
- Each use case handles ONE operation
- `RegisterUserUseCase`: registration only
- `CreateTaskUseCase`: task creation only
- Clear orchestration, no scattered business logic

### 4. **Ports & Adapters Pattern** ✅
- Business layer defines interfaces (Ports)
- Infrastructure will implement them (Adapters)
- Easy to swap MongoDB → PostgreSQL later

### 5. **Framework Independence** ✅
- Domain & Business layers are pure JavaScript
- NO Express, NO Mongoose in these layers
- Can test without any framework

## 🔑 Key Features Implemented

### Domain Entities
- **User**: Registration validation, profile updates, password management
- **Task**: CRUD operations, status transitions, ownership checks
- **TaskStatus**: Value object for status enumeration

### Use Cases (Authentication)
1. **RegisterUserUseCase**: User registration with duplicate checks
2. **LoginUserUseCase**: Authentication with password verification
3. **VerifyTokenUseCase**: JWT token validation

### Use Cases (Task Management)
1. **CreateTaskUseCase**: Create new task
2. **GetTasksUseCase**: List all user tasks (with optional status filter)
3. **GetTaskByIdUseCase**: Get single task with authorization
4. **UpdateTaskUseCase**: Update task with authorization
5. **DeleteTaskUseCase**: Delete task with authorization
6. **ChangeTaskStatusUseCase**: Status transitions with business rules
7. **GetTaskStatisticsUseCase**: Task counts and completion rate

## 🔐 Business Rules Enforced

### Task Status Transitions
```
Pending → In Progress → Completed ✅
Completed → Pending ❌ (blocked by domain logic)
Completed → In Progress ✅ (reopen)
```

### Validation Rules
- Username: 3-50 chars, alphanumeric + underscore
- Email: Valid email format
- Password: 6-100 chars
- Task title: Required, max 200 chars
- Task ownership: Only owner can modify

## 📝 Next Steps

To complete the implementation:

1. **Adapters Layer**:
   - Express controllers
   - Response presenters
   - Repository implementations (Mongoose)

2. **Infrastructure Layer**:
   - MongoDB connection
   - bcrypt implementation
   - JWT implementation
   - Dependency injection container

3. **Testing**:
   - Unit tests for domain entities
   - Unit tests for use cases (with mocks)
   - Integration tests for repositories

## 💡 Usage Example

```javascript
// Example: Register a user (pseudo-code)
const registerUseCase = new RegisterUserUseCase(userRepo, passwordService);
const input = new RegisterUserInputDTO('john', 'john@example.com', 'password123');
const output = await registerUseCase.execute(input);
// Output: { userId, username, email, createdAt }

// Example: Create a task
const createTaskUseCase = new CreateTaskUseCase(taskRepo);
const input = new CreateTaskInputDTO('Buy groceries', 'Milk, eggs, bread', userId);
const output = await createTaskUseCase.execute(input);
// Output: { taskId, title, description, status: 'Pending', ... }
```

## 🏛️ Architecture Benefits

1. **Testability**: Business logic isolated, easy to unit test
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Easy to change database or framework
4. **Scalability**: Add features without breaking existing code
5. **Team Collaboration**: Clear boundaries between layers
