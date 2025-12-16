
class UserRepository {

    async save(user) { throw new Error('Method not implemented'); }

    async findById(userId) { throw new Error('Method not implemented'); }

    async findByEmail(email) { throw new Error('Method not implemented'); }

    async findByUsername(username) { throw new Error('Method not implemented'); }
    
    async update(user) { throw new Error('Method not implemented'); }

    async delete(userId) { throw new Error('Method not implemented'); }

    async existsByEmail(email) { throw new Error('Method not implemented'); }

    async existsByUsername(username) { throw new Error('Method not implemented'); }
}

module.exports = { UserRepository };
