
class GetTaskStatisticsInputDTO {
    constructor(userId) {
        this.userId = userId;
    }
}

class GetTaskStatisticsOutputDTO {
    constructor(total, pending, inProgress, completed, completionRate) {
        this.totalTasks = total;
        this.pendingTasks = pending;
        this.inProgressTasks = inProgress;
        this.completedTasks = completed;
        this.completionRate = completionRate;
    }
}

module.exports = { GetTaskStatisticsInputDTO, GetTaskStatisticsOutputDTO };
