const { DomainException } = require('../../../domain/exceptions/DomainException');
const { DeleteTaskInputDTO, DeleteTaskOutputDTO } = require('../../dto/DeleteTaskDTO');

class DeleteTaskUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    async execute(inputDTO) {
        //Validate input
        if (!inputDTO || !inputDTO.taskId || !inputDTO.userId) {
            throw DomainException.validationError('Task ID and User ID are required');
        }

        //Find existing task
        const task = await this.taskRepository.findById(inputDTO.taskId);
        
        if (!task) {
            throw DomainException.entityNotFound('Task', inputDTO.taskId);
        }

        //Authorization check
        if (!task.belongsToUser(inputDTO.userId)) {
            throw DomainException.unauthorized('You do not have permission to delete this task');
        }

        //Soft delete - Cancel task (change status to CANCELLED)
        task.cancelTask();
        const updatedTask = await this.taskRepository.update(task);

        //Return output DTO
        return new DeleteTaskOutputDTO(
            inputDTO.taskId,
            true,
            'Task cancelled successfully'
        );
    }
}

module.exports = { DeleteTaskUseCase };
