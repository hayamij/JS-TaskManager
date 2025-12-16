const { DomainException } = require('../../../domain/exceptions/DomainException');
const { UpdateTaskInputDTO, UpdateTaskOutputDTO } = require('../../dto/UpdateTaskDTO');

class UpdateTaskUseCase {
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
            throw DomainException.unauthorized('You do not have permission to update this task');
        }

        //Update task using domain logic
        try {
            task.update(inputDTO.title, inputDTO.description, inputDTO.status, inputDTO.startDate, inputDTO.deadline);
        } catch (error) {
            if (error instanceof DomainException) {
                throw error;
            }
            throw DomainException.validationError(error.message);
        }

        //Persist changes
        const updatedTask = await this.taskRepository.update(task);

        //Return output DTO
        return UpdateTaskOutputDTO.fromTask(updatedTask);
    }
}

module.exports = { UpdateTaskUseCase };
