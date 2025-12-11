const { DomainException } = require('../../domain/exceptions/DomainException');
const { GetTaskInputDTO, GetTaskOutputDTO } = require('../dto/GetTaskDTO');

/**
 * Get Task By ID Use Case
 * Retrieves a single task with authorization check
 */
class GetTaskByIdUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Execute get task by ID
     * @param {GetTaskInputDTO} inputDTO 
     * @returns {Promise<GetTaskOutputDTO>}
     */
    async execute(inputDTO) {
        // Step 1: Validate input
        if (!inputDTO || !inputDTO.taskId || !inputDTO.userId) {
            throw DomainException.validationError('Task ID and User ID are required');
        }

        // Step 2: Find task
        const task = await this.taskRepository.findById(inputDTO.taskId);
        
        if (!task) {
            throw DomainException.entityNotFound('Task', inputDTO.taskId);
        }

        // Step 3: Authorization check - task belongs to user?
        if (!task.belongsToUser(inputDTO.userId)) {
            throw DomainException.unauthorized('You do not have permission to access this task');
        }

        // Step 4: Return output DTO
        return new GetTaskOutputDTO(task);
    }
}

module.exports = { GetTaskByIdUseCase };
