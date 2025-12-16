const { 
    CreateTaskInputDTO,
    UpdateTaskInputDTO,
    GetTasksInputDTO,
    GetTaskInputDTO,
    DeleteTaskInputDTO
} = require('../../business');
const { DomainException } = require('../../domain/exceptions/DomainException');

class TaskController {
    constructor(
        createTaskUseCase,
        getTasksUseCase,
        getTaskByIdUseCase,
        updateTaskUseCase,
        deleteTaskUseCase,
        changeTaskStatusUseCase,
        getTaskStatisticsUseCase
    ) {
        this.createTaskUseCase = createTaskUseCase;
        this.getTasksUseCase = getTasksUseCase;
        this.getTaskByIdUseCase = getTaskByIdUseCase;
        this.updateTaskUseCase = updateTaskUseCase;
        this.deleteTaskUseCase = deleteTaskUseCase;
        this.changeTaskStatusUseCase = changeTaskStatusUseCase;
        this.getTaskStatisticsUseCase = getTaskStatisticsUseCase;
    }

    async createTask(req, res) {
        try {
            const { title, description, startDate, deadline } = req.body;
            const userId = req.user.userId;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: title'
                });
            }

            let parsedStartDate = new Date();
            if (startDate && startDate.trim() !== '') {
                const tempDate = new Date(startDate);
                if (!isNaN(tempDate.getTime())) {
                    parsedStartDate = tempDate;
                }
            }
            
            let parsedDeadline = null;
            if (deadline && deadline.trim() !== '') {
                const tempDate = new Date(deadline);
                if (!isNaN(tempDate.getTime())) {
                    parsedDeadline = tempDate;
                }
            }

            const inputDTO = new CreateTaskInputDTO(
                title, 
                description, 
                userId, 
                parsedStartDate,
                parsedDeadline
            );
            const outputDTO = await this.createTaskUseCase.execute(inputDTO);

            return res.status(201).json({
                success: true,
                task: {
                    id: outputDTO.taskId,
                    title: outputDTO.title,
                    description: outputDTO.description,
                    status: outputDTO.status,
                    startDate: outputDTO.startDate,
                    deadline: outputDTO.deadline,
                    created_at: outputDTO.createdAt
                },
                message: 'Task created successfully'
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getTasks(req, res) {
        try {
            const userId = req.user.userId;
            const { status } = req.query;

            const inputDTO = new GetTasksInputDTO(userId, status);
            const outputDTO = await this.getTasksUseCase.execute(inputDTO);

            const tasks = outputDTO.tasks.map(task => ({
                id: task.taskId,
                title: task.title,
                description: task.description,
                status: task.status,
                userId: task.userId,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                startDate: task.startDate,
                deadline: task.deadline,
                progress: task.progress,
                isOverdue: task.isOverdue
            }));

            return res.status(200).json({
                success: true,
                tasks: tasks,
                count: outputDTO.count
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getTaskById(req, res) {
        try {
            const taskId = req.params.id;
            const userId = req.user.userId;

            const inputDTO = new GetTaskInputDTO(taskId, userId);
            const outputDTO = await this.getTaskByIdUseCase.execute(inputDTO);

            return res.status(200).json({
                success: true,
                task: {
                    id: outputDTO.taskId,
                    title: outputDTO.title,
                    description: outputDTO.description,
                    status: outputDTO.status,
                    created_at: outputDTO.createdAt,
                    updated_at: outputDTO.updatedAt,
                    startDate: outputDTO.startDate,
                    deadline: outputDTO.deadline,
                    progress: outputDTO.progress,
                    isOverdue: outputDTO.isOverdue
                }
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async updateTask(req, res) {
        try {
            const taskId = req.params.id;
            const userId = req.user.userId;
            const { title, description, status, startDate, deadline } = req.body;

            let parsedStartDate = undefined;
            if (startDate && typeof startDate === 'string' && startDate.trim() !== '') {
                const tempDate = new Date(startDate);
                if (!isNaN(tempDate.getTime())) {
                    parsedStartDate = tempDate;
                }
            }
            
            let parsedDeadline = undefined;
            if (deadline && typeof deadline === 'string' && deadline.trim() !== '') {
                const tempDate = new Date(deadline);
                if (!isNaN(tempDate.getTime())) {
                    parsedDeadline = tempDate;
                }
            } else if (deadline === null || deadline === '') {
                parsedDeadline = null;
            }

            const inputDTO = new UpdateTaskInputDTO(
                taskId, 
                title, 
                description, 
                status, 
                userId,
                parsedStartDate,
                parsedDeadline
            );
            const outputDTO = await this.updateTaskUseCase.execute(inputDTO);

            return res.status(200).json({
                success: true,
                task: {
                    id: outputDTO.taskId,
                    title: outputDTO.title,
                    description: outputDTO.description,
                    status: outputDTO.status,
                    updated_at: outputDTO.updatedAt,
                    startDate: outputDTO.startDate,
                    deadline: outputDTO.deadline
                },
                message: 'Task updated successfully'
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async deleteTask(req, res) {
        try {
            const taskId = req.params.id;
            const userId = req.user.userId;

            const inputDTO = new DeleteTaskInputDTO(taskId, userId);
            const outputDTO = await this.deleteTaskUseCase.execute(inputDTO);

            return res.status(200).json({
                success: outputDTO.success,
                message: outputDTO.message
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async changeStatus(req, res) {
        try {
            const taskId = req.params.id;
            const userId = req.user.userId;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: status'
                });
            }

            const result = await this.changeTaskStatusUseCase.execute(taskId, status, userId);

            return res.status(200).json({
                success: true,
                task: {
                    id: result.taskId,
                    title: result.title,
                    description: result.description,
                    status: result.status,
                    userId: result.userId,
                    startDate: result.startDate,
                    deadline: result.deadline,
                    progress: result.progress,
                    isOverdue: result.isOverdue,
                    updatedAt: result.updatedAt
                },
                message: 'Task status updated successfully'
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getStatistics(req, res) {
        try {
            const userId = req.user.userId;

            const statistics = await this.getTaskStatisticsUseCase.execute(userId);

            return res.status(200).json({
                success: true,
                statistics: statistics
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    handleError(res, error) {
        if (error instanceof DomainException) {
            const statusCode = this.getStatusCodeForDomainException(error);
            return res.status(statusCode).json({
                success: false,
                error: error.message,
                errorCode: error.getErrorCode()
            });
        }

        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }

    getStatusCodeForDomainException(exception) {
        const errorCode = exception.getErrorCode();
        switch (errorCode) {
            case 'VALIDATION_ERROR':
                return 400;
            case 'BUSINESS_RULE_VIOLATION':
                return 422;
            case 'UNAUTHORIZED':
                return 403;
            case 'ENTITY_NOT_FOUND':
                return 404;
            default:
                return 400;
        }
    }
}

module.exports = { TaskController };
