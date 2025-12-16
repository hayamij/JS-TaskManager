const { TaskRepository } = require('../../business/ports/TaskRepository');
const { Task } = require('../../domain/entities/Task');
const { TaskModel } = require('../../infrastructure/database/models/TaskModel');

class SqlTaskRepository extends TaskRepository {
    constructor(database) {
        super();
        this.database = database;
    }

    getPool() {
        return this.database.getPool();
    }

    async save(task) {
        const pool = this.getPool();
        const savedRow = await TaskModel.create(pool, {
            user_id: task.getUserId(),
            title: task.getTitle(),
            description: task.getDescription(),
            status: task.getStatus(),
            start_date: task.getStartDate(),
            deadline: task.getDeadline()
        });
        return this.toDomain(savedRow);
    }

    async findById(taskId) {
        const pool = this.getPool();
        const row = await TaskModel.findById(pool, taskId);
        return row ? this.toDomain(row) : null;
    }

    async findByUserId(userId) {
        const pool = this.getPool();
        const rows = await TaskModel.findByUserId(pool, userId);
        return rows.map(row => this.toDomain(row));
    }

    async findByUserIdAndStatus(userId, status) {
        const pool = this.getPool();
        const rows = await TaskModel.findByUserIdAndStatus(pool, userId, status);
        return rows.map(row => this.toDomain(row));
    }

    async update(task) {
        const pool = this.getPool();
        
        // Update title/description/dates
        let updatedRow = await TaskModel.update(pool, task.getId(), {
            title: task.getTitle(),
            description: task.getDescription(),
            start_date: task.getStartDate(),
            deadline: task.getDeadline()
        });

        if (!updatedRow) {
            throw new Error(`Task with ID ${task.getId()} not found`);
        }

        // Update status separately if needed
        updatedRow = await TaskModel.updateStatus(pool, task.getId(), task.getStatus());

        return this.toDomain(updatedRow);
    }

    async delete(taskId) {
        const pool = this.getPool();
        await TaskModel.delete(pool, taskId);
        return true;
    }

    async deleteByUserId(userId) {
        const pool = this.getPool();
        await TaskModel.deleteByUserId(pool, userId);
        return true;
    }

    async countByUserIdAndStatus(userId, status) {
        const pool = this.getPool();
        return await TaskModel.countByUserIdAndStatus(pool, userId, status);
    }

    toDomain(row) {
        const { TaskStatus } = require('../../domain/valueobjects/TaskStatus');
        
        // Handle legacy data: if start_date column doesn't exist, use created_at
        // This ensures backward compatibility with old database schemas
        const startDate = row.start_date !== undefined ? row.start_date : row.created_at;
        const deadline = row.deadline !== undefined ? row.deadline : null;
        
        return Task.reconstruct(
            row.id.toLowerCase(),
            row.title,
            row.description,
            TaskStatus.fromString(row.status),
            row.user_id.toLowerCase(),
            startDate,
            deadline,
            row.created_at,
            row.updated_at
        );
    }
}

module.exports = { SqlTaskRepository };
