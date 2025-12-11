const { DomainException } = require('../exceptions/DomainException');
const { TaskStatus } = require('../valueobjects/TaskStatus');

/**
 * Task Entity - Pure domain object with business logic
 * NO framework dependencies allowed
 */
class Task {
    constructor(title, description, userId) {
        this.validateTitle(title);
        this.validateUserId(userId);
        
        this.id = null; // Will be set by repository
        this.title = title.trim();
        this.description = description ? description.trim() : '';
        this.status = TaskStatus.PENDING; // Default status
        this.userId = userId;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Reconstruct task from database (skip validation)
     */
    static reconstruct(id, title, description, status, userId, createdAt, updatedAt) {
        const task = Object.create(Task.prototype);
        task.id = id;
        task.title = title;
        task.description = description;
        task.status = status;
        task.userId = userId;
        task.createdAt = createdAt;
        task.updatedAt = updatedAt;
        return task;
    }

    // Business validation methods
    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            throw DomainException.validationError('Task title is required');
        }
        if (title.trim().length === 0) {
            throw DomainException.validationError('Task title cannot be empty');
        }
        if (title.length > 200) {
            throw DomainException.validationError('Task title must not exceed 200 characters');
        }
    }

    validateUserId(userId) {
        if (!userId) {
            throw DomainException.validationError('User ID is required for task');
        }
    }

    validateStatus(status) {
        if (!TaskStatus.isValid(status)) {
            throw DomainException.validationError(
                `Invalid task status. Must be one of: ${TaskStatus.getAllStatuses().join(', ')}`
            );
        }
    }

    // Business methods
    updateTitle(newTitle) {
        this.validateTitle(newTitle);
        this.title = newTitle.trim();
        this.updatedAt = new Date();
    }

    updateDescription(newDescription) {
        this.description = newDescription ? newDescription.trim() : '';
        this.updatedAt = new Date();
    }

    updateStatus(newStatus) {
        this.validateStatus(newStatus);
        
        // Business rule: Cannot go from COMPLETED back to PENDING directly
        if (this.status === TaskStatus.COMPLETED && newStatus === TaskStatus.PENDING) {
            throw DomainException.businessRuleViolation(
                'Cannot change completed task back to pending. Set to In Progress first.'
            );
        }
        
        this.status = newStatus;
        this.updatedAt = new Date();
    }

    update(title, description, status) {
        if (title !== undefined && title !== null) {
            this.updateTitle(title);
        }
        if (description !== undefined) {
            this.updateDescription(description);
        }
        if (status !== undefined && status !== null) {
            this.updateStatus(status);
        }
        this.updatedAt = new Date();
    }

    markAsInProgress() {
        if (this.status === TaskStatus.COMPLETED) {
            throw DomainException.businessRuleViolation('Cannot restart a completed task');
        }
        this.status = TaskStatus.IN_PROGRESS;
        this.updatedAt = new Date();
    }

    markAsCompleted() {
        this.status = TaskStatus.COMPLETED;
        this.updatedAt = new Date();
    }

    reopen() {
        if (this.status === TaskStatus.COMPLETED) {
            this.status = TaskStatus.IN_PROGRESS;
        } else {
            this.status = TaskStatus.PENDING;
        }
        this.updatedAt = new Date();
    }

    // Check ownership
    belongsToUser(userId) {
        return this.userId === userId;
    }

    // Status checks
    isPending() {
        return this.status === TaskStatus.PENDING;
    }

    isInProgress() {
        return this.status === TaskStatus.IN_PROGRESS;
    }

    isCompleted() {
        return this.status === TaskStatus.COMPLETED;
    }

    // Getters
    getId() {
        return this.id;
    }

    getTitle() {
        return this.title;
    }

    getDescription() {
        return this.description;
    }

    getStatus() {
        return this.status;
    }

    getUserId() {
        return this.userId;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    // For serialization
    toObject() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            userId: this.userId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = { Task };
