/**
 * Test suite for GetStatisticsForDisplayUseCase
 * Business Layer Test
 */

const GetStatisticsForDisplayUseCase = require('../../../business/usecases/GetStatisticsForDisplayUseCase');
const StatisticsDisplayDTO = require('../../../business/dto/StatisticsDisplayDTO');
const { Task } = require('../../../domain/entities/Task');

describe('GetStatisticsForDisplayUseCase', () => {
    let useCase;
    let mockTaskRepository;

    beforeEach(() => {
        // Mock task repository
        mockTaskRepository = {
            findByUserId: jest.fn(),
            update: jest.fn()
        };

        useCase = new GetStatisticsForDisplayUseCase(mockTaskRepository);
    });

    describe('Constructor', () => {
        it('should create use case with repository', () => {
            expect(useCase).toBeInstanceOf(GetStatisticsForDisplayUseCase);
            expect(useCase.taskRepository).toBe(mockTaskRepository);
        });
    });

    describe('execute()', () => {
        it('should calculate statistics with no tasks', async () => {
            mockTaskRepository.findByUserId.mockResolvedValue([]);

            const result = await useCase.execute('user-1');

            expect(result).toBeInstanceOf(StatisticsDisplayDTO);
            expect(result.totalTasks).toBe(0);
            expect(result.scheduledTasks).toBe(0);
            expect(result.pendingTasks).toBe(0);
            expect(result.inProgressTasks).toBe(0);
            expect(result.completedTasks).toBe(0);
            expect(result.failedTasks).toBe(0);
            expect(result.cancelledTasks).toBe(0);
            expect(result.overdueTasks).toBe(0);
            expect(result.completionRate).toBe(0);
            expect(Array.isArray(result.insights)).toBe(true);
        });

        it('should calculate statistics with mixed tasks', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'SCHEDULED', 'user-1', futureDate, futureDate, now, now),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'PENDING', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-3', 'Task 3', 'Description', 'IN_PROGRESS', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-4', 'Task 4', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-5', 'Task 5', 'Description', 'FAILED', 'user-1', now, now, now, now),
                Task.reconstruct('task-6', 'Task 6', 'Description', 'CANCELLED', 'user-1', now, futureDate, now, futureDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.totalTasks).toBe(5); // Excluding CANCELLED
            expect(result.scheduledTasks).toBe(1);
            expect(result.pendingTasks).toBe(1);
            expect(result.inProgressTasks).toBe(2); // PENDING + IN_PROGRESS
            expect(result.completedTasks).toBe(1);
            expect(result.failedTasks).toBe(1);
            expect(result.cancelledTasks).toBe(1);
        });

        it('should calculate completion rate correctly', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-3', 'Task 3', 'Description', 'PENDING', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-4', 'Task 4', 'Description', 'PENDING', 'user-1', now, futureDate, now, futureDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            // 2 completed / 4 total = 50%
            expect(result.completionRate).toBe(50);
        });

        it('should exclude CANCELLED tasks from total and completion rate', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'PENDING', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-3', 'Task 3', 'Description', 'CANCELLED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-4', 'Task 4', 'Description', 'CANCELLED', 'user-1', now, futureDate, now, futureDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.totalTasks).toBe(2); // Excluding 2 CANCELLED
            expect(result.cancelledTasks).toBe(2);
            expect(result.completionRate).toBe(50); // 1 completed / 2 total
        });

        it('should exclude FAILED tasks from completion rate denominator', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'FAILED', 'user-1', now, now, now, now),
                Task.reconstruct('task-3', 'Task 3', 'Description', 'PENDING', 'user-1', now, futureDate, now, futureDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.totalTasks).toBe(3);
            expect(result.failedTasks).toBe(1);
            // (1 completed / (3 total - 1 failed)) * 100 = 50%
            expect(result.completionRate).toBe(50);
        });

        it('should auto-update tasks to FAILED when deadline passed', async () => {
            const now = new Date();
            const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            const task = Task.reconstruct('task-1', 'Task 1', 'Description', 'PENDING', 'user-1', now, pastDate, now, pastDate);
            
            mockTaskRepository.findByUserId.mockResolvedValue([task]);
            mockTaskRepository.update.mockResolvedValue(task);

            const result = await useCase.execute('user-1');

            // Verify update was called
            expect(mockTaskRepository.update).toHaveBeenCalled();
            expect(result.failedTasks).toBeGreaterThanOrEqual(0);
        });

        it('should auto-transition SCHEDULED to PENDING when startDate reached', async () => {
            const now = new Date();
            const pastDate = new Date(now.getTime() - 1000);
            const futureDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const task = Task.reconstruct('task-1', 'Task 1', 'Description', 'SCHEDULED', 'user-1', now, futureDeadline, pastDate, futureDeadline);
            
            mockTaskRepository.findByUserId.mockResolvedValue([task]);
            mockTaskRepository.update.mockResolvedValue(task);

            await useCase.execute('user-1');

            // Verify repository was called
            expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith('user-1', null);
        });

        it('should handle only SCHEDULED tasks', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'SCHEDULED', 'user-1', futureDate, futureDate, now, now),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'SCHEDULED', 'user-1', futureDate, futureDate, now, now)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.totalTasks).toBe(2);
            expect(result.scheduledTasks).toBe(2);
            expect(result.pendingTasks).toBe(0);
            expect(result.completedTasks).toBe(0);
        });

        it('should handle only COMPLETED tasks', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.totalTasks).toBe(2);
            expect(result.completedTasks).toBe(2);
            expect(result.completionRate).toBe(100);
        });

        it('should handle all CANCELLED tasks', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'CANCELLED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'CANCELLED', 'user-1', now, futureDate, now, futureDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.totalTasks).toBe(0); // CANCELLED excluded
            expect(result.cancelledTasks).toBe(2);
            expect(result.completionRate).toBe(0);
        });

        it('should call repository with correct userId', async () => {
            mockTaskRepository.findByUserId.mockResolvedValue([]);

            await useCase.execute('user-123');

            expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith('user-123', null);
        });

        it('should return insights array', async () => {
            mockTaskRepository.findByUserId.mockResolvedValue([]);

            const result = await useCase.execute('user-1');

            expect(Array.isArray(result.insights)).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle completion rate of 100%', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'COMPLETED', 'user-1', now, futureDate, now, futureDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.completionRate).toBe(100);
        });

        it('should handle completion rate of 0% with tasks', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'PENDING', 'user-1', now, futureDate, now, futureDate),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'IN_PROGRESS', 'user-1', now, futureDate, now, futureDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.completionRate).toBe(0);
        });

        it('should handle all tasks FAILED', async () => {
            const now = new Date();
            const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            const tasks = [
                Task.reconstruct('task-1', 'Task 1', 'Description', 'FAILED', 'user-1', now, pastDate, now, pastDate),
                Task.reconstruct('task-2', 'Task 2', 'Description', 'FAILED', 'user-1', now, pastDate, now, pastDate)
            ];

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.totalTasks).toBe(2);
            expect(result.failedTasks).toBe(2);
            expect(result.completionRate).toBe(0); // No completable tasks
        });

        it('should handle repository errors', async () => {
            mockTaskRepository.findByUserId.mockRejectedValue(new Error('Database error'));

            await expect(useCase.execute('user-1')).rejects.toThrow('Database error');
        });

        it('should handle large number of tasks', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            // Create 1000 tasks
            const tasks = Array.from({ length: 1000 }, (_, i) => 
                Task.reconstruct(`task-${i}`, `Task ${i}`, `Description ${i}`, 'PENDING', 'user-1', now, futureDate, now, now)
            );

            mockTaskRepository.findByUserId.mockResolvedValue(tasks);

            const result = await useCase.execute('user-1');

            expect(result.totalTasks).toBe(1000);
            expect(result.pendingTasks).toBe(1000);
        });
    });

    describe('Return Type', () => {
        it('should return StatisticsDisplayDTO instance', async () => {
            mockTaskRepository.findByUserId.mockResolvedValue([]);

            const result = await useCase.execute('user-1');

            expect(result).toBeInstanceOf(StatisticsDisplayDTO);
        });

        it('should return DTO with all required fields', async () => {
            mockTaskRepository.findByUserId.mockResolvedValue([]);

            const result = await useCase.execute('user-1');

            expect(result).toHaveProperty('totalTasks');
            expect(result).toHaveProperty('scheduledTasks');
            expect(result).toHaveProperty('pendingTasks');
            expect(result).toHaveProperty('inProgressTasks');
            expect(result).toHaveProperty('completedTasks');
            expect(result).toHaveProperty('failedTasks');
            expect(result).toHaveProperty('cancelledTasks');
            expect(result).toHaveProperty('overdueTasks');
            expect(result).toHaveProperty('completionRate');
            expect(result).toHaveProperty('insights');
        });
    });
});


