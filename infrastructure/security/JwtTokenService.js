const jwt = require('jsonwebtoken');
const { TokenService } = require('../../business/ports/TokenService');

class JwtTokenService extends TokenService {
    constructor(secret, expiresIn = '1d') {
        super();
        if (!secret) {
            throw new Error('JWT secret is required');
        }
        this.secret = secret;
        this.expiresIn = expiresIn;
    }

    async generate(payload) {
        if (!payload) {
            throw new Error('Payload is required for token generation');
        }
        
        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn
        });
    }

    async verify(token) {
        if (!token) {
            throw new Error('Token is required for verification');
        }

        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    decode(token) {
        if (!token) {
            return null;
        }
        return jwt.decode(token);
    }
}

module.exports = { JwtTokenService };
