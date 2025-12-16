
class TaskRepository {

    async save(task) { throw new Error('Method not implemented'); }

    async findById(taskId) { throw new Error('Method not implemented'); }

    async findByUserId(userId) { throw new Error('Method not implemented'); }
    
    async findByUserIdAndStatus(userId, status) { throw new Error('Method not implemented'); }

    async update(task) { throw new Error('Method not implemented'); }

    async delete(taskId) { throw new Error('Method not implemented'); }

    async deleteByUserId(userId) { throw new Error('Method not implemented'); }

    async countByUserIdAndStatus(userId, status) { throw new Error('Method not implemented'); }
}

module.exports = { TaskRepository };
