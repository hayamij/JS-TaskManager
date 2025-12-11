/**
 * Input DTO for getting tasks
 */
class GetTasksInputDTO {
    constructor(userId, status = null) {
        this.userId = userId;
        this.status = status; // Optional filter by status
    }
}

/**
 * Output DTO for task list
 */
class GetTasksOutputDTO {
    constructor(tasks) {
        this.tasks = tasks.map(task => ({
            taskId: task.getId(),
            title: task.getTitle(),
            description: task.getDescription(),
            status: task.getStatus(),
            userId: task.getUserId(),
            createdAt: task.getCreatedAt(),
            updatedAt: task.getUpdatedAt()
        }));
        this.count = tasks.length;
    }
}

/**
 * Input DTO for getting a single task
 */
class GetTaskInputDTO {
    constructor(taskId, userId) {
        this.taskId = taskId;
        this.userId = userId; // For authorization check
    }
}

/**
 * Output DTO for single task
 */
class GetTaskOutputDTO {
    constructor(task) {
        this.taskId = task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.userId = task.getUserId();
        this.createdAt = task.getCreatedAt();
        this.updatedAt = task.getUpdatedAt();
    }
}

module.exports = { 
    GetTasksInputDTO, 
    GetTasksOutputDTO,
    GetTaskInputDTO,
    GetTaskOutputDTO
};
