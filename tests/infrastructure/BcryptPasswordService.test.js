const { BcryptPasswordService } = require('../../infrastructure/security/BcryptPasswordService');

describe('BcryptPasswordService', () => {
    let passwordService;

    beforeEach(() => {
        passwordService = new BcryptPasswordService();
    });

    describe('Constructor', () => {
        it('should create service with default salt rounds', () => {
            expect(passwordService).toBeInstanceOf(BcryptPasswordService);
            expect(passwordService.saltRounds).toBe(10);
        });

        it('should create service with custom salt rounds', () => {
            const service = new BcryptPasswordService(12);

            expect(service.saltRounds).toBe(12);
        });

        it('should accept low salt rounds', () => {
            const service = new BcryptPasswordService(4);

            expect(service.saltRounds).toBe(4);
        });

        it('should accept high salt rounds', () => {
            const service = new BcryptPasswordService(15);

            expect(service.saltRounds).toBe(15);
        });
    });

    describe('hash()', () => {
        it('should hash plain text password', async () => {
            const plainPassword = 'password123';

            const hashedPassword = await passwordService.hash(plainPassword);

            expect(typeof hashedPassword).toBe('string');
            expect(hashedPassword).not.toBe(plainPassword);
            expect(hashedPassword.length).toBeGreaterThan(0);
        });

        it('should generate different hashes for same password', async () => {
            const plainPassword = 'password123';

            const hash1 = await passwordService.hash(plainPassword);
            const hash2 = await passwordService.hash(plainPassword);

            // Hashes should be different due to salt
            expect(hash1).not.toBe(hash2);
        });

        it('should throw error when password is missing', async () => {
            await expect(passwordService.hash()).rejects.toThrow('Password is required for hashing');
        });

        it('should throw error when password is null', async () => {
            await expect(passwordService.hash(null)).rejects.toThrow('Password is required for hashing');
        });

        it('should throw error when password is empty string', async () => {
            await expect(passwordService.hash('')).rejects.toThrow('Password is required for hashing');
        });

        it('should hash very long password', async () => {
            const longPassword = 'a'.repeat(1000);

            const hashedPassword = await passwordService.hash(longPassword);

            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe('string');
        });

        it('should hash password with special characters', async () => {
            const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';

            const hashedPassword = await passwordService.hash(specialPassword);

            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe('string');
        });

        it('should hash password with unicode characters', async () => {
            const unicodePassword = 'password_密码_🔐';

            const hashedPassword = await passwordService.hash(unicodePassword);

            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe('string');
        });

        it('should hash password with spaces', async () => {
            const passwordWithSpaces = 'password with spaces';

            const hashedPassword = await passwordService.hash(passwordWithSpaces);

            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe('string');
        });

        it('should produce bcrypt format hash', async () => {
            const plainPassword = 'password123';

            const hashedPassword = await passwordService.hash(plainPassword);

            // Bcrypt hashes start with $2a$, $2b$, or $2y$
            expect(hashedPassword).toMatch(/^\$2[ayb]\$/);
        });
    });

    describe('verify()', () => {
        it('should verify correct password', async () => {
            const plainPassword = 'password123';
            const hashedPassword = await passwordService.hash(plainPassword);

            const isValid = await passwordService.verify(plainPassword, hashedPassword);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const plainPassword = 'password123';
            const hashedPassword = await passwordService.hash(plainPassword);

            const isValid = await passwordService.verify('wrongpassword', hashedPassword);

            expect(isValid).toBe(false);
        });

        it('should return false when plain password is missing', async () => {
            const hashedPassword = await passwordService.hash('password123');

            const isValid = await passwordService.verify(undefined, hashedPassword);

            expect(isValid).toBe(false);
        });

        it('should return false when plain password is null', async () => {
            const hashedPassword = await passwordService.hash('password123');

            const isValid = await passwordService.verify(null, hashedPassword);

            expect(isValid).toBe(false);
        });

        it('should return false when plain password is empty string', async () => {
            const hashedPassword = await passwordService.hash('password123');

            const isValid = await passwordService.verify('', hashedPassword);

            expect(isValid).toBe(false);
        });

        it('should return false when hashed password is missing', async () => {
            const isValid = await passwordService.verify('password123', undefined);

            expect(isValid).toBe(false);
        });

        it('should return false when hashed password is null', async () => {
            const isValid = await passwordService.verify('password123', null);

            expect(isValid).toBe(false);
        });

        it('should return false when hashed password is empty string', async () => {
            const isValid = await passwordService.verify('password123', '');

            expect(isValid).toBe(false);
        });

        it('should return false for invalid hash format', async () => {
            const isValid = await passwordService.verify('password123', 'invalid-hash');

            expect(isValid).toBe(false);
        });

        it('should verify password with special characters', async () => {
            const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const hashedPassword = await passwordService.hash(specialPassword);

            const isValid = await passwordService.verify(specialPassword, hashedPassword);

            expect(isValid).toBe(true);
        });

        it('should verify password with unicode characters', async () => {
            const unicodePassword = 'password_密码_🔐';
            const hashedPassword = await passwordService.hash(unicodePassword);

            const isValid = await passwordService.verify(unicodePassword, hashedPassword);

            expect(isValid).toBe(true);
        });

        it('should verify very long password', async () => {
            const longPassword = 'a'.repeat(1000);
            const hashedPassword = await passwordService.hash(longPassword);

            const isValid = await passwordService.verify(longPassword, hashedPassword);

            expect(isValid).toBe(true);
        });

        it('should be case sensitive', async () => {
            const plainPassword = 'Password123';
            const hashedPassword = await passwordService.hash(plainPassword);

            const isValidLower = await passwordService.verify('password123', hashedPassword);
            const isValidUpper = await passwordService.verify('PASSWORD123', hashedPassword);

            expect(isValidLower).toBe(false);
            expect(isValidUpper).toBe(false);
        });

        it('should reject password with extra spaces', async () => {
            const plainPassword = 'password123';
            const hashedPassword = await passwordService.hash(plainPassword);

            const isValid = await passwordService.verify('password123 ', hashedPassword);

            expect(isValid).toBe(false);
        });

        it('should reject password with missing characters', async () => {
            const plainPassword = 'password123';
            const hashedPassword = await passwordService.hash(plainPassword);

            const isValid = await passwordService.verify('password12', hashedPassword);

            expect(isValid).toBe(false);
        });
    });

    describe('Integration', () => {
        it('should hash and verify multiple passwords', async () => {
            const passwords = ['password1', 'password2', 'password3'];
            const hashes = [];

            // Hash all passwords
            for (const password of passwords) {
                const hash = await passwordService.hash(password);
                hashes.push(hash);
            }

            // Verify all passwords
            for (let i = 0; i < passwords.length; i++) {
                const isValid = await passwordService.verify(passwords[i], hashes[i]);
                expect(isValid).toBe(true);
            }

            // Cross-verify (should all fail)
            for (let i = 0; i < passwords.length; i++) {
                for (let j = 0; j < hashes.length; j++) {
                    if (i !== j) {
                        const isValid = await passwordService.verify(passwords[i], hashes[j]);
                        expect(isValid).toBe(false);
                    }
                }
            }
        });

        it('should work with different salt rounds', async () => {
            const password = 'password123';
            const services = [
                new BcryptPasswordService(4),
                new BcryptPasswordService(8),
                new BcryptPasswordService(10),
                new BcryptPasswordService(12)
            ];

            for (const service of services) {
                const hash = await service.hash(password);
                const isValid = await service.verify(password, hash);

                expect(isValid).toBe(true);
            }
        });

        it('should verify hash from different service instance', async () => {
            const password = 'password123';
            const service1 = new BcryptPasswordService(10);
            const service2 = new BcryptPasswordService(10);

            const hash = await service1.hash(password);
            const isValid = await service2.verify(password, hash);

            expect(isValid).toBe(true);
        });
    });

    describe('Performance', () => {
        it('should hash password within reasonable time', async () => {
            const password = 'password123';
            const service = new BcryptPasswordService(8); // Lower rounds for test

            const startTime = Date.now();
            await service.hash(password);
            const endTime = Date.now();

            const duration = endTime - startTime;

            // Should complete within 1 second with 8 rounds
            expect(duration).toBeLessThan(1000);
        });

        it('should verify password within reasonable time', async () => {
            const password = 'password123';
            const service = new BcryptPasswordService(8);
            const hash = await service.hash(password);

            const startTime = Date.now();
            await service.verify(password, hash);
            const endTime = Date.now();

            const duration = endTime - startTime;

            // Verification is typically faster than hashing
            expect(duration).toBeLessThan(1000);
        });
    });

    describe('Security', () => {
        it('should produce cryptographically strong hashes', async () => {
            const password = 'password123';

            const hash = await passwordService.hash(password);

            // Bcrypt hashes should be at least 60 characters
            expect(hash.length).toBeGreaterThanOrEqual(60);
        });

        it('should include salt in hash', async () => {
            const password = 'password123';

            const hash1 = await passwordService.hash(password);
            const hash2 = await passwordService.hash(password);

            // Different salts should produce different hashes
            expect(hash1).not.toBe(hash2);

            // But both should verify correctly
            expect(await passwordService.verify(password, hash1)).toBe(true);
            expect(await passwordService.verify(password, hash2)).toBe(true);
        });

        it('should not reveal original password from hash', async () => {
            const password = 'password123';

            const hash = await passwordService.hash(password);

            // Hash should not contain the original password
            expect(hash).not.toContain(password);
        });
    });

    describe('Edge Cases', () => {
        it('should handle single character password', async () => {
            const password = 'a';

            const hash = await passwordService.hash(password);
            const isValid = await passwordService.verify(password, hash);

            expect(isValid).toBe(true);
        });

        it('should handle numeric password', async () => {
            const password = '12345678';

            const hash = await passwordService.hash(password);
            const isValid = await passwordService.verify(password, hash);

            expect(isValid).toBe(true);
        });

        it('should handle password with only spaces', async () => {
            const password = '     ';

            const hash = await passwordService.hash(password);
            const isValid = await passwordService.verify(password, hash);

            expect(isValid).toBe(true);
        });

        it('should handle password with newlines', async () => {
            const password = 'password\nwith\nnewlines';

            const hash = await passwordService.hash(password);
            const isValid = await passwordService.verify(password, hash);

            expect(isValid).toBe(true);
        });

        it('should handle password with tabs', async () => {
            const password = 'password\twith\ttabs';

            const hash = await passwordService.hash(password);
            const isValid = await passwordService.verify(password, hash);

            expect(isValid).toBe(true);
        });
    });
});
