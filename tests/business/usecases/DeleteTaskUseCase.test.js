const { DeleteTaskUseCase } = require('../../../business/usecases/tasks/DeleteTaskUseCase');
const { DeleteTaskInputDTO } = require('../../../business/dto/DeleteTaskDTO');
const { Task } = require('../../../domain/entities/Task');
const { TaskStatus } = require('../../../domain/valueobjects/TaskStatus');
const { DomainException } = require('../../../domain/exceptions/DomainException');

describe('DeleteTaskUseCase', () => {
    let useCase;
    let mockTaskRepository;

    beforeEach(() => {
        mockTaskRepository = {
            findById: jest.fn(),
            delete: jest.fn()
        };

        useCase = new DeleteTaskUseCase(mockTaskRepository);
    });

    describe('Successful deletion', () => {
        it('should delete task for authorized user', async () => {
            // Arrange
            const inputDTO = new DeleteTaskInputDTO('task123', 'user123');
            
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);
            mockTaskRepository.delete.mockResolvedValue(true);

            // Act
            const result = await useCase.execute(inputDTO);

            // Assert
            expect(result.success).toBe(true);
            expect(result.message).toContain('deleted successfully');
            expect(mockTaskRepository.delete).toHaveBeenCalledWith('task123');
        });
    });

    describe('Authorization errors', () => {
        it('should throw error when task belongs to different user', async () => {
            const inputDTO = new DeleteTaskInputDTO('task123', 'user999');
            
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);

            await expect(useCase.execute(inputDTO)).rejects.toThrow('You do not have permission to delete this task');
        });
    });

    describe('Validation errors', () => {
        it('should throw error when task not found', async () => {
            const inputDTO = new DeleteTaskInputDTO('nonexistent', 'user123');
            mockTaskRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(inputDTO)).rejects.toThrow('Task with ID nonexistent not found');
        });

        it('should throw error for missing taskId', async () => {
            const inputDTO = new DeleteTaskInputDTO('', 'user123');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Task ID and User ID are required');
        });

        it('should throw error for missing userId', async () => {
            const inputDTO = new DeleteTaskInputDTO('task123', '');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Task ID and User ID are required');
        });

        it('should throw error for null input', async () => {
            await expect(useCase.execute(null)).rejects.toThrow(DomainException);
        });
    });
});
