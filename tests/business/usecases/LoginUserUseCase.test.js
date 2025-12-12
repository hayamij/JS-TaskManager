const { LoginUserUseCase } = require('../../../business/usecases/auth/LoginUserUseCase');
const { LoginUserInputDTO } = require('../../../business/dto/LoginUserDTO');
const { User } = require('../../../domain/entities/User');
const { DomainException } = require('../../../domain/exceptions/DomainException');

describe('LoginUserUseCase', () => {
    let useCase;
    let mockUserRepository;
    let mockPasswordService;
    let mockTokenService;

    beforeEach(() => {
        mockUserRepository = {
            findByEmail: jest.fn()
        };

        mockPasswordService = {
            verify: jest.fn()
        };

        mockTokenService = {
            generate: jest.fn()
        };

        useCase = new LoginUserUseCase(mockUserRepository, mockPasswordService, mockTokenService);
    });

    describe('Successful login', () => {
        it('should login user with valid credentials', async () => {
            // Arrange
            const inputDTO = new LoginUserInputDTO('john@example.com', 'password123');
            
            const user = User.reconstruct('user123', 'johndoe', 'john@example.com', 'hashedPassword', new Date(), new Date());
            mockUserRepository.findByEmail.mockResolvedValue(user);
            mockPasswordService.verify.mockResolvedValue(true);
            mockTokenService.generate.mockResolvedValue('jwt-token-123');

            // Act
            const result = await useCase.execute(inputDTO);

            // Assert
            expect(result.token).toBe('jwt-token-123');
            expect(result.user.id).toBe('user123');
            expect(result.user.username).toBe('johndoe');
            expect(result.user.email).toBe('john@example.com');
            expect(mockPasswordService.verify).toHaveBeenCalledWith('password123', 'hashedPassword');
        });
    });

    describe('Validation errors', () => {
        it('should throw error for missing email', async () => {
            const inputDTO = new LoginUserInputDTO('', 'password123');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Email and password are required');
        });

        it('should throw error for missing password', async () => {
            const inputDTO = new LoginUserInputDTO('john@example.com', '');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Email and password are required');
        });
    });

    describe('Authentication errors', () => {
        it('should throw error for non-existent user', async () => {
            const inputDTO = new LoginUserInputDTO('nonexistent@example.com', 'password123');
            
            mockUserRepository.findByEmail.mockResolvedValue(null);

            await expect(useCase.execute(inputDTO)).rejects.toThrow('Invalid email or password');
        });

        it('should throw error for incorrect password', async () => {
            const inputDTO = new LoginUserInputDTO('john@example.com', 'wrongpassword');
            
            const user = User.reconstruct('user123', 'johndoe', 'john@example.com', 'hashedPassword', new Date(), new Date());
            mockUserRepository.findByEmail.mockResolvedValue(user);
            mockPasswordService.verify.mockResolvedValue(false);

            await expect(useCase.execute(inputDTO)).rejects.toThrow('Invalid email or password');
        });
    });

    describe('Token generation', () => {
        it('should generate token with correct payload', async () => {
            const inputDTO = new LoginUserInputDTO('john@example.com', 'password123');
            
            const user = User.reconstruct('user123', 'johndoe', 'john@example.com', 'hashedPassword', new Date(), new Date());
            mockUserRepository.findByEmail.mockResolvedValue(user);
            mockPasswordService.verify.mockResolvedValue(true);
            mockTokenService.generate.mockResolvedValue('jwt-token');

            await useCase.execute(inputDTO);

            expect(mockTokenService.generate).toHaveBeenCalledWith({
                userId: 'user123',
                email: 'john@example.com',
                username: 'johndoe'
            });
        });
    });
});
