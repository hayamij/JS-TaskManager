/**
 * Input DTO for deleting a task
 */
class DeleteTaskInputDTO {
    constructor(taskId, userId) {
        this.taskId = taskId;
        this.userId = userId; // For authorization check
    }
}

/**
 * Output DTO for deleted task
 */
class DeleteTaskOutputDTO {
    constructor(taskId, success, message) {
        this.taskId = taskId;
        this.success = success;
        this.message = message;
    }
}

module.exports = { DeleteTaskInputDTO, DeleteTaskOutputDTO };
