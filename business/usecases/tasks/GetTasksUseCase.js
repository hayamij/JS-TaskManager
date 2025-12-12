const { DomainException } = require('../../../domain/exceptions/DomainException');
const { GetTasksInputDTO, GetTasksOutputDTO } = require('../../dto/GetTaskDTO');

/**
 * Get Tasks Use Case
 * Retrieves all tasks for a user, optionally filtered by status
 */
class GetTasksUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Execute get tasks
     * @param {GetTasksInputDTO} inputDTO 
     * @returns {Promise<GetTasksOutputDTO>}
     */
    async execute(inputDTO) {
        // Step 1: Validate input
        if (!inputDTO || !inputDTO.userId) {
            throw DomainException.validationError('User ID is required');
        }

        // Step 2: Retrieve tasks
        let tasks;
        if (inputDTO.status) {
            // Filter by status
            tasks = await this.taskRepository.findByUserIdAndStatus(
                inputDTO.userId,
                inputDTO.status
            );
        } else {
            // Get all tasks for user
            tasks = await this.taskRepository.findByUserId(inputDTO.userId);
        }

        // Step 3: Return output DTO
        return new GetTasksOutputDTO(tasks);
    }
}

module.exports = { GetTasksUseCase };
