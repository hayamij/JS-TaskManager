/**
 * Input DTO for updating a task
 */
class UpdateTaskInputDTO {
    constructor(taskId, title, description, status, userId) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.userId = userId; // For authorization check
    }
}

/**
 * Output DTO for updated task
 */
class UpdateTaskOutputDTO {
    constructor(taskId, title, description, status, userId, updatedAt) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.userId = userId;
        this.updatedAt = updatedAt;
    }

    static fromTask(task) {
        return new UpdateTaskOutputDTO(
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.getStatus(),
            task.getUserId(),
            task.getUpdatedAt()
        );
    }
}

module.exports = { UpdateTaskInputDTO, UpdateTaskOutputDTO };
