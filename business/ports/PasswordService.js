/**
 * Password Service interface
 * This is a PORT for password hashing/verification
 * Infrastructure layer will implement using bcrypt
 */
class PasswordService {
    /**
     * Hash a plain text password
     * @param {string} plainPassword 
     * @returns {Promise<string>} Hashed password
     */
    async hash(plainPassword) {
        throw new Error('Method not implemented');
    }

    /**
     * Verify a plain password against a hash
     * @param {string} plainPassword 
     * @param {string} hashedPassword 
     * @returns {Promise<boolean>}
     */
    async verify(plainPassword, hashedPassword) {
        throw new Error('Method not implemented');
    }
}

module.exports = { PasswordService };
