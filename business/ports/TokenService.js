/**
 * Token Service interface
 * This is a PORT for JWT generation/verification
 * Infrastructure layer will implement using jsonwebtoken
 */
class TokenService {
    /**
     * Generate a JWT token for a user
     * @param {Object} payload - User data to encode
     * @returns {Promise<string>} JWT token
     */
    async generate(payload) {
        throw new Error('Method not implemented');
    }

    /**
     * Verify and decode a JWT token
     * @param {string} token 
     * @returns {Promise<Object>} Decoded payload
     * @throws {Error} If token is invalid or expired
     */
    async verify(token) {
        throw new Error('Method not implemented');
    }

    /**
     * Decode token without verification (for inspection)
     * @param {string} token 
     * @returns {Object|null}
     */
    decode(token) {
        throw new Error('Method not implemented');
    }
}

module.exports = { TokenService };
