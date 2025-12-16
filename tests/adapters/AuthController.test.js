const { AuthController } = require('../../adapters/controllers/AuthController');
const { DomainException } = require('../../domain/exceptions/DomainException');

describe('AuthController', () => {
    let controller;
    let mockRegisterUseCase;
    let mockLoginUseCase;
    let mockVerifyTokenUseCase;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Mock use cases
        mockRegisterUseCase = {
            execute: jest.fn()
        };
        mockLoginUseCase = {
            execute: jest.fn()
        };
        mockVerifyTokenUseCase = {
            execute: jest.fn()
        };

        // Create controller
        controller = new AuthController(
            mockRegisterUseCase,
            mockLoginUseCase,
            mockVerifyTokenUseCase
        );

        // Mock Express request and response
        mockReq = {
            body: {},
            headers: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('Constructor', () => {
        it('should create controller with use cases', () => {
            expect(controller).toBeInstanceOf(AuthController);
            expect(controller.registerUseCase).toBe(mockRegisterUseCase);
            expect(controller.loginUseCase).toBe(mockLoginUseCase);
            expect(controller.verifyTokenUseCase).toBe(mockVerifyTokenUseCase);
        });
    });

    describe('register()', () => {
        it('should register user successfully with valid data', async () => {
            mockReq.body = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            mockRegisterUseCase.execute.mockResolvedValue({
                userId: 'user-1',
                username: 'testuser',
                email: 'test@example.com'
            });

            await controller.register(mockReq, mockRes);

            expect(mockRegisterUseCase.execute).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                user_id: 'user-1',
                username: 'testuser',
                email: 'test@example.com',
                message: 'Registration successful'
            });
        });

        it('should return 400 when username is missing', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            await controller.register(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Missing required fields: username, email, password'
            });
        });

        it('should return 400 when email is missing', async () => {
            mockReq.body = {
                username: 'testuser',
                password: 'password123'
            };

            await controller.register(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Missing required fields: username, email, password'
            });
        });

        it('should return 400 when password is missing', async () => {
            mockReq.body = {
                username: 'testuser',
                email: 'test@example.com'
            };

            await controller.register(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Missing required fields: username, email, password'
            });
        });

        it('should handle domain exception from use case', async () => {
            mockReq.body = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            const domainError = DomainException.duplicateEntity('User', 'email', 'test@example.com');
            mockRegisterUseCase.execute.mockRejectedValue(domainError);

            await controller.register(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.any(String),
                    errorCode: 'DUPLICATE_ENTITY'
                })
            );
        });

        it('should handle unexpected errors', async () => {
            mockReq.body = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            mockRegisterUseCase.execute.mockRejectedValue(new Error('Unexpected error'));

            await controller.register(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error'
            });
        });
    });

    describe('login()', () => {
        it('should login user successfully with valid credentials', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockLoginUseCase.execute.mockResolvedValue({
                token: 'jwt-token',
                user: {
                    id: 'user-1',
                    username: 'testuser',
                    email: 'test@example.com'
                }
            });

            await controller.login(mockReq, mockRes);

            expect(mockLoginUseCase.execute).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                token: 'jwt-token',
                user: expect.objectContaining({
                    id: 'user-1',
                    username: 'testuser',
                    email: 'test@example.com'
                })
            });
        });

        it('should return 400 when email is missing', async () => {
            mockReq.body = {
                password: 'password123'
            };

            await controller.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Missing required fields: email, password'
            });
        });

        it('should return 400 when password is missing', async () => {
            mockReq.body = {
                email: 'test@example.com'
            };

            await controller.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Missing required fields: email, password'
            });
        });

        it('should handle invalid credentials error', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            const domainError = DomainException.unauthorized('Invalid credentials');
            mockLoginUseCase.execute.mockRejectedValue(domainError);

            await controller.login(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Invalid credentials',
                    errorCode: 'UNAUTHORIZED'
                })
            );
        });
    });

    describe('getCurrentUser()', () => {
        it('should return user info with valid token', async () => {
            mockReq.headers.authorization = 'Bearer valid-token';

            mockVerifyTokenUseCase.execute.mockResolvedValue({
                id: 'user-1',
                username: 'testuser',
                email: 'test@example.com'
            });

            await controller.getCurrentUser(mockReq, mockRes);

            expect(mockVerifyTokenUseCase.execute).toHaveBeenCalledWith('valid-token');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                user: expect.objectContaining({
                    id: 'user-1',
                    username: 'testuser',
                    email: 'test@example.com'
                })
            });
        });

        it('should return 401 when authorization header is missing', async () => {
            mockReq.headers = {};

            await controller.getCurrentUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Not authenticated'
            });
        });

        it('should return 401 when authorization header does not start with Bearer', async () => {
            mockReq.headers.authorization = 'Basic invalid-token';

            await controller.getCurrentUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Not authenticated'
            });
        });

        it('should handle invalid token error', async () => {
            mockReq.headers.authorization = 'Bearer invalid-token';

            mockVerifyTokenUseCase.execute.mockRejectedValue(new Error('Invalid token'));

            await controller.getCurrentUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error'
            });
        });
    });

    describe('logout()', () => {
        it('should return success message', async () => {
            await controller.logout(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Logged out successfully. Please remove token from client.'
            });
        });
    });

    describe('handleError()', () => {
        it('should handle DomainException with appropriate status code', () => {
            const error = DomainException.entityNotFound('Task', '123');

            controller.handleError(mockRes, error);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.any(String),
                    errorCode: 'ENTITY_NOT_FOUND'
                })
            );
        });

        it('should handle unexpected errors with 500 status', () => {
            const error = new Error('Unexpected error');

            controller.handleError(mockRes, error);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error'
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty request body', async () => {
            mockReq.body = {};

            await controller.register(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should handle null values in request body', async () => {
            mockReq.body = {
                username: null,
                email: null,
                password: null
            };

            await controller.register(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should handle empty string in authorization header', async () => {
            mockReq.headers.authorization = '';

            await controller.getCurrentUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('should trim Bearer prefix correctly', async () => {
            mockReq.headers.authorization = 'Bearer token-with-spaces';

            mockVerifyTokenUseCase.execute.mockResolvedValue({
                id: 'user-1',
                username: 'testuser'
            });

            await controller.getCurrentUser(mockReq, mockRes);

            expect(mockVerifyTokenUseCase.execute).toHaveBeenCalledWith('token-with-spaces');
        });
    });
});
