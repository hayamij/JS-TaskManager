const { RegisterUserInputDTO } = require('../../business/dto/RegisterUserDTO');
const { LoginUserInputDTO } = require('../../business/dto/LoginUserDTO');
const { DomainException } = require('../../domain/exceptions/DomainException');

/**
 * Authentication Controller
 * Adapters layer - HTTP interface for auth use cases
 */
class AuthController {
    constructor(registerUseCase, loginUseCase, verifyTokenUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.verifyTokenUseCase = verifyTokenUseCase;
    }

    /**
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validate request
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: username, email, password'
                });
            }

            // Create input DTO
            const inputDTO = new RegisterUserInputDTO(username, email, password);

            // Execute use case
            const outputDTO = await this.registerUseCase.execute(inputDTO);

            // Return success response
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

    /**
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate request
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: email, password'
                });
            }

            // Create input DTO
            const inputDTO = new LoginUserInputDTO(email, password);

            // Execute use case
            const outputDTO = await this.loginUseCase.execute(inputDTO);

            // Return success response with token
            return res.status(200).json({
                success: true,
                token: outputDTO.token,
                user: outputDTO.user
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * GET /api/auth/me
     * Verify token and return user info
     */
    async getCurrentUser(req, res) {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }

            const token = authHeader.substring(7);

            // Execute use case
            const user = await this.verifyTokenUseCase.execute(token);

            // Return user info
            return res.status(200).json({
                success: true,
                user: user
            });

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * POST /api/auth/logout
     * Client-side logout (JWT is stateless)
     */
    logout(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully. Please remove token from client.'
        });
    }

    /**
     * Handle errors with appropriate HTTP status codes
     */
    handleError(res, error) {
        if (error instanceof DomainException) {
            const statusCode = this.getStatusCodeForDomainException(error);
            return res.status(statusCode).json({
                success: false,
                error: error.message,
                errorCode: error.getErrorCode()
            });
        }

        // Unexpected error
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }

    /**
     * Map domain exception to HTTP status code
     */
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
