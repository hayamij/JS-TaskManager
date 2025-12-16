
class AuthMiddleware {
    constructor(verifyTokenUseCase) {
        this.verifyTokenUseCase = verifyTokenUseCase;
    }

    authenticate() {
        return async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required. Please provide a valid token.'
                    });
                }

                const token = authHeader.substring(7); // Remove 'Bearer ' prefix

                const user = await this.verifyTokenUseCase.execute(token);

                req.user = user;

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
