const bcrypt = require('bcrypt');
const { PasswordService } = require('../../business/ports/PasswordService');

/**
 * Bcrypt Password Service Implementation
 * Infrastructure layer - implements PasswordService port
 */
class BcryptPasswordService extends PasswordService {
    constructor(saltRounds = 10) {
        super();
        this.saltRounds = saltRounds;
    }

    /**
     * Hash a plain text password
     */
    async hash(plainPassword) {
        if (!plainPassword) {
            throw new Error('Password is required for hashing');
        }
        return await bcrypt.hash(plainPassword, this.saltRounds);
    }

    /**
     * Verify a plain password against a hash
     */
    async verify(plainPassword, hashedPassword) {
        if (!plainPassword || !hashedPassword) {
            return false;
        }
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = { BcryptPasswordService };
