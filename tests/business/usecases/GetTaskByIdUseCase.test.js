const { GetTaskByIdUseCase } = require('../../../business/usecases/tasks/GetTaskByIdUseCase');
const { GetTaskInputDTO } = require('../../../business/dto/GetTaskDTO');
const { Task } = require('../../../domain/entities/Task');
const { TaskStatus } = require('../../../domain/valueobjects/TaskStatus');
const { DomainException } = require('../../../domain/exceptions/DomainException');

describe('GetTaskByIdUseCase', () => {
    let useCase;
    let mockTaskRepository;

    beforeEach(() => {
        mockTaskRepository = {
            findById: jest.fn()
        };

        useCase = new GetTaskByIdUseCase(mockTaskRepository);
    });

    describe('Successful retrieval', () => {
        it('should get task by id for authorized user', async () => {
            // Arrange
            const inputDTO = new GetTaskInputDTO('task123', 'user123');
            
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);

            // Act
            const result = await useCase.execute(inputDTO);

            // Assert
            expect(result.taskId).toBe('task123');
            expect(result.title).toBe('Task 1');
            expect(result.userId).toBe('user123');
            expect(mockTaskRepository.findById).toHaveBeenCalledWith('task123');
        });
    });

    describe('Authorization errors', () => {
        it('should throw error when task belongs to different user', async () => {
            const inputDTO = new GetTaskInputDTO('task123', 'user999');
            
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);

            await expect(useCase.execute(inputDTO)).rejects.toThrow('You do not have permission to access this task');
        });
    });

    describe('Validation errors', () => {
        it('should throw error when task not found', async () => {
            const inputDTO = new GetTaskInputDTO('nonexistent', 'user123');
            mockTaskRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(inputDTO)).rejects.toThrow('Task with ID nonexistent not found');
        });

        it('should throw error for missing taskId', async () => {
            const inputDTO = new GetTaskInputDTO('', 'user123');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Task ID and User ID are required');
        });

        it('should throw error for missing userId', async () => {
            const inputDTO = new GetTaskInputDTO('task123', '');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Task ID and User ID are required');
        });

        it('should throw error for null input', async () => {
            await expect(useCase.execute(null)).rejects.toThrow(DomainException);
        });
    });
});
