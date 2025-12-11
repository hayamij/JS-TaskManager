// Business Layer Exports
// Use cases, DTOs, and repository interfaces (ports)

module.exports = {
    // Auth Use Cases
    RegisterUserUseCase: require('./usecases/auth/RegisterUserUseCase').RegisterUserUseCase,
    LoginUserUseCase: require('./usecases/auth/LoginUserUseCase').LoginUserUseCase,
    VerifyTokenUseCase: require('./usecases/auth/VerifyTokenUseCase').VerifyTokenUseCase,
    
    // Task Use Cases
    CreateTaskUseCase: require('./usecases/tasks/CreateTaskUseCase').CreateTaskUseCase,
    GetTasksUseCase: require('./usecases/tasks/GetTasksUseCase').GetTasksUseCase,
    GetTaskByIdUseCase: require('./usecases/tasks/GetTaskByIdUseCase').GetTaskByIdUseCase,
    UpdateTaskUseCase: require('./usecases/tasks/UpdateTaskUseCase').UpdateTaskUseCase,
    DeleteTaskUseCase: require('./usecases/tasks/DeleteTaskUseCase').DeleteTaskUseCase,
    ChangeTaskStatusUseCase: require('./usecases/tasks/ChangeTaskStatusUseCase').ChangeTaskStatusUseCase,
    GetTaskStatisticsUseCase: require('./usecases/tasks/GetTaskStatisticsUseCase').GetTaskStatisticsUseCase,
    
    // DTOs
    RegisterUserInputDTO: require('./dto/RegisterUserDTO').RegisterUserInputDTO,
    RegisterUserOutputDTO: require('./dto/RegisterUserDTO').RegisterUserOutputDTO,
    LoginUserInputDTO: require('./dto/LoginUserDTO').LoginUserInputDTO,
    LoginUserOutputDTO: require('./dto/LoginUserDTO').LoginUserOutputDTO,
    CreateTaskInputDTO: require('./dto/CreateTaskDTO').CreateTaskInputDTO,
    CreateTaskOutputDTO: require('./dto/CreateTaskDTO').CreateTaskOutputDTO,
    UpdateTaskInputDTO: require('./dto/UpdateTaskDTO').UpdateTaskInputDTO,
    UpdateTaskOutputDTO: require('./dto/UpdateTaskDTO').UpdateTaskOutputDTO,
    GetTasksInputDTO: require('./dto/GetTaskDTO').GetTasksInputDTO,
    GetTasksOutputDTO: require('./dto/GetTaskDTO').GetTasksOutputDTO,
    GetTaskInputDTO: require('./dto/GetTaskDTO').GetTaskInputDTO,
    GetTaskOutputDTO: require('./dto/GetTaskDTO').GetTaskOutputDTO,
    DeleteTaskInputDTO: require('./dto/DeleteTaskDTO').DeleteTaskInputDTO,
    DeleteTaskOutputDTO: require('./dto/DeleteTaskDTO').DeleteTaskOutputDTO,
    
    // Ports (Interfaces)
    UserRepository: require('./ports/UserRepository').UserRepository,
    TaskRepository: require('./ports/TaskRepository').TaskRepository,
    PasswordService: require('./ports/PasswordService').PasswordService,
    TokenService: require('./ports/TokenService').TokenService
};
