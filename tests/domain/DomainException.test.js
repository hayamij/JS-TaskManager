const { DomainException } = require('../../domain/exceptions/DomainException');

describe('DomainException', () => {
    describe('Constructor', () => {
        it('should create exception with message and error code', () => {
            const exception = new DomainException('Test error', 'TEST_ERROR');

            expect(exception.message).toBe('Test error');
            expect(exception.errorCode).toBe('TEST_ERROR');
            expect(exception.name).toBe('DomainException');
            expect(exception.timestamp).toBeInstanceOf(Date);
        });

        it('should be instance of Error', () => {
            const exception = new DomainException('Test error', 'TEST_ERROR');

            expect(exception).toBeInstanceOf(Error);
            expect(exception).toBeInstanceOf(DomainException);
        });

        it('should have timestamp close to current time', () => {
            const before = new Date();
            const exception = new DomainException('Test error', 'TEST_ERROR');
            const after = new Date();

            expect(exception.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(exception.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
        });
    });

    describe('Factory Methods', () => {
        describe('validationError()', () => {
            it('should create validation error with correct code', () => {
                const exception = DomainException.validationError('Invalid input');

                expect(exception.message).toBe('Invalid input');
                expect(exception.errorCode).toBe('VALIDATION_ERROR');
                expect(exception).toBeInstanceOf(DomainException);
            });
        });

        describe('businessRuleViolation()', () => {
            it('should create business rule violation with correct code', () => {
                const exception = DomainException.businessRuleViolation('Cannot complete pending task');

                expect(exception.message).toBe('Cannot complete pending task');
                expect(exception.errorCode).toBe('BUSINESS_RULE_VIOLATION');
                expect(exception).toBeInstanceOf(DomainException);
            });
        });

        describe('entityNotFound()', () => {
            it('should create entity not found error with formatted message', () => {
                const exception = DomainException.entityNotFound('Task', '123');

                expect(exception.message).toBe('Task with ID 123 not found');
                expect(exception.errorCode).toBe('ENTITY_NOT_FOUND');
                expect(exception).toBeInstanceOf(DomainException);
            });

            it('should handle numeric ID', () => {
                const exception = DomainException.entityNotFound('User', 456);

                expect(exception.message).toBe('User with ID 456 not found');
            });
        });

        describe('unauthorized()', () => {
            it('should create unauthorized error with default message', () => {
                const exception = DomainException.unauthorized();

                expect(exception.message).toBe('Unauthorized access');
                expect(exception.errorCode).toBe('UNAUTHORIZED');
                expect(exception).toBeInstanceOf(DomainException);
            });

            it('should create unauthorized error with custom message', () => {
                const exception = DomainException.unauthorized('Invalid token');

                expect(exception.message).toBe('Invalid token');
                expect(exception.errorCode).toBe('UNAUTHORIZED');
            });
        });

        describe('duplicateEntity()', () => {
            it('should create duplicate entity error with formatted message', () => {
                const exception = DomainException.duplicateEntity('User', 'email', 'test@example.com');

                expect(exception.message).toBe('User with email \'test@example.com\' already exists');
                expect(exception.errorCode).toBe('DUPLICATE_ENTITY');
                expect(exception).toBeInstanceOf(DomainException);
            });

            it('should handle numeric values', () => {
                const exception = DomainException.duplicateEntity('Task', 'id', 123);

                expect(exception.message).toBe('Task with id \'123\' already exists');
            });
        });
    });

    describe('getErrorCode()', () => {
        it('should return error code', () => {
            const exception = new DomainException('Test error', 'TEST_ERROR');

            expect(exception.getErrorCode()).toBe('TEST_ERROR');
        });

        it('should return correct error code for factory methods', () => {
            expect(DomainException.validationError('test').getErrorCode()).toBe('VALIDATION_ERROR');
            expect(DomainException.businessRuleViolation('test').getErrorCode()).toBe('BUSINESS_RULE_VIOLATION');
            expect(DomainException.entityNotFound('Task', '1').getErrorCode()).toBe('ENTITY_NOT_FOUND');
            expect(DomainException.unauthorized().getErrorCode()).toBe('UNAUTHORIZED');
            expect(DomainException.duplicateEntity('User', 'email', 'test').getErrorCode()).toBe('DUPLICATE_ENTITY');
        });
    });

    describe('toJSON()', () => {
        it('should serialize to JSON object with all fields', () => {
            const exception = new DomainException('Test error', 'TEST_ERROR');
            const json = exception.toJSON();

            expect(json).toHaveProperty('error', 'DomainException');
            expect(json).toHaveProperty('errorCode', 'TEST_ERROR');
            expect(json).toHaveProperty('message', 'Test error');
            expect(json).toHaveProperty('timestamp');
            expect(json.timestamp).toBeInstanceOf(Date);
        });

        it('should serialize validation error correctly', () => {
            const exception = DomainException.validationError('Invalid email format');
            const json = exception.toJSON();

            expect(json.error).toBe('DomainException');
            expect(json.errorCode).toBe('VALIDATION_ERROR');
            expect(json.message).toBe('Invalid email format');
        });

        it('should serialize business rule violation correctly', () => {
            const exception = DomainException.businessRuleViolation('Cannot delete active task');
            const json = exception.toJSON();

            expect(json.error).toBe('DomainException');
            expect(json.errorCode).toBe('BUSINESS_RULE_VIOLATION');
            expect(json.message).toBe('Cannot delete active task');
        });
    });

    describe('Error Handling', () => {
        it('should be catchable with try-catch', () => {
            try {
                throw DomainException.validationError('Test error');
            } catch (error) {
                expect(error).toBeInstanceOf(DomainException);
                expect(error.message).toBe('Test error');
            }
        });

        it('should preserve stack trace', () => {
            const exception = new DomainException('Test error', 'TEST_ERROR');

            expect(exception.stack).toBeDefined();
            expect(exception.stack).toContain('DomainException');
        });

        it('should be distinguishable from regular Error', () => {
            const domainException = DomainException.validationError('Domain error');
            const regularError = new Error('Regular error');

            expect(domainException).toBeInstanceOf(DomainException);
            expect(domainException).toBeInstanceOf(Error);
            expect(regularError).toBeInstanceOf(Error);
            expect(regularError).not.toBeInstanceOf(DomainException);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty message', () => {
            const exception = new DomainException('', 'EMPTY_MESSAGE');

            expect(exception.message).toBe('');
            expect(exception.errorCode).toBe('EMPTY_MESSAGE');
        });

        it('should handle undefined error code', () => {
            const exception = new DomainException('Test error', undefined);

            expect(exception.message).toBe('Test error');
            expect(exception.errorCode).toBeUndefined();
        });

        it('should handle special characters in message', () => {
            const specialMessage = 'Error: <script>alert("xss")</script> & "quotes"';
            const exception = new DomainException(specialMessage, 'XSS_TEST');

            expect(exception.message).toBe(specialMessage);
        });

        it('should handle very long messages', () => {
            const longMessage = 'A'.repeat(1000);
            const exception = new DomainException(longMessage, 'LONG_MESSAGE');

            expect(exception.message).toBe(longMessage);
            expect(exception.message.length).toBe(1000);
        });

        it('should handle unicode characters', () => {
            const unicodeMessage = 'Lỗi: Không thể xử lý công việc 任务 🚀';
            const exception = new DomainException(unicodeMessage, 'UNICODE_TEST');

            expect(exception.message).toBe(unicodeMessage);
        });
    });

    describe('Multiple Exceptions', () => {
        it('should create independent exception instances', () => {
            const exception1 = DomainException.validationError('Error 1');
            const exception2 = DomainException.validationError('Error 2');

            expect(exception1.message).toBe('Error 1');
            expect(exception2.message).toBe('Error 2');
            expect(exception1.timestamp).not.toBe(exception2.timestamp);
        });

        it('should maintain different error codes', () => {
            const exceptions = [
                DomainException.validationError('test'),
                DomainException.businessRuleViolation('test'),
                DomainException.entityNotFound('Task', '1'),
                DomainException.unauthorized(),
                DomainException.duplicateEntity('User', 'email', 'test')
            ];

            const codes = exceptions.map(e => e.errorCode);
            const uniqueCodes = [...new Set(codes)];

            expect(uniqueCodes.length).toBe(5);
        });
    });
});
