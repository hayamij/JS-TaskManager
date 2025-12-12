const { UpdateTaskUseCase } = require('../../../business/usecases/tasks/UpdateTaskUseCase');
const { UpdateTaskInputDTO } = require('../../../business/dto/UpdateTaskDTO');
const { Task } = require('../../../domain/entities/Task');
const { TaskStatus } = require('../../../domain/valueobjects/TaskStatus');
const { DomainException } = require('../../../domain/exceptions/DomainException');

describe('UpdateTaskUseCase', () => {
    let useCase;
    let mockTaskRepository;

    beforeEach(() => {
        mockTaskRepository = {
            findById: jest.fn(),
            update: jest.fn()
        };

        useCase = new UpdateTaskUseCase(mockTaskRepository);
    });

    describe('Successful update', () => {
        it('should update task successfully', async () => {
            // Arrange
            const inputDTO = new UpdateTaskInputDTO('task123', 'Updated title', 'Updated description', TaskStatus.IN_PROGRESS, 'user123');
            
            const existingTask = Task.reconstruct('task123', 'Old title', 'Old description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(existingTask);
            
            const updatedTask = Task.reconstruct('task123', 'Updated title', 'Updated description', TaskStatus.IN_PROGRESS, 'user123', new Date(), new Date());
            mockTaskRepository.update.mockResolvedValue(updatedTask);

            // Act
            const result = await useCase.execute(inputDTO);

            // Assert
            expect(result.taskId).toBe('task123');
            expect(result.title).toBe('Updated title');
            expect(result.description).toBe('Updated description');
            expect(result.status).toBe(TaskStatus.IN_PROGRESS);
        });

        it('should update only title', async () => {
            const inputDTO = new UpdateTaskInputDTO('task123', 'New title', undefined, undefined, 'user123');
            
            const existingTask = Task.reconstruct('task123', 'Old title', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(existingTask);
            mockTaskRepository.update.mockResolvedValue(existingTask);

            await useCase.execute(inputDTO);

            expect(mockTaskRepository.update).toHaveBeenCalled();
        });
    });

    describe('Validation errors', () => {
        it('should throw error for missing taskId', async () => {
            const inputDTO = new UpdateTaskInputDTO('', 'Title', 'Description', TaskStatus.PENDING, 'user123');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Task ID and User ID are required');
        });

        it('should throw error for non-existent task', async () => {
            const inputDTO = new UpdateTaskInputDTO('nonexistent', 'Title', 'Description', TaskStatus.PENDING, 'user123');
            
            mockTaskRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(inputDTO)).rejects.toThrow("Task with ID nonexistent not found");
        });
    });

    describe('Authorization', () => {
        it('should throw error when user does not own task', async () => {
            const inputDTO = new UpdateTaskInputDTO('task123', 'Title', 'Description', TaskStatus.PENDING, 'user456');
            
            const existingTask = Task.reconstruct('task123', 'Title', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(existingTask);

            await expect(useCase.execute(inputDTO)).rejects.toThrow('You do not have permission to update this task');
        });
    });

    describe('Business rules', () => {
        it('should enforce status transition rules', async () => {
            const inputDTO = new UpdateTaskInputDTO('task123', 'Title', 'Description', TaskStatus.PENDING, 'user123');
            
            const completedTask = Task.reconstruct('task123', 'Title', 'Description', TaskStatus.COMPLETED, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(completedTask);

            await expect(useCase.execute(inputDTO)).rejects.toThrow('Cannot change completed task back to pending');
        });
    });
});
