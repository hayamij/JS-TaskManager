/**
 * Repository interface for Task entity
 * This is a PORT - Business layer defines the contract
 * Infrastructure layer will implement it
 */
class TaskRepository {
    /**
     * Save a new task
     * @param {Task} task 
     * @returns {Promise<Task>} Saved task with generated ID
     */
    async save(task) {
        throw new Error('Method not implemented');
    }

    /**
     * Find task by ID
     * @param {string} taskId 
     * @returns {Promise<Task|null>}
     */
    async findById(taskId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all tasks for a specific user
     * @param {string} userId 
     * @returns {Promise<Task[]>}
     */
    async findByUserId(userId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find tasks by user ID and status
     * @param {string} userId 
     * @param {string} status 
     * @returns {Promise<Task[]>}
     */
    async findByUserIdAndStatus(userId, status) {
        throw new Error('Method not implemented');
    }

    /**
     * Update existing task
     * @param {Task} task 
     * @returns {Promise<Task>}
     */
    async update(task) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete task by ID
     * @param {string} taskId 
     * @returns {Promise<boolean>}
     */
    async delete(taskId) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete all tasks for a user
     * @param {string} userId 
     * @returns {Promise<number>} Number of deleted tasks
     */
    async deleteByUserId(userId) {
        throw new Error('Method not implemented');
    }

    /**
     * Count tasks by status for a user
     * @param {string} userId 
     * @param {string} status 
     * @returns {Promise<number>}
     */
    async countByUserIdAndStatus(userId, status) {
        throw new Error('Method not implemented');
    }
}

module.exports = { TaskRepository };
