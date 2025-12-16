/**
 * Test suite for AuthMiddleware
 * Adapters Layer Test
 */

const { AuthMiddleware } = require('../../adapters/middleware/AuthMiddleware');

describe('AuthMiddleware', () => {
    let middleware;
    let mockVerifyTokenUseCase;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Mock verify token use case
        mockVerifyTokenUseCase = {
            execute: jest.fn()
        };

        // Create middleware
        middleware = new AuthMiddleware(mockVerifyTokenUseCase);

        // Mock Express request, response, and next
        mockReq = {
            headers: {},
            user: null
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe('Constructor', () => {
        it('should create middleware with verify token use case', () => {
            expect(middleware).toBeInstanceOf(AuthMiddleware);
            expect(middleware.verifyTokenUseCase).toBe(mockVerifyTokenUseCase);
        });
    });

    describe('authenticate()', () => {
        it('should return middleware function', () => {
            const middlewareFunc = middleware.authenticate();

            expect(typeof middlewareFunc).toBe('function');
        });

        it('should authenticate valid token and attach user to request', async () => {
            mockReq.headers.authorization = 'Bearer valid-token';

            const mockUser = {
                id: 'user-1',
                username: 'testuser',
                email: 'test@example.com'
            };

            mockVerifyTokenUseCase.execute.mockResolvedValue(mockUser);

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockVerifyTokenUseCase.execute).toHaveBeenCalledWith('valid-token');
            expect(mockReq.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should return 401 when authorization header is missing', async () => {
            mockReq.headers = {};

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockVerifyTokenUseCase.execute).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Authentication required. Please provide a valid token.'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when authorization header does not start with Bearer', async () => {
            mockReq.headers.authorization = 'Basic invalid-token';

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockVerifyTokenUseCase.execute).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Authentication required. Please provide a valid token.'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when token verification fails', async () => {
            mockReq.headers.authorization = 'Bearer invalid-token';

            mockVerifyTokenUseCase.execute.mockRejectedValue(new Error('Invalid token'));

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockVerifyTokenUseCase.execute).toHaveBeenCalledWith('invalid-token');
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid token'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when token is expired', async () => {
            mockReq.headers.authorization = 'Bearer expired-token';

            mockVerifyTokenUseCase.execute.mockRejectedValue(new Error('Token has expired'));

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Token has expired'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle error without message', async () => {
            mockReq.headers.authorization = 'Bearer invalid-token';

            mockVerifyTokenUseCase.execute.mockRejectedValue(new Error());

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid or expired token'
            });
        });

        it('should correctly extract token after Bearer prefix', async () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
            mockReq.headers.authorization = `Bearer ${token}`;

            mockVerifyTokenUseCase.execute.mockResolvedValue({
                id: 'user-1',
                username: 'testuser'
            });

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockVerifyTokenUseCase.execute).toHaveBeenCalledWith(token);
        });

        it('should not modify request if verification fails', async () => {
            mockReq.headers.authorization = 'Bearer invalid-token';
            const originalReq = { ...mockReq };

            mockVerifyTokenUseCase.execute.mockRejectedValue(new Error('Invalid token'));

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockReq.user).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty authorization header', async () => {
            mockReq.headers.authorization = '';

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('should handle authorization header with only Bearer', async () => {
            mockReq.headers.authorization = 'Bearer';

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('should handle authorization header with extra spaces', async () => {
            mockReq.headers.authorization = 'Bearer  token-with-spaces';

            mockVerifyTokenUseCase.execute.mockResolvedValue({
                id: 'user-1',
                username: 'testuser'
            });

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            // Should extract correctly (includes the space)
            expect(mockVerifyTokenUseCase.execute).toHaveBeenCalledWith(' token-with-spaces');
        });

        it('should handle case-sensitive Bearer prefix', async () => {
            mockReq.headers.authorization = 'bearer valid-token';

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            // Should fail because it's case-sensitive
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('should handle very long token', async () => {
            const longToken = 'a'.repeat(1000);
            mockReq.headers.authorization = `Bearer ${longToken}`;

            mockVerifyTokenUseCase.execute.mockResolvedValue({
                id: 'user-1',
                username: 'testuser'
            });

            const middlewareFunc = middleware.authenticate();
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockVerifyTokenUseCase.execute).toHaveBeenCalledWith(longToken);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should handle multiple middleware calls independently', async () => {
            const middlewareFunc = middleware.authenticate();

            // First call - success
            mockReq.headers.authorization = 'Bearer valid-token-1';
            mockVerifyTokenUseCase.execute.mockResolvedValue({ id: 'user-1' });
            await middlewareFunc(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);

            // Reset mocks for second call
            mockReq = { headers: { authorization: 'Bearer invalid-token' }, user: null };
            mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
            const mockNext2 = jest.fn();
            mockVerifyTokenUseCase.execute.mockRejectedValue(new Error('Invalid'));
            await middlewareFunc(mockReq, mockRes, mockNext2);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockNext2).not.toHaveBeenCalled(); // Should not call next on failure
        });
    });
});
