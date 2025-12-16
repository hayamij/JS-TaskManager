const { DomainException } = require('../../../domain/exceptions/DomainException');
const { GetTaskInputDTO, GetTaskOutputDTO } = require('../../dto/GetTaskDTO');

class GetTaskByIdUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    async execute(inputDTO) {
        //Validate input
        if (!inputDTO || !inputDTO.taskId || !inputDTO.userId) {
            throw DomainException.validationError('Task ID and User ID are required');
        }

        //Find task
        const task = await this.taskRepository.findById(inputDTO.taskId);
        
        if (!task) {
            throw DomainException.entityNotFound('Task', inputDTO.taskId);
        }

        //Authorization check - task belongs to user?
        if (!task.belongsToUser(inputDTO.userId)) {
            throw DomainException.unauthorized('You do not have permission to access this task');
        }

        //Return output DTO
        return new GetTaskOutputDTO(task);
    }
}

module.exports = { GetTaskByIdUseCase };
