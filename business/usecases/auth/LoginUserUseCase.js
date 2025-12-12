const { DomainException } = require('../../../domain/exceptions/DomainException');
const { LoginUserInputDTO, LoginUserOutputDTO } = require('../../dto/LoginUserDTO');

/**
 * Login User Use Case
 * Orchestrates user authentication with password verification and token generation
 */
class LoginUserUseCase {
    constructor(userRepository, passwordService, tokenService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
    }

    /**
     * Execute user login
     * @param {LoginUserInputDTO} inputDTO 
     * @returns {Promise<LoginUserOutputDTO>}
     */
    async execute(inputDTO) {
        // Step 1: Validate input
        if (!inputDTO || !inputDTO.email || !inputDTO.password) {
            throw DomainException.validationError('Email and password are required');
        }

        // Step 2: Find user by email
        const user = await this.userRepository.findByEmail(inputDTO.email);
        if (!user) {
            throw DomainException.unauthorized('Invalid email or password');
        }

        // Step 3: Verify password
        const isPasswordValid = await this.passwordService.verify(
            inputDTO.password,
            user.getPassword()
        );

        if (!isPasswordValid) {
            throw DomainException.unauthorized('Invalid email or password');
        }

        // Step 4: Generate JWT token
        const tokenPayload = {
            userId: user.getId(),
            email: user.getEmail(),
            username: user.getUsername()
        };

        const token = await this.tokenService.generate(tokenPayload);

        // Step 5: Return output DTO
        return new LoginUserOutputDTO(token, user);
    }
}

module.exports = { LoginUserUseCase };
