const { RegisterUserUseCase } = require('../../../business/usecases/auth/RegisterUserUseCase');
const { RegisterUserInputDTO } = require('../../../business/dto/RegisterUserDTO');
const { User } = require('../../../domain/entities/User');
const { DomainException } = require('../../../domain/exceptions/DomainException');

describe('RegisterUserUseCase', () => {
    let useCase;
    let mockUserRepository;
    let mockPasswordService;

    beforeEach(() => {
        // Mock repositories and services
        mockUserRepository = {
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            save: jest.fn()
        };

        mockPasswordService = {
            hash: jest.fn()
        };

        useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordService);
    });

    describe('Successful registration', () => {
        it('should register a new user successfully', async () => {
            // Arrange
            const inputDTO = new RegisterUserInputDTO('johndoe', 'john@example.com', 'password123');
            
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockPasswordService.hash.mockResolvedValue('hashedPassword');
            
            const savedUser = User.reconstruct('user123', 'johndoe', 'john@example.com', 'hashedPassword', new Date(), new Date());
            mockUserRepository.save.mockResolvedValue(savedUser);

            // Act
            const result = await useCase.execute(inputDTO);

            // Assert
            expect(result.userId).toBe('user123');
            expect(result.username).toBe('johndoe');
            expect(result.email).toBe('john@example.com');
            expect(mockPasswordService.hash).toHaveBeenCalledWith('password123');
            expect(mockUserRepository.save).toHaveBeenCalled();
        });
    });

    describe('Validation errors', () => {
        it('should throw error for missing username', async () => {
            const inputDTO = new RegisterUserInputDTO('', 'john@example.com', 'password123');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow(DomainException);
        });

        it('should throw error for missing email', async () => {
            const inputDTO = new RegisterUserInputDTO('johndoe', '', 'password123');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Username, email, and password are required');
        });

        it('should throw error for missing password', async () => {
            const inputDTO = new RegisterUserInputDTO('johndoe', 'john@example.com', '');
            
            await expect(useCase.execute(inputDTO)).rejects.toThrow('Username, email, and password are required');
        });
    });

    describe('Duplicate checks', () => {
        it('should throw error for duplicate email', async () => {
            const inputDTO = new RegisterUserInputDTO('johndoe', 'john@example.com', 'password123');
            
            const existingUser = User.reconstruct('user456', 'otheruser', 'john@example.com', 'hash', new Date(), new Date());
            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(useCase.execute(inputDTO)).rejects.toThrow("User with email 'john@example.com' already exists");
        });

        it('should throw error for duplicate username', async () => {
            const inputDTO = new RegisterUserInputDTO('johndoe', 'john@example.com', 'password123');
            
            mockUserRepository.findByEmail.mockResolvedValue(null);
            const existingUser = User.reconstruct('user456', 'johndoe', 'other@example.com', 'hash', new Date(), new Date());
            mockUserRepository.findByUsername.mockResolvedValue(existingUser);

            await expect(useCase.execute(inputDTO)).rejects.toThrow("User with username 'johndoe' already exists");
        });
    });
});
