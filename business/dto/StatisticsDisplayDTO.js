
class StatisticsDisplayDTO {

    constructor({
        totalTasks,
        scheduledTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        failedTasks,
        cancelledTasks,
        overdueTasks,
        completionRate,
        insights = []
    }) {
        this.totalTasks = totalTasks;
        this.scheduledTasks = scheduledTasks;
        this.pendingTasks = pendingTasks;
        this.inProgressTasks = inProgressTasks;
        this.completedTasks = completedTasks;
        this.failedTasks = failedTasks;
        this.cancelledTasks = cancelledTasks;
        this.overdueTasks = overdueTasks;
        this.completionRate = completionRate;

        this.totalTasksFormatted = this._formatTaskCount(totalTasks);
        this.scheduledTasksFormatted = this._formatTaskCount(scheduledTasks, 'đang chờ');
        this.pendingTasksFormatted = this._formatTaskCount(pendingTasks, 'chờ xử lý');
        this.inProgressTasksFormatted = this._formatTaskCount(inProgressTasks, 'đang làm');
        this.completedTasksFormatted = this._formatTaskCount(completedTasks, 'hoàn thành');
        this.failedTasksFormatted = this._formatTaskCount(failedTasks, 'không hoàn thành');
        this.cancelledTasksFormatted = this._formatTaskCount(cancelledTasks, 'đã hủy');
        this.overdueTasksFormatted = this._formatTaskCount(overdueTasks, 'quá hạn');
        this.completionRateFormatted = `${completionRate}%`;

        this.insights = insights.map(insight => insight.toJSON());
    }

    _formatTaskCount(count, context = 'công việc') {
        if (count === 0) {
            return `0 ${context}`;
        }
        return `${count} ${context}`;
    }

    toJSON() {
        return {
            totalTasks: this.totalTasks,
            scheduledTasks: this.scheduledTasks,
            pendingTasks: this.pendingTasks,
            inProgressTasks: this.inProgressTasks,
            completedTasks: this.completedTasks,
            failedTasks: this.failedTasks,
            cancelledTasks: this.cancelledTasks,
            overdueTasks: this.overdueTasks,
            completionRate: this.completionRate,

            totalTasksFormatted: this.totalTasksFormatted,
            scheduledTasksFormatted: this.scheduledTasksFormatted,
            pendingTasksFormatted: this.pendingTasksFormatted,
            inProgressTasksFormatted: this.inProgressTasksFormatted,
            completedTasksFormatted: this.completedTasksFormatted,
            failedTasksFormatted: this.failedTasksFormatted,
            cancelledTasksFormatted: this.cancelledTasksFormatted,
            overdueTasksFormatted: this.overdueTasksFormatted,
            completionRateFormatted: this.completionRateFormatted,

            insights: this.insights
        };
    }
}

module.exports = StatisticsDisplayDTO;
