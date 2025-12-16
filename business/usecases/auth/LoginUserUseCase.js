const { DomainException } = require('../../../domain/exceptions/DomainException');
const { LoginUserInputDTO, LoginUserOutputDTO } = require('../../dto/LoginUserDTO');

class LoginUserUseCase {
    constructor(userRepository, passwordService, tokenService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
    }

    async execute(inputDTO) {
        //Validate input
        if (!inputDTO || !inputDTO.email || !inputDTO.password) {
            throw DomainException.validationError('Email and password are required');
        }

        //Find user by email
        const user = await this.userRepository.findByEmail(inputDTO.email);
        if (!user) {
            throw DomainException.unauthorized('Invalid email or password');
        }

        //Verify password
        const isPasswordValid = await this.passwordService.verify(
            inputDTO.password,
            user.getPassword()
        );

        if (!isPasswordValid) {
            throw DomainException.unauthorized('Invalid email or password');
        }

        //Generate JWT token
        const tokenPayload = {
            userId: user.getId(),
            email: user.getEmail(),
            username: user.getUsername()
        };

        const token = await this.tokenService.generate(tokenPayload);

        //Return output DTO
        return new LoginUserOutputDTO(token, user);
    }
}

module.exports = { LoginUserUseCase };
