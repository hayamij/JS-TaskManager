const { DomainException } = require('../../domain/exceptions/DomainException');

/**
 * Verify Token Use Case
 * Validates JWT token and returns user information
 */
class VerifyTokenUseCase {
    constructor(tokenService, userRepository) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    /**
     * Execute token verification
     * @param {string} token 
     * @returns {Promise<Object>} User payload from token
     */
    async execute(token) {
        // Step 1: Validate input
        if (!token) {
            throw DomainException.unauthorized('Token is required');
        }

        try {
            // Step 2: Verify and decode token
            const payload = await this.tokenService.verify(token);

            // Step 3: Optional - Check if user still exists
            const user = await this.userRepository.findById(payload.userId);
            if (!user) {
                throw DomainException.unauthorized('User no longer exists');
            }

            // Step 4: Return user information
            return {
                userId: user.getId(),
                username: user.getUsername(),
                email: user.getEmail()
            };
        } catch (error) {
            // Token invalid or expired
            if (error instanceof DomainException) {
                throw error;
            }
            throw DomainException.unauthorized('Invalid or expired token');
        }
    }
}

module.exports = { VerifyTokenUseCase };
