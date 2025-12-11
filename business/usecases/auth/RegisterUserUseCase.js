const { User } = require('../../domain/entities/User');
const { DomainException } = require('../../domain/exceptions/DomainException');
const { RegisterUserInputDTO, RegisterUserOutputDTO } = require('../dto/RegisterUserDTO');

/**
 * Register User Use Case
 * Orchestrates user registration with validation and password hashing
 */
class RegisterUserUseCase {
    constructor(userRepository, passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    /**
     * Execute user registration
     * @param {RegisterUserInputDTO} inputDTO 
     * @returns {Promise<RegisterUserOutputDTO>}
     */
    async execute(inputDTO) {
        // Step 1: Validate input
        if (!inputDTO || !inputDTO.username || !inputDTO.email || !inputDTO.password) {
            throw DomainException.validationError('Username, email, and password are required');
        }

        // Step 2: Check for duplicates
        const existingEmail = await this.userRepository.findByEmail(inputDTO.email);
        if (existingEmail) {
            throw DomainException.duplicateEntity('User', 'email', inputDTO.email);
        }

        const existingUsername = await this.userRepository.findByUsername(inputDTO.username);
        if (existingUsername) {
            throw DomainException.duplicateEntity('User', 'username', inputDTO.username);
        }

        // Step 3: Create domain entity (with validation)
        const user = new User(inputDTO.username, inputDTO.email, inputDTO.password);

        // Step 4: Hash password
        const hashedPassword = await this.passwordService.hash(user.getPassword());
        user.password = hashedPassword; // Direct assignment for hashing

        // Step 5: Persist
        const savedUser = await this.userRepository.save(user);

        // Step 6: Return output DTO
        return RegisterUserOutputDTO.fromUser(savedUser);
    }
}

module.exports = { RegisterUserUseCase };
