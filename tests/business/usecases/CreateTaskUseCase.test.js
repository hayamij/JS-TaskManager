const { CreateTaskUseCase } = require('../../../business/usecases/tasks/CreateTaskUseCase');
const { CreateTaskInputDTO } = require('../../../business/dto/CreateTaskDTO');
const { Task } = require('../../../domain/entities/Task');
const { TaskStatus } = require('../../../domain/valueobjects/TaskStatus');
const { DomainException } = require('../../../domain/exceptions/DomainException');

describe('CreateTaskUseCase', () => {
    let useCase;
    let mockTaskRepository;

    beforeEach(() => {
        mockTaskRepository = {
            save: jest.fn()
        };

        useCase = new CreateTaskUseCase(mockTaskRepository);
    });

    describe('Successful creation', () => {
        it('should create a new task successfully', async () => {
            // Arrange
            const inputDTO = new CreateTaskInputDTO('Buy groceries', 'Milk, eggs, bread', 'user123');
            
            const savedTask = Task.reconstruct('task123', 'Buy groceries', 'Milk, eggs, bread', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.save.mockResolvedValue(savedTask);

            // Act
            const result = await useCase.execute(inputDTO);

            // Assert
            expect(result.taskId).toBe('task123');
            expect(result.title).toBe('Buy groceries');
            expect(result.description).toBe('Milk, eggs, bread');
            expect(result.status).toBe(TaskStatus.PENDING);
            expect(result.userId).toBe('user123');
            expect(mockTaskRepository.save).toHaveBeenCalled();
        });

        it('should create task with empty description', async () => {
            const inputDTO = new CreateTaskInputDTO('Task title', '', 'user123');
            
            const savedTask = Task.reconstruct('task123', 'Task title', '', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.save.mockResolvedValue(savedTask);

            const result = await useCase.execute(inputDTO);

            expect(result.description).toBe('');
        });
    });

    describe('Validation errors', () => {
        it('should throw error for missing title', async () => {
            const inputDTO = new CreateTaskInputDTO('', 'Description', 'user123');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Title and userId are required');
        });

        it('should throw error for missing userId', async () => {
            const inputDTO = new CreateTaskInputDTO('Task title', 'Description', '');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Title and userId are required');
        });

        it('should throw error for null input', async () => {
            await expect(useCase.execute(null)).rejects.toThrow(DomainException);
        });
    });
});
