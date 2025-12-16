const { DomainException } = require('../../../domain/exceptions/DomainException');
const { TaskStatus } = require('../../../domain/valueobjects/TaskStatus');
const { ChangeTaskStatusInputDTO, ChangeTaskStatusOutputDTO } = require('../../dto/ChangeTaskStatusDTO');

class ChangeTaskStatusUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    async execute(taskId, newStatus, userId) {
        //Validate input
        if (!taskId || !newStatus || !userId) {
            throw DomainException.validationError('Task ID, status, and User ID are required');
        }

        //Find task
        const task = await this.taskRepository.findById(taskId);
        
        if (!task) {
            throw DomainException.entityNotFound('Task', taskId);
        }

        //Authorization check
        if (!task.belongsToUser(userId)) {
            throw DomainException.unauthorized('You do not have permission to update this task');
        }

        //Update status using domain logic (enforces business rules)
        try {
            task.updateStatus(newStatus);
        } catch (error) {
            if (error instanceof DomainException) {
                throw error;
            }
            throw DomainException.validationError(error.message);
        }

        //Persist changes
        const updatedTask = await this.taskRepository.update(task);

        //Return result using DTO
        return ChangeTaskStatusOutputDTO.fromTask(updatedTask);
    }

    async markAsInProgress(taskId, userId) {
        return this.execute(taskId, TaskStatus.IN_PROGRESS, userId);
    }

    async markAsCompleted(taskId, userId) {
        return this.execute(taskId, TaskStatus.COMPLETED, userId);
    }

    async reopenTask(taskId, userId) {
        const task = await this.taskRepository.findById(taskId);
        
        if (!task) {
            throw DomainException.entityNotFound('Task', taskId);
        }

        if (!task.belongsToUser(userId)) {
            throw DomainException.unauthorized('You do not have permission to update this task');
        }

        task.reopen();
        const updatedTask = await this.taskRepository.update(task);

        return ChangeTaskStatusOutputDTO.fromTask(updatedTask);
    }
}

module.exports = { ChangeTaskStatusUseCase };
