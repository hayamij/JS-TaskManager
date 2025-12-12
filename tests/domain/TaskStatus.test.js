const { TaskStatus } = require('../../domain/valueobjects/TaskStatus');

describe('TaskStatus Value Object', () => {
    describe('Constants', () => {
        it('should have PENDING status', () => {
            expect(TaskStatus.PENDING).toBe('Pending');
        });

        it('should have IN_PROGRESS status', () => {
            expect(TaskStatus.IN_PROGRESS).toBe('In Progress');
        });

        it('should have COMPLETED status', () => {
            expect(TaskStatus.COMPLETED).toBe('Completed');
        });
    });

    describe('getAllStatuses', () => {
        it('should return all status values', () => {
            const statuses = TaskStatus.getAllStatuses();
            
            expect(statuses).toHaveLength(3);
            expect(statuses).toContain('Pending');
            expect(statuses).toContain('In Progress');
            expect(statuses).toContain('Completed');
        });
    });

    describe('isValid', () => {
        it('should validate Pending', () => {
            expect(TaskStatus.isValid('Pending')).toBe(true);
        });

        it('should validate In Progress', () => {
            expect(TaskStatus.isValid('In Progress')).toBe(true);
        });

        it('should validate Completed', () => {
            expect(TaskStatus.isValid('Completed')).toBe(true);
        });

        it('should reject invalid status', () => {
            expect(TaskStatus.isValid('InvalidStatus')).toBe(false);
        });

        it('should reject null', () => {
            expect(TaskStatus.isValid(null)).toBe(false);
        });

        it('should reject undefined', () => {
            expect(TaskStatus.isValid(undefined)).toBe(false);
        });
    });

    describe('fromString', () => {
        it('should convert valid string to status', () => {
            expect(TaskStatus.fromString('Pending')).toBe('Pending');
            expect(TaskStatus.fromString('In Progress')).toBe('In Progress');
            expect(TaskStatus.fromString('Completed')).toBe('Completed');
        });

        it('should handle case-insensitive input', () => {
            expect(TaskStatus.fromString('pending')).toBe('Pending');
            expect(TaskStatus.fromString('in progress')).toBe('In Progress');
            expect(TaskStatus.fromString('COMPLETED')).toBe('Completed');
        });

        it('should default to PENDING for null', () => {
            expect(TaskStatus.fromString(null)).toBe('Pending');
        });

        it('should default to PENDING for undefined', () => {
            expect(TaskStatus.fromString(undefined)).toBe('Pending');
        });

        it('should default to PENDING for empty string', () => {
            expect(TaskStatus.fromString('')).toBe('Pending');
        });

        it('should throw error for invalid status', () => {
            expect(() => {
                TaskStatus.fromString('InvalidStatus');
            }).toThrow('Invalid task status: InvalidStatus');
        });
    });
});
