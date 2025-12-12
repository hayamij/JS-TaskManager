/**
 * Input DTO for changing task status
 */
class ChangeTaskStatusInputDTO {
    constructor(taskId, userId, status) {
        this.taskId = taskId;
        this.userId = userId;
        this.status = status;
    }
}

/**
 * Output DTO for changed task status
 */
class ChangeTaskStatusOutputDTO {
    constructor(taskId, title, description, status, userId, updatedAt) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.userId = userId;
        this.updatedAt = updatedAt;
    }

    static fromTask(task) {
        return new ChangeTaskStatusOutputDTO(
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.getStatus(),
            task.getUserId(),
            task.getUpdatedAt()
        );
    }
}

module.exports = { ChangeTaskStatusInputDTO, ChangeTaskStatusOutputDTO };
