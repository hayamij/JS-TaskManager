/**
 * Input DTO for creating a task
 */
class CreateTaskInputDTO {
    constructor(title, description, userId) {
        this.title = title;
        this.description = description;
        this.userId = userId;
    }
}

/**
 * Output DTO for created task
 */
class CreateTaskOutputDTO {
    constructor(taskId, title, description, status, userId, createdAt) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    static fromTask(task) {
        return new CreateTaskOutputDTO(
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.getStatus(),
            task.getUserId(),
            task.getCreatedAt()
        );
    }
}

module.exports = { CreateTaskInputDTO, CreateTaskOutputDTO };
