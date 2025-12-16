const { DomainException } = require('../../../domain/exceptions/DomainException');
const { GetTasksInputDTO, GetTasksOutputDTO } = require('../../dto/GetTaskDTO');

class GetTasksUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    async execute(inputDTO) {
        //Validate input
        if (!inputDTO || !inputDTO.userId) {
            throw DomainException.validationError('User ID is required');
        }

        //Retrieve tasks
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

        //Return output DTO
        return new GetTasksOutputDTO(tasks);
    }
}

module.exports = { GetTasksUseCase };
