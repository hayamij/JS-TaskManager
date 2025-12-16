
class DomainException extends Error {
    constructor(message, errorCode) {
        super(message);
        this.name = 'DomainException';
        this.errorCode = errorCode;
        this.timestamp = new Date();
    }

    static validationError(message) {
        return new DomainException(message, 'VALIDATION_ERROR');
    }

    static businessRuleViolation(message) {
        return new DomainException(message, 'BUSINESS_RULE_VIOLATION');
    }

    static entityNotFound(entityName, id) {
        return new DomainException(
            `${entityName} with ID ${id} not found`,
            'ENTITY_NOT_FOUND'
        );
    }

    static unauthorized(message = 'Unauthorized access') {
        return new DomainException(message, 'UNAUTHORIZED');
    }

    static duplicateEntity(entityName, field, value) {
        return new DomainException(
            `${entityName} with ${field} '${value}' already exists`,
            'DUPLICATE_ENTITY'
        );
    }

    getErrorCode() {
        return this.errorCode;
    }

    toJSON() {
        return {
            error: this.name,
            errorCode: this.errorCode,
            message: this.message,
            timestamp: this.timestamp
        };
    }
}

module.exports = { DomainException };
