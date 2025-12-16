
class TaskDisplayController {

    constructor(
        getTaskForDisplayUseCase,
        getTaskListForDisplayUseCase,
        getStatisticsForDisplayUseCase
    ) {
        this.getTaskForDisplayUseCase = getTaskForDisplayUseCase;
        this.getTaskListForDisplayUseCase = getTaskListForDisplayUseCase;
        this.getStatisticsForDisplayUseCase = getStatisticsForDisplayUseCase;
    }

    async getTaskForDisplay(req, res, next) {
        try {
            const taskId = req.params.id;
            const userId = req.user.userId;

            const taskDTO = await this.getTaskForDisplayUseCase.execute(taskId, userId);

            res.status(200).json({
                success: true,
                task: taskDTO.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    async getTaskListForDisplay(req, res, next) {
        try {
            const userId = req.user.userId; 
            const statusFilter = req.query.status || null; 

            const result = await this.getTaskListForDisplayUseCase.execute(userId, statusFilter);

            res.status(200).json({
                success: true,
                tasks: result.tasks.map(dto => dto.toJSON()),
                count: result.count,
                filter: result.filter,
                emptyMessage: result.emptyMessage
            });
        } catch (error) {
            next(error);
        }
    }

    async getStatisticsForDisplay(req, res, next) {
        try {
            const userId = req.user.userId;

            const statisticsDTO = await this.getStatisticsForDisplayUseCase.execute(userId);

            res.status(200).json({
                success: true,
                statistics: statisticsDTO.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TaskDisplayController;
