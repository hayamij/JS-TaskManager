const { DomainException } = require('../exceptions/DomainException');

/**
 * User Entity - Pure domain object with business logic
 * NO framework dependencies allowed
 */
class User {
    constructor(username, email, password) {
        this.validateUsername(username);
        this.validateEmail(email);
        this.validatePassword(password);
        
        this.id = null; // Will be set by repository
        this.username = username;
        this.email = email.toLowerCase();
        this.password = password; // Will be hashed by use case
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Reconstruct user from database (skip validation)
     */
    static reconstruct(id, username, email, hashedPassword, createdAt, updatedAt) {
        const user = Object.create(User.prototype);
        user.id = id;
        user.username = username;
        user.email = email;
        user.password = hashedPassword;
        user.createdAt = createdAt;
        user.updatedAt = updatedAt;
        return user;
    }

    // Business validation methods
    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            throw DomainException.validationError('Username is required');
        }
        if (username.length < 3) {
            throw DomainException.validationError('Username must be at least 3 characters');
        }
        if (username.length > 50) {
            throw DomainException.validationError('Username must not exceed 50 characters');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            throw DomainException.validationError('Username can only contain letters, numbers, and underscores');
        }
    }

    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            throw DomainException.validationError('Email is required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw DomainException.validationError('Invalid email format');
        }
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw DomainException.validationError('Password is required');
        }
        if (password.length < 6) {
            throw DomainException.validationError('Password must be at least 6 characters');
        }
        if (password.length > 100) {
            throw DomainException.validationError('Password must not exceed 100 characters');
        }
    }

    // Business methods
    updateProfile(username, email) {
        if (username) {
            this.validateUsername(username);
            this.username = username;
        }
        if (email) {
            this.validateEmail(email);
            this.email = email.toLowerCase();
        }
        this.updatedAt = new Date();
    }

    changePassword(newPassword) {
        this.validatePassword(newPassword);
        this.password = newPassword; // Will be hashed by use case
        this.updatedAt = new Date();
    }

    // Getters
    getId() {
        return this.id;
    }

    getUsername() {
        return this.username;
    }

    getEmail() {
        return this.email;
    }

    getPassword() {
        return this.password;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    // For safe serialization (exclude password)
    toPublicObject() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = { User };
