
class DeleteTaskInputDTO {
    constructor(taskId, userId) {
        this.taskId = taskId;
        this.userId = userId;
    }
}

class DeleteTaskOutputDTO {
    constructor(taskId, success, message) {
        this.taskId = taskId;
        this.success = success;
        this.message = message;
    }
}

module.exports = { DeleteTaskInputDTO, DeleteTaskOutputDTO };
