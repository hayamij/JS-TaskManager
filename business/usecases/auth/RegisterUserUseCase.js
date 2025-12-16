const { User } = require('../../../domain/entities/User');
const { DomainException } = require('../../../domain/exceptions/DomainException');
const { RegisterUserInputDTO, RegisterUserOutputDTO } = require('../../dto/RegisterUserDTO');

class RegisterUserUseCase {
    constructor(userRepository, passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    async execute(inputDTO) {
        //Validate input
        if (!inputDTO || !inputDTO.username || !inputDTO.email || !inputDTO.password) {
            throw DomainException.validationError('Username, email, and password are required');
        }

        //Check for duplicates
        const existingEmail = await this.userRepository.findByEmail(inputDTO.email);
        if (existingEmail) {
            throw DomainException.duplicateEntity('User', 'email', inputDTO.email);
        }

        const existingUsername = await this.userRepository.findByUsername(inputDTO.username);
        if (existingUsername) {
            throw DomainException.duplicateEntity('User', 'username', inputDTO.username);
        }

        //Create domain entity (with validation)
        const user = new User(inputDTO.username, inputDTO.email, inputDTO.password);

        //Hash password
        const hashedPassword = await this.passwordService.hash(user.getPassword());
        user.password = hashedPassword; // Direct assignment for hashing

        //Persist
        const savedUser = await this.userRepository.save(user);

        //Return output DTO
        return RegisterUserOutputDTO.fromUser(savedUser);
    }
}

module.exports = { RegisterUserUseCase };
