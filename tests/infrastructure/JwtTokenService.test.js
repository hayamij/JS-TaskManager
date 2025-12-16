/**
 * Test suite for JwtTokenService
 * Infrastructure Layer Test
 */

const { JwtTokenService } = require('../../infrastructure/security/JwtTokenService');
const jwt = require('jsonwebtoken');

describe('JwtTokenService', () => {
    let tokenService;
    const testSecret = 'test-secret-key';
    const testExpiresIn = '1h';

    beforeEach(() => {
        tokenService = new JwtTokenService(testSecret, testExpiresIn);
    });

    describe('Constructor', () => {
        it('should create service with secret and expiresIn', () => {
            expect(tokenService).toBeInstanceOf(JwtTokenService);
            expect(tokenService.secret).toBe(testSecret);
            expect(tokenService.expiresIn).toBe(testExpiresIn);
        });

        it('should throw error when secret is missing', () => {
            expect(() => {
                new JwtTokenService();
            }).toThrow('JWT secret is required');
        });

        it('should throw error when secret is null', () => {
            expect(() => {
                new JwtTokenService(null);
            }).toThrow('JWT secret is required');
        });

        it('should throw error when secret is empty string', () => {
            expect(() => {
                new JwtTokenService('');
            }).toThrow('JWT secret is required');
        });

        it('should use default expiresIn when not provided', () => {
            const service = new JwtTokenService(testSecret);

            expect(service.expiresIn).toBe('1d');
        });
    });

    describe('generate()', () => {
        it('should generate valid JWT token with payload', async () => {
            const payload = { userId: 'user-1', username: 'testuser' };

            const token = await tokenService.generate(payload);

            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);

            // Verify token can be decoded
            const decoded = jwt.decode(token);
            expect(decoded.userId).toBe('user-1');
            expect(decoded.username).toBe('testuser');
        });

        it('should include expiration in token', async () => {
            const payload = { userId: 'user-1' };

            const token = await tokenService.generate(payload);

            const decoded = jwt.decode(token);
            expect(decoded.exp).toBeDefined();
            expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
        });

        it('should throw error when payload is missing', async () => {
            await expect(tokenService.generate()).rejects.toThrow('Payload is required for token generation');
        });

        it('should throw error when payload is null', async () => {
            await expect(tokenService.generate(null)).rejects.toThrow('Payload is required for token generation');
        });

        it('should handle empty payload object', async () => {
            const token = await tokenService.generate({});

            expect(typeof token).toBe('string');
            const decoded = jwt.decode(token);
            expect(decoded).toMatchObject({});
        });

        it('should handle complex payload', async () => {
            const payload = {
                userId: 'user-1',
                username: 'testuser',
                email: 'test@example.com',
                roles: ['user', 'admin'],
                metadata: {
                    createdAt: new Date().toISOString()
                }
            };

            const token = await tokenService.generate(payload);

            const decoded = jwt.decode(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.roles).toEqual(payload.roles);
            expect(decoded.metadata).toEqual(payload.metadata);
        });

        it('should generate different tokens for same payload', async () => {
            const payload = { userId: 'user-1' };

            const token1 = await tokenService.generate(payload);
            // Wait 1.1 seconds to ensure different iat timestamp
            await new Promise(resolve => setTimeout(resolve, 1100));
            const token2 = await tokenService.generate(payload);

            expect(token1).not.toBe(token2);
        });
    });

    describe('verify()', () => {
        it('should verify and decode valid token', async () => {
            const payload = { userId: 'user-1', username: 'testuser' };
            const token = await tokenService.generate(payload);

            const decoded = await tokenService.verify(token);

            expect(decoded.userId).toBe('user-1');
            expect(decoded.username).toBe('testuser');
        });

        it('should throw error when token is missing', async () => {
            await expect(tokenService.verify()).rejects.toThrow('Token is required for verification');
        });

        it('should throw error when token is null', async () => {
            await expect(tokenService.verify(null)).rejects.toThrow('Token is required for verification');
        });

        it('should throw error when token is empty string', async () => {
            await expect(tokenService.verify('')).rejects.toThrow('Token is required for verification');
        });

        it('should throw error for invalid token', async () => {
            await expect(tokenService.verify('invalid-token')).rejects.toThrow('Invalid token');
        });

        it('should throw error for token with wrong secret', async () => {
            const payload = { userId: 'user-1' };
            const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });

            await expect(tokenService.verify(token)).rejects.toThrow('Invalid token');
        });

        it('should throw error for expired token', async () => {
            const shortLivedService = new JwtTokenService(testSecret, '1ms');
            const payload = { userId: 'user-1' };
            const token = await shortLivedService.generate(payload);

            // Wait for token to expire
            await new Promise(resolve => setTimeout(resolve, 10));

            await expect(tokenService.verify(token)).rejects.toThrow('Token has expired');
        });

        it('should verify token with correct secret', async () => {
            const payload = { userId: 'user-1' };
            const token = jwt.sign(payload, testSecret, { expiresIn: '1h' });

            const decoded = await tokenService.verify(token);

            expect(decoded.userId).toBe('user-1');
        });

        it('should include standard JWT claims', async () => {
            const payload = { userId: 'user-1' };
            const token = await tokenService.generate(payload);

            const decoded = await tokenService.verify(token);

            expect(decoded).toHaveProperty('iat'); // issued at
            expect(decoded).toHaveProperty('exp'); // expiration
        });
    });

    describe('decode()', () => {
        it('should decode token without verification', () => {
            const payload = { userId: 'user-1', username: 'testuser' };
            const token = jwt.sign(payload, testSecret, { expiresIn: '1h' });

            const decoded = tokenService.decode(token);

            expect(decoded.userId).toBe('user-1');
            expect(decoded.username).toBe('testuser');
        });

        it('should return null when token is missing', () => {
            const decoded = tokenService.decode();

            expect(decoded).toBeNull();
        });

        it('should return null when token is null', () => {
            const decoded = tokenService.decode(null);

            expect(decoded).toBeNull();
        });

        it('should return null when token is empty string', () => {
            const decoded = tokenService.decode('');

            expect(decoded).toBeNull();
        });

        it('should decode token even with wrong secret', () => {
            const payload = { userId: 'user-1' };
            const token = jwt.sign(payload, 'different-secret', { expiresIn: '1h' });

            // decode() doesn't verify, so it should still work
            const decoded = tokenService.decode(token);

            expect(decoded.userId).toBe('user-1');
        });

        it('should decode expired token', () => {
            const payload = { userId: 'user-1' };
            const token = jwt.sign(payload, testSecret, { expiresIn: '-1s' });

            const decoded = tokenService.decode(token);

            expect(decoded.userId).toBe('user-1');
        });

        it('should return null for completely invalid token', () => {
            const decoded = tokenService.decode('completely-invalid-token');

            expect(decoded).toBeNull();
        });

        it('should decode token with complex payload', () => {
            const payload = {
                userId: 'user-1',
                roles: ['user', 'admin'],
                metadata: { key: 'value' }
            };
            const token = jwt.sign(payload, testSecret);

            const decoded = tokenService.decode(token);

            expect(decoded.userId).toBe('user-1');
            expect(decoded.roles).toEqual(['user', 'admin']);
            expect(decoded.metadata).toEqual({ key: 'value' });
        });
    });

    describe('Integration', () => {
        it('should generate, verify, and decode same token', async () => {
            const payload = { userId: 'user-1', username: 'testuser' };

            const token = await tokenService.generate(payload);
            const verified = await tokenService.verify(token);
            const decoded = tokenService.decode(token);

            expect(verified.userId).toBe(payload.userId);
            expect(decoded.userId).toBe(payload.userId);
            expect(verified.username).toBe(decoded.username);
        });

        it('should handle token lifecycle', async () => {
            const payload = { userId: 'user-1' };

            // Generate
            const token = await tokenService.generate(payload);
            expect(token).toBeDefined();

            // Verify immediately (should succeed)
            const decoded = await tokenService.verify(token);
            expect(decoded.userId).toBe('user-1');

            // Decode (should always work)
            const decodedWithoutVerify = tokenService.decode(token);
            expect(decodedWithoutVerify.userId).toBe('user-1');
        });
    });

    describe('Edge Cases', () => {
        it('should handle numeric values in payload', async () => {
            const payload = { userId: 123, count: 456 };

            const token = await tokenService.generate(payload);
            const decoded = await tokenService.verify(token);

            expect(decoded.userId).toBe(123);
            expect(decoded.count).toBe(456);
        });

        it('should handle boolean values in payload', async () => {
            const payload = { isActive: true, isAdmin: false };

            const token = await tokenService.generate(payload);
            const decoded = await tokenService.verify(token);

            expect(decoded.isActive).toBe(true);
            expect(decoded.isAdmin).toBe(false);
        });

        it('should handle array values in payload', async () => {
            const payload = { roles: ['user', 'admin'], tags: [1, 2, 3] };

            const token = await tokenService.generate(payload);
            const decoded = await tokenService.verify(token);

            expect(decoded.roles).toEqual(['user', 'admin']);
            expect(decoded.tags).toEqual([1, 2, 3]);
        });

        it('should handle very long secret', () => {
            const longSecret = 'a'.repeat(1000);
            const service = new JwtTokenService(longSecret);

            expect(service.secret).toBe(longSecret);
        });

        it('should handle various expiresIn formats', async () => {
            const formats = ['1h', '1d', '7d', '30s', 60, 3600];

            for (const format of formats) {
                const service = new JwtTokenService(testSecret, format);
                const token = await service.generate({ userId: 'user-1' });
                const decoded = await service.verify(token);

                expect(decoded.userId).toBe('user-1');
            }
        });
    });
});
