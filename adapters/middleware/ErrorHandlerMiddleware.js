const { DomainException } = require('../../domain/exceptions/DomainException');
const { Config } = require('../../infrastructure/config/Config');

class ErrorHandlerMiddleware {

    static handle(err, req, res, next) {
        // Handle null/undefined errors
        if (!err) {
            return res.status(500).json({
                success: false,
                error: 'An unknown error occurred'
            });
        }

        // Log error details
        ErrorHandlerMiddleware.logError(err, req);

        // Handle domain exceptions (business rule violations)
        if (err instanceof DomainException) {
            return ErrorHandlerMiddleware.handleDomainException(err, res);
        }

        // Handle JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }

        // Handle validation errors (express-validator or custom)
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        // Handle database connection errors
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
            return res.status(503).json({
                success: false,
                error: 'Service temporarily unavailable'
            });
        }

        // Handle SQL errors
        if (err.code && err.code.startsWith('E')) {
            return ErrorHandlerMiddleware.handleDatabaseError(err, res);
        }

        // Default to 500 Internal Server Error
        ErrorHandlerMiddleware.handleUnexpectedError(err, res);
    }

    static handleDomainException(err, res) {
        const statusCodeMap = {
            'TASK_NOT_FOUND': 404,
            'USER_NOT_FOUND': 404,
            'INVALID_CREDENTIALS': 401,
            'USER_ALREADY_EXISTS': 409,
            'INVALID_TASK_DATA': 400,
            'INVALID_USER_DATA': 400,
            'INVALID_STATUS_TRANSITION': 422,
            'INVALID_DEADLINE': 400,
            'TITLE_REQUIRED': 400,
            'STATUS_REQUIRED': 400,
            'USERNAME_REQUIRED': 400,
            'PASSWORD_REQUIRED': 400,
            'UNAUTHORIZED': 401,
            'FORBIDDEN': 403
        };

        const statusCode = statusCodeMap[err.errorCode] || 400;

        return res.status(statusCode).json({
            success: false,
            error: err.message,
            code: err.errorCode
        });
    }

    static handleDatabaseError(err, res) {
        console.error('Database error:', {
            code: err.code,
            message: err.message,
            stack: Config.NODE_ENV === 'development' ? err.stack : undefined
        });

        // Common SQL Server error codes
        if (err.code === 'ELOGIN') {
            return res.status(500).json({
                success: false,
                error: 'Database authentication failed'
            });
        }

        if (err.code === 'EREQUEST') {
            return res.status(400).json({
                success: false,
                error: 'Invalid database request'
            });
        }

        if (err.code === 'ETIMEOUT') {
            return res.status(503).json({
                success: false,
                error: 'Database connection timeout'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Database error occurred'
        });
    }

    static handleUnexpectedError(err, res) {
        console.error('Unexpected error:', {
            name: err.name,
            message: err.message,
            stack: Config.NODE_ENV === 'development' ? err.stack : undefined
        });

        // Different response for development vs production
        if (Config.NODE_ENV === 'development') {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: {
                    name: err.name,
                    message: err.message,
                    stack: err.stack
                }
            });
        }

        // Production: don't expose error details
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }

    static logError(err, req) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            error: {
                name: err.name,
                message: err.message,
                code: err.code,
                stack: Config.NODE_ENV === 'development' ? err.stack : undefined
            }
        };

        // In production, you would send this to a logging service
        console.error('Error occurred:', JSON.stringify(errorLog, null, 2));
    }

    static notFound(req, res) {
        res.status(404).json({
            success: false,
            error: 'Route not found',
            path: req.originalUrl
        });
    }
}

module.exports = { ErrorHandlerMiddleware };
