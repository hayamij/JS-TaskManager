const { VerifyTokenUseCase } = require('../../../business/usecases/auth/VerifyTokenUseCase');
const { VerifyTokenInputDTO } = require('../../../business/dto/VerifyTokenDTO');
const { User } = require('../../../domain/entities/User');
const { DomainException } = require('../../../domain/exceptions/DomainException');

describe('VerifyTokenUseCase', () => {
    let useCase;
    let mockUserRepository;
    let mockTokenService;

    beforeEach(() => {
        mockUserRepository = {
            findById: jest.fn()
        };

        mockTokenService = {
            verify: jest.fn()
        };

        // Constructor signature: (tokenService, userRepository)
        useCase = new VerifyTokenUseCase(mockTokenService, mockUserRepository);
    });

    describe('Successful token verification', () => {
        it('should verify valid token and return user data', async () => {
            // Arrange
            const token = 'valid.jwt.token';
            
            const tokenPayload = { userId: 'user123' };
            // Mock must be function that returns resolved promise
            mockTokenService.verify = jest.fn().mockResolvedValue(tokenPayload);

            const user = User.reconstruct('user123', 'johndoe', 'john@example.com', 'hashedPassword', new Date(), new Date());
            mockUserRepository.findById.mockResolvedValue(user);

            // Act
            const result = await useCase.execute(token);

            // Assert
            expect(result.userId).toBe('user123');
            expect(result.username).toBe('johndoe');
            expect(result.email).toBe('john@example.com');
            expect(mockTokenService.verify).toHaveBeenCalledWith('valid.jwt.token');
            expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
        });
    });

    describe('Token verification errors', () => {
        it('should throw error for invalid token', async () => {
            const token = 'invalid.token';
            
            mockTokenService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(useCase.execute(token)).rejects.toThrow('Invalid or expired token');
        });

        it('should throw error for expired token', async () => {
            const token = 'expired.token';
            
            mockTokenService.verify.mockImplementation(() => {
                const error = new Error('Token expired');
                error.name = 'TokenExpiredError';
                throw error;
            });

            await expect(useCase.execute(token)).rejects.toThrow('Invalid or expired token');
        });

        it('should throw error when user not found after token verification', async () => {
            const token = 'valid.jwt.token';
            
            const tokenPayload = { userId: 'user123' };
            // Mock must be function that returns resolved promise
            mockTokenService.verify = jest.fn().mockResolvedValue(tokenPayload);
            mockUserRepository.findById.mockResolvedValue(null);

            // DomainException 'User no longer exists' should be thrown and rethrown
            await expect(useCase.execute(token)).rejects.toThrow('User no longer exists');
        });
    });

    describe('Validation errors', () => {
        it('should throw error for missing token', async () => {
            await expect(useCase.execute('')).rejects.toThrow('Token is required');
        });

        it('should throw error for null input', async () => {
            await expect(useCase.execute(null)).rejects.toThrow(DomainException);
        });
    });
});
