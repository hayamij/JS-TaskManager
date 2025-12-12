const { ChangeTaskStatusUseCase } = require('../../../business/usecases/tasks/ChangeTaskStatusUseCase');
const { Task } = require('../../../domain/entities/Task');
const { TaskStatus } = require('../../../domain/valueobjects/TaskStatus');
const { DomainException } = require('../../../domain/exceptions/DomainException');

describe('ChangeTaskStatusUseCase', () => {
    let useCase;
    let mockTaskRepository;

    beforeEach(() => {
        mockTaskRepository = {
            findById: jest.fn(),
            update: jest.fn()
        };

        useCase = new ChangeTaskStatusUseCase(mockTaskRepository);
    });

    describe('Successful status change', () => {
        it('should change status from PENDING to IN_PROGRESS', async () => {
            // Arrange
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);
            mockTaskRepository.update.mockResolvedValue(task);

            // Act
            const result = await useCase.execute('task123', TaskStatus.IN_PROGRESS, 'user123');

            // Assert
            expect(result.status).toBe(TaskStatus.IN_PROGRESS);
            expect(mockTaskRepository.update).toHaveBeenCalled();
        });

        it('should change status from PENDING to COMPLETED', async () => {
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);
            mockTaskRepository.update.mockResolvedValue(task);

            const result = await useCase.execute('task123', TaskStatus.COMPLETED, 'user123');

            expect(result.status).toBe(TaskStatus.COMPLETED);
        });

        it('should change status from IN_PROGRESS to COMPLETED', async () => {
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.IN_PROGRESS, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);
            mockTaskRepository.update.mockResolvedValue(task);

            const result = await useCase.execute('task123', TaskStatus.COMPLETED, 'user123');

            expect(result.status).toBe(TaskStatus.COMPLETED);
        });

        it('should change status from IN_PROGRESS to PENDING', async () => {
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.IN_PROGRESS, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);
            mockTaskRepository.update.mockResolvedValue(task);

            const result = await useCase.execute('task123', TaskStatus.PENDING, 'user123');

            expect(result.status).toBe(TaskStatus.PENDING);
        });
    });

    describe('Business rule violations', () => {
        it('should throw error when trying to change COMPLETED to PENDING', async () => {
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.COMPLETED, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);

            await expect(useCase.execute('task123', TaskStatus.PENDING, 'user123')).rejects.toThrow('Cannot change completed task back to pending');
        });

        it('should allow changing COMPLETED to IN_PROGRESS', async () => {
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.COMPLETED, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);
            mockTaskRepository.update.mockResolvedValue(task);

            const result = await useCase.execute('task123', TaskStatus.IN_PROGRESS, 'user123');

            expect(result.status).toBe(TaskStatus.IN_PROGRESS);
        });
    });

    describe('Authorization errors', () => {
        it('should throw error when task belongs to different user', async () => {
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);

            await expect(useCase.execute('task123', TaskStatus.IN_PROGRESS, 'user999')).rejects.toThrow('You do not have permission to update this task');
        });
    });

    describe('Validation errors', () => {
        it('should throw error when task not found', async () => {
            mockTaskRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute('nonexistent', TaskStatus.IN_PROGRESS, 'user123')).rejects.toThrow('Task with ID nonexistent not found');
        });

        it('should throw error for invalid status', async () => {
            const task = Task.reconstruct('task123', 'Task 1', 'Description', TaskStatus.PENDING, 'user123', new Date(), new Date());
            mockTaskRepository.findById.mockResolvedValue(task);

            await expect(useCase.execute('task123', 'INVALID_STATUS', 'user123')).rejects.toThrow(DomainException);
        });

        it('should throw error for missing taskId', async () => {
            await expect(useCase.execute('', TaskStatus.IN_PROGRESS, 'user123')).rejects.toThrow('Task ID, status, and User ID are required');
        });

        it('should throw error for null input', async () => {
            await expect(useCase.execute(null, null, null)).rejects.toThrow(DomainException);
        });
    });
});
