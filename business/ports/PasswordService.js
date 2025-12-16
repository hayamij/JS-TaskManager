
class PasswordService {

    async hash(plainPassword) {
        throw new Error('Method not implemented');
    }

    async verify(plainPassword, hashedPassword) {
        throw new Error('Method not implemented');
    }
}

module.exports = { PasswordService };
