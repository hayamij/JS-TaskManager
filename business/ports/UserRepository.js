/**
 * Repository interface for User entity
 * This is a PORT - Business layer defines the contract
 * Infrastructure layer will implement it
 */
class UserRepository {
    /**
     * Save a new user
     * @param {User} user 
     * @returns {Promise<User>} Saved user with generated ID
     */
    async save(user) {
        throw new Error('Method not implemented');
    }

    /**
     * Find user by ID
     * @param {string} userId 
     * @returns {Promise<User|null>}
     */
    async findById(userId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find user by email
     * @param {string} email 
     * @returns {Promise<User|null>}
     */
    async findByEmail(email) {
        throw new Error('Method not implemented');
    }

    /**
     * Find user by username
     * @param {string} username 
     * @returns {Promise<User|null>}
     */
    async findByUsername(username) {
        throw new Error('Method not implemented');
    }

    /**
     * Update existing user
     * @param {User} user 
     * @returns {Promise<User>}
     */
    async update(user) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete user by ID
     * @param {string} userId 
     * @returns {Promise<boolean>}
     */
    async delete(userId) {
        throw new Error('Method not implemented');
    }

    /**
     * Check if email already exists
     * @param {string} email 
     * @returns {Promise<boolean>}
     */
    async existsByEmail(email) {
        throw new Error('Method not implemented');
    }

    /**
     * Check if username already exists
     * @param {string} username 
     * @returns {Promise<boolean>}
     */
    async existsByUsername(username) {
        throw new Error('Method not implemented');
    }
}

module.exports = { UserRepository };
