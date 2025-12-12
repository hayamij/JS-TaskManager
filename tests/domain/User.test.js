const { User } = require('../../domain/entities/User');
const { DomainException } = require('../../domain/exceptions/DomainException');

describe('User Entity', () => {
    describe('Constructor', () => {
        it('should create a valid user', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            
            expect(user.getUsername()).toBe('johndoe');
            expect(user.getEmail()).toBe('john@example.com');
            expect(user.getPassword()).toBe('password123');
            expect(user.getId()).toBeNull();
            expect(user.getCreatedAt()).toBeInstanceOf(Date);
            expect(user.getUpdatedAt()).toBeInstanceOf(Date);
        });

        it('should lowercase email', () => {
            const user = new User('johndoe', 'JOHN@EXAMPLE.COM', 'password123');
            expect(user.getEmail()).toBe('john@example.com');
        });

        it('should throw error for invalid username - missing', () => {
            expect(() => {
                new User('', 'john@example.com', 'password123');
            }).toThrow(DomainException);
        });

        it('should throw error for invalid username - too short', () => {
            expect(() => {
                new User('ab', 'john@example.com', 'password123');
            }).toThrow('Username must be at least 3 characters');
        });

        it('should throw error for invalid username - too long', () => {
            const longUsername = 'a'.repeat(51);
            expect(() => {
                new User(longUsername, 'john@example.com', 'password123');
            }).toThrow('Username must not exceed 50 characters');
        });

        it('should throw error for invalid username - special characters', () => {
            expect(() => {
                new User('john@doe', 'john@example.com', 'password123');
            }).toThrow('Username can only contain letters, numbers, and underscores');
        });

        it('should throw error for invalid email - missing', () => {
            expect(() => {
                new User('johndoe', '', 'password123');
            }).toThrow('Email is required');
        });

        it('should throw error for invalid email - wrong format', () => {
            expect(() => {
                new User('johndoe', 'notanemail', 'password123');
            }).toThrow('Invalid email format');
        });

        it('should throw error for invalid password - missing', () => {
            expect(() => {
                new User('johndoe', 'john@example.com', '');
            }).toThrow('Password is required');
        });

        it('should throw error for invalid password - too short', () => {
            expect(() => {
                new User('johndoe', 'john@example.com', '12345');
            }).toThrow('Password must be at least 6 characters');
        });

        it('should throw error for invalid password - too long', () => {
            const longPassword = 'a'.repeat(101);
            expect(() => {
                new User('johndoe', 'john@example.com', longPassword);
            }).toThrow('Password must not exceed 100 characters');
        });
    });

    describe('reconstruct', () => {
        it('should reconstruct user from database data', () => {
            const createdAt = new Date('2025-01-01');
            const updatedAt = new Date('2025-01-02');
            
            const user = User.reconstruct(
                'user123',
                'johndoe',
                'john@example.com',
                'hashedpassword',
                createdAt,
                updatedAt
            );

            expect(user.getId()).toBe('user123');
            expect(user.getUsername()).toBe('johndoe');
            expect(user.getEmail()).toBe('john@example.com');
            expect(user.getPassword()).toBe('hashedpassword');
            expect(user.getCreatedAt()).toBe(createdAt);
            expect(user.getUpdatedAt()).toBe(updatedAt);
        });
    });

    describe('updateProfile', () => {
        it('should update username', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            user.updateProfile('newusername', null);
            
            expect(user.getUsername()).toBe('newusername');
        });

        it('should update email', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            user.updateProfile(null, 'newemail@example.com');
            
            expect(user.getEmail()).toBe('newemail@example.com');
        });

        it('should update both username and email', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            user.updateProfile('newusername', 'newemail@example.com');
            
            expect(user.getUsername()).toBe('newusername');
            expect(user.getEmail()).toBe('newemail@example.com');
        });

        it('should validate new username', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            
            expect(() => {
                user.updateProfile('ab', null);
            }).toThrow('Username must be at least 3 characters');
        });

        it('should validate new email', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            
            expect(() => {
                user.updateProfile(null, 'invalidemail');
            }).toThrow('Invalid email format');
        });
    });

    describe('changePassword', () => {
        it('should change password', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            user.changePassword('newpassword456');
            
            expect(user.getPassword()).toBe('newpassword456');
        });

        it('should validate new password', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            
            expect(() => {
                user.changePassword('12345');
            }).toThrow('Password must be at least 6 characters');
        });
    });

    describe('toPublicObject', () => {
        it('should return public data without password', () => {
            const user = new User('johndoe', 'john@example.com', 'password123');
            user.id = 'user123'; // Simulate repository setting ID
            
            const publicData = user.toPublicObject();
            
            expect(publicData).toHaveProperty('id');
            expect(publicData).toHaveProperty('username');
            expect(publicData).toHaveProperty('email');
            expect(publicData).toHaveProperty('createdAt');
            expect(publicData).toHaveProperty('updatedAt');
            expect(publicData).not.toHaveProperty('password');
        });
    });
});
