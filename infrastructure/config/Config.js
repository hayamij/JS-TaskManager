const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Configuration Manager
 * Infrastructure layer
 */
class Config {
    static get PORT() {
        return process.env.PORT || 3000;
    }

    static get DB_CONFIG() {
        return {
            user: process.env.DB_USER || 'sa',
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER || 'localhost',
            database: process.env.DB_DATABASE || 'TaskManager',
            port: parseInt(process.env.DB_PORT) || 1433,
            options: {
                encrypt: process.env.DB_ENCRYPT === 'true',
                trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
            }
        };
    }

    static get JWT_SECRET() {
        if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET must be defined in production');
        }
        return process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    }

    static get JWT_EXPIRES_IN() {
        return process.env.JWT_EXPIRES_IN || '1d';
    }

    static get NODE_ENV() {
        return process.env.NODE_ENV || 'development';
    }

    static get BCRYPT_SALT_ROUNDS() {
        return parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    }

    static get CORS_ORIGIN() {
        return process.env.CORS_ORIGIN || '*';
    }

    static isProduction() {
        return this.NODE_ENV === 'production';
    }

    static isDevelopment() {
        return this.NODE_ENV === 'development';
    }

    static isTest() {
        return this.NODE_ENV === 'test';
    }
}

module.exports = { Config };
