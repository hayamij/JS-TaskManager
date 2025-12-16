const sql = require('mssql');

class SqlServerDatabase {
    constructor() {
        this.pool = null;
        this.config = null;
    }

    async connect(config) {
        try {
            this.config = {
                user: config.user,
                password: config.password,
                server: config.server,
                database: config.database,
                port: config.port || 1433,
                options: {
                    encrypt: config.options?.encrypt !== false, // Default to true for Azure
                    trustServerCertificate: config.options?.trustServerCertificate !== false, // For local dev
                    enableArithAbort: true,
                    ...config.options
                },
                connectionTimeout: config.connectionTimeout || 30000,
                requestTimeout: config.requestTimeout || 30000,
                pool: {
                    max: config.pool?.max || 10,
                    min: config.pool?.min || 0,
                    idleTimeoutMillis: config.pool?.idleTimeoutMillis || 30000
                }
            };

            this.pool = await sql.connect(this.config);
            console.log('SQL Server connected');
            console.log(`Database: ${config.database}`);
            console.log(`Server: ${config.server}`);
            return this.pool;
        } catch (error) {
            console.error('SQL Server connection error:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.close();
            console.log('SQL Server disconnected');
            this.pool = null;
        }
    }

    isConnected() {
        return this.pool && this.pool.connected;
    }

    getPool() {
        if (!this.pool) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.pool;
    }

    async query(queryString, params = {}) {
        const request = this.getPool().request();
        
        // Add parameters
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.query(queryString);
        return result;
    }

    async executeProcedure(procedureName, params = {}) {
        const request = this.getPool().request();

        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.execute(procedureName);
        return result;
    }

    async beginTransaction() {
        const transaction = new sql.Transaction(this.getPool());
        await transaction.begin();
        return transaction;
    }
}

module.exports = { SqlServerDatabase };
