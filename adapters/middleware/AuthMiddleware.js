/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
class AuthMiddleware {
    constructor(verifyTokenUseCase) {
        this.verifyTokenUseCase = verifyTokenUseCase;
    }

    /**
     * Middleware function to verify JWT token
     */
    authenticate() {
        return async (req, res, next) => {
            try {
                // Extract token from Authorization header
                const authHeader = req.headers.authorization;
                
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required. Please provide a valid token.'
                    });
                }

                const token = authHeader.substring(7); // Remove 'Bearer ' prefix

                // Verify token using use case
                const user = await this.verifyTokenUseCase.execute(token);

                // Attach user info to request
                req.user = user;

                // Continue to next middleware/controller
                next();

            } catch (error) {
                return res.status(401).json({
                    success: false,
                    error: error.message || 'Invalid or expired token'
                });
            }
        };
    }
}

module.exports = { AuthMiddleware };
