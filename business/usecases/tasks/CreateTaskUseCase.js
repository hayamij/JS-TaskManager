const { Task } = require('../../../domain/entities/Task');
const { DomainException } = require('../../../domain/exceptions/DomainException');
const { CreateTaskInputDTO, CreateTaskOutputDTO } = require('../../dto/CreateTaskDTO');

class CreateTaskUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }

    async execute(inputDTO) {
        // Validate input
        if (!inputDTO || !inputDTO.title || !inputDTO.userId) {
            throw DomainException.validationError('Title and userId are required');
        }

        //Create domain entity (with validation)
        const task = new Task(
            inputDTO.title,
            inputDTO.description,
            inputDTO.userId,
            inputDTO.startDate,
            inputDTO.deadline
        );

        //Persist
        const savedTask = await this.taskRepository.save(task);

        //Return output DTO
        return CreateTaskOutputDTO.fromTask(savedTask);
    }
}

module.exports = { CreateTaskUseCase };
