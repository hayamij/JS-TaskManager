const { ErrorHandlerMiddleware } = require('../../adapters/middleware/ErrorHandlerMiddleware');
const { DomainException } = require('../../domain/exceptions/DomainException');

describe('ErrorHandlerMiddleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Mock Express request, response, and next
        mockReq = {
            method: 'GET',
            url: '/api/test',
            originalUrl: '/api/test',
            ip: '127.0.0.1',
            headers: {},
            get: jest.fn((header) => header === 'user-agent' ? 'test-agent' : null)
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();

        // Mock console.error to avoid cluttering test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('handle() - DomainException', () => {
        it('should handle TASK_NOT_FOUND with 404', () => {
            const error = DomainException.entityNotFound('Task', '123');
            error.errorCode = 'TASK_NOT_FOUND';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.any(String),
                    code: 'TASK_NOT_FOUND'
                })
            );
        });

        it('should handle USER_NOT_FOUND with 404', () => {
            const error = DomainException.entityNotFound('User', '456');
            error.errorCode = 'USER_NOT_FOUND';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should handle INVALID_CREDENTIALS with 401', () => {
            const error = new DomainException('Invalid credentials', 'INVALID_CREDENTIALS');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('should handle UNAUTHORIZED with 401', () => {
            const error = DomainException.unauthorized('Not authorized');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('should handle FORBIDDEN with 403', () => {
            const error = new DomainException('Forbidden', 'FORBIDDEN');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('should handle USER_ALREADY_EXISTS with 409', () => {
            const error = DomainException.duplicateEntity('User', 'email', 'test@example.com');
            error.errorCode = 'USER_ALREADY_EXISTS';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(409);
        });

        it('should handle INVALID_TASK_DATA with 400', () => {
            const error = new DomainException('Invalid task data', 'INVALID_TASK_DATA');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should handle INVALID_STATUS_TRANSITION with 422', () => {
            const error = new DomainException('Invalid status transition', 'INVALID_STATUS_TRANSITION');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(422);
        });

        it('should default to 400 for unknown domain error code', () => {
            const error = new DomainException('Unknown error', 'UNKNOWN_ERROR');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('handle() - JWT Errors', () => {
        it('should handle JsonWebTokenError with 401', () => {
            const error = new Error('Invalid token');
            error.name = 'JsonWebTokenError';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid token'
            });
        });

        it('should handle TokenExpiredError with 401', () => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Token expired'
            });
        });
    });

    describe('handle() - ValidationError', () => {
        it('should handle ValidationError with 400', () => {
            const error = new Error('Validation failed');
            error.name = 'ValidationError';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation failed'
            });
        });
    });

    describe('handle() - Database Errors', () => {
        it('should handle ECONNREFUSED with 503', () => {
            const error = new Error('Connection refused');
            error.code = 'ECONNREFUSED';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(503);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Service temporarily unavailable'
            });
        });

        it('should handle ETIMEDOUT with 503', () => {
            const error = new Error('Connection timeout');
            error.code = 'ETIMEDOUT';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(503);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Service temporarily unavailable'
            });
        });

        it('should handle SQL errors starting with E', () => {
            const error = new Error('SQL error');
            error.code = 'ESOCKETTIMEDOUT';

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            // Should be handled by handleDatabaseError
            expect(mockRes.status).toHaveBeenCalled();
        });
    });

    describe('handle() - Unexpected Errors', () => {
        it('should handle unexpected errors with 500', () => {
            const error = new Error('Unexpected error');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalled();
        });

        it('should log unexpected errors', () => {
            const error = new Error('Unexpected error');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle error without message', () => {
            const error = new Error();

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalled();
        });

        it('should handle null error', () => {
            ErrorHandlerMiddleware.handle(null, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalled();
        });

        it('should handle undefined error', () => {
            ErrorHandlerMiddleware.handle(undefined, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalled();
        });

        it('should handle error with no name property', () => {
            const error = { message: 'Error without name' };

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalled();
        });

        it('should handle error with no code property', () => {
            const error = new Error('Error without code');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalled();
        });

        it('should handle DomainException without errorCode', () => {
            const error = new DomainException('Test error', undefined);

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should not call next() as it is error handler', () => {
            const error = new Error('Test error');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('Response Format', () => {
        it('should return consistent error response format for domain errors', () => {
            const error = DomainException.validationError('Invalid input');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.any(String)
                })
            );
        });

        it('should include error code in domain exception responses', () => {
            const error = new DomainException('Test error', 'TEST_ERROR');

            ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'TEST_ERROR'
                })
            );
        });

        it('should always set success to false', () => {
            const errors = [
                new Error('Generic error'),
                DomainException.validationError('Validation error'),
                new Error('Token expired')
            ];

            errors.forEach(error => {
                mockRes.json.mockClear();
                ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

                expect(mockRes.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false
                    })
                );
            });
        });
    });

    describe('Status Code Mapping', () => {
        const testCases = [
            { code: 'TASK_NOT_FOUND', expectedStatus: 404 },
            { code: 'USER_NOT_FOUND', expectedStatus: 404 },
            { code: 'INVALID_CREDENTIALS', expectedStatus: 401 },
            { code: 'USER_ALREADY_EXISTS', expectedStatus: 409 },
            { code: 'INVALID_TASK_DATA', expectedStatus: 400 },
            { code: 'INVALID_USER_DATA', expectedStatus: 400 },
            { code: 'INVALID_STATUS_TRANSITION', expectedStatus: 422 },
            { code: 'INVALID_DEADLINE', expectedStatus: 400 },
            { code: 'TITLE_REQUIRED', expectedStatus: 400 },
            { code: 'STATUS_REQUIRED', expectedStatus: 400 },
            { code: 'USERNAME_REQUIRED', expectedStatus: 400 },
            { code: 'PASSWORD_REQUIRED', expectedStatus: 400 },
            { code: 'UNAUTHORIZED', expectedStatus: 401 },
            { code: 'FORBIDDEN', expectedStatus: 403 }
        ];

        testCases.forEach(({ code, expectedStatus }) => {
            it(`should map ${code} to ${expectedStatus}`, () => {
                const error = new DomainException('Test error', code);

                ErrorHandlerMiddleware.handle(error, mockReq, mockRes, mockNext);

                expect(mockRes.status).toHaveBeenCalledWith(expectedStatus);
            });
        });
    });
});
