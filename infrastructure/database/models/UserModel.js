const sql = require('mssql');

class UserModel {

    static TABLE_NAME = 'Users';

    static async create(pool, { username, email, password }) {
        const request = pool.request();
        const result = await request
            .input('username', sql.NVarChar(50), username)
            .input('email', sql.NVarChar(255), email.toLowerCase())
            .input('password', sql.NVarChar(255), password)
            .query(`
                INSERT INTO ${this.TABLE_NAME} (username, email, password)
                OUTPUT INSERTED.*
                VALUES (@username, @email, @password)
            `);
        return result.recordset[0];
    }

    static async findById(pool, id) {
        const request = pool.request();
        const result = await request
            .input('id', sql.UniqueIdentifier, id)
            .query(`SELECT * FROM ${this.TABLE_NAME} WHERE id = @id`);
        return result.recordset[0] || null;
    }

    static async findByEmail(pool, email) {
        const request = pool.request();
        const result = await request
            .input('email', sql.NVarChar(255), email.toLowerCase())
            .query(`SELECT * FROM ${this.TABLE_NAME} WHERE email = @email`);
        return result.recordset[0] || null;
    }

    static async findByUsername(pool, username) {
        const request = pool.request();
        const result = await request
            .input('username', sql.NVarChar(50), username)
            .query(`SELECT * FROM ${this.TABLE_NAME} WHERE username = @username`);
        return result.recordset[0] || null;
    }

    static async existsByEmail(pool, email) {
        const request = pool.request();
        const result = await request
            .input('email', sql.NVarChar(255), email.toLowerCase())
            .query(`SELECT COUNT(*) as count FROM ${this.TABLE_NAME} WHERE email = @email`);
        return result.recordset[0].count > 0;
    }

    static async existsByUsername(pool, username) {
        const request = pool.request();
        const result = await request
            .input('username', sql.NVarChar(50), username)
            .query(`SELECT COUNT(*) as count FROM ${this.TABLE_NAME} WHERE username = @username`);
        return result.recordset[0].count > 0;
    }

    static async update(pool, id, { username, email }) {
        const request = pool.request();
        // UPDATE without OUTPUT due to trigger conflict
        await request
            .input('id', sql.UniqueIdentifier, id)
            .input('username', sql.NVarChar(50), username)
            .input('email', sql.NVarChar(255), email)
            .query(`
                UPDATE ${this.TABLE_NAME}
                SET username = @username, email = @email
                WHERE id = @id
            `);
        
        // Fetch updated record
        return await this.findById(pool, id);
    }

    static async updatePassword(pool, id, hashedPassword) {
        const request = pool.request();
        // UPDATE without OUTPUT due to trigger conflict
        await request
            .input('id', sql.UniqueIdentifier, id)
            .input('password', sql.NVarChar(255), hashedPassword)
            .query(`
                UPDATE ${this.TABLE_NAME}
                SET password = @password
                WHERE id = @id
            `);
        
        // Fetch updated record
        return await this.findById(pool, id);
    }

    static async delete(pool, id) {
        const request = pool.request();
        await request
            .input('id', sql.UniqueIdentifier, id)
            .query(`DELETE FROM ${this.TABLE_NAME} WHERE id = @id`);
    }
}

module.exports = { UserModel };
