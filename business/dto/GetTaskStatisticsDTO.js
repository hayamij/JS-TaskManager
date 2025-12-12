/**
 * Input DTO for getting task statistics
 */
class GetTaskStatisticsInputDTO {
    constructor(userId) {
        this.userId = userId;
    }
}

/**
 * Output DTO for task statistics
 */
class GetTaskStatisticsOutputDTO {
    constructor(total, pending, inProgress, completed, completionRate) {
        this.total = total;
        this.pending = pending;
        this.inProgress = inProgress;
        this.completed = completed;
        this.completionRate = completionRate;
    }
}

module.exports = { GetTaskStatisticsInputDTO, GetTaskStatisticsOutputDTO };
