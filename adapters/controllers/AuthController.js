const { RegisterUserInputDTO } = require('../../business/dto/RegisterUserDTO');
const { LoginUserInputDTO } = require('../../business/dto/LoginUserDTO');
const { DomainException } = require('../../domain/exceptions/DomainException');

class AuthController {
    constructor(registerUseCase, loginUseCase, verifyTokenUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.verifyTokenUseCase = verifyTokenUseCase;
    }

    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: username, email, password'
                });
            }

            const inputDTO = new RegisterUserInputDTO(username, email, password);

            const outputDTO = await this.registerUseCase.execute(inputDTO);

            return res.status(201).json({
                success: true,
                user_id: outputDTO.userId,
                username: outputDTO.username,
                email: outputDTO.email,
                message: 'Registration successful'
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: email, password'
                });
            }

            const inputDTO = new LoginUserInputDTO(email, password);

            const outputDTO = await this.loginUseCase.execute(inputDTO);

            return res.status(200).json({
                success: true,
                token: outputDTO.token,
                user: outputDTO.user
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getCurrentUser(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }

            const token = authHeader.substring(7);

            const user = await this.verifyTokenUseCase.execute(token);

            return res.status(200).json({
                success: true,
                user: user
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    logout(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully. Please remove token from client.'
        });
    }

    handleError(res, error) {
        if (error instanceof DomainException) {
            const statusCode = this.getStatusCodeForDomainException(error);
            return res.status(statusCode).json({
                success: false,
                error: error.message,
                errorCode: error.getErrorCode()
            });
        }

        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }

    getStatusCodeForDomainException(exception) {
        const errorCode = exception.getErrorCode();
        switch (errorCode) {
            case 'VALIDATION_ERROR':
                return 400;
            case 'DUPLICATE_ENTITY':
                return 409;
            case 'UNAUTHORIZED':
                return 401;
            case 'ENTITY_NOT_FOUND':
                return 404;
            default:
                return 400;
        }
    }
}

module.exports = { AuthController };
