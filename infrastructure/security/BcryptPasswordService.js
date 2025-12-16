const bcrypt = require('bcrypt');
const { PasswordService } = require('../../business/ports/PasswordService');

class BcryptPasswordService extends PasswordService {
    constructor(saltRounds = 10) {
        super();
        this.saltRounds = saltRounds;
    }

    async hash(plainPassword) {
        if (!plainPassword) {
            throw new Error('Password is required for hashing');
        }
        return await bcrypt.hash(plainPassword, this.saltRounds);
    }
    
    async verify(plainPassword, hashedPassword) {
        if (!plainPassword || !hashedPassword) {
            return false;
        }
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = { BcryptPasswordService };
