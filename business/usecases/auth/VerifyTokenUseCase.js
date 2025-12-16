const { DomainException } = require('../../../domain/exceptions/DomainException');
const { VerifyTokenInputDTO, VerifyTokenOutputDTO } = require('../../dto/VerifyTokenDTO');

class VerifyTokenUseCase {
    constructor(tokenService, userRepository) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    async execute(token) {
        //Validate input
        if (!token) {
            throw DomainException.unauthorized('Token is required');
        }

        try {
            //Verify and decode token
            const payload = await this.tokenService.verify(token);

            //Optional - Check if user still exists
            const user = await this.userRepository.findById(payload.userId);
            if (!user) {
                throw DomainException.unauthorized('User no longer exists');
            }

            //Return user information
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
