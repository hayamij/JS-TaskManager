const { DomainException } = require('../../../domain/exceptions/DomainException');
const { DeleteTaskInputDTO, DeleteTaskOutputDTO } = require('../../dto/DeleteTaskDTO');

/**
 * Delete Task Use Case
 * Orchestrates task deletion with authorization
 */
class DeleteTaskUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Execute task deletion
     * @param {DeleteTaskInputDTO} inputDTO 
     * @returns {Promise<DeleteTaskOutputDTO>}
     */
    async execute(inputDTO) {
        // Step 1: Validate input
        if (!inputDTO || !inputDTO.taskId || !inputDTO.userId) {
            throw DomainException.validationError('Task ID and User ID are required');
        }

        // Step 2: Find existing task
        const task = await this.taskRepository.findById(inputDTO.taskId);
        
        if (!task) {
            throw DomainException.entityNotFound('Task', inputDTO.taskId);
        }

        // Step 3: Authorization check
        if (!task.belongsToUser(inputDTO.userId)) {
            throw DomainException.unauthorized('You do not have permission to delete this task');
        }

        // Step 4: Delete task
        const deleted = await this.taskRepository.delete(inputDTO.taskId);

        // Step 5: Return output DTO
        return new DeleteTaskOutputDTO(
            inputDTO.taskId,
            deleted,
            deleted ? 'Task deleted successfully' : 'Task deletion failed'
        );
    }
}

module.exports = { DeleteTaskUseCase };
