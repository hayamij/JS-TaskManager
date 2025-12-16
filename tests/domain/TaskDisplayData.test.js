const TaskDisplayData = require('../../domain/valueobjects/TaskDisplayData');

describe('TaskDisplayData Value Object', () => {
    describe('Constructor - Validation', () => {
        it('should create valid display data with all required fields', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang làm',
                statusClass: 'in-progress',
                progressColor: 'warning',
                startDateFormatted: '16/12/2025 10:30',
                deadlineFormatted: '20/12/2025 17:00',
                overdueMessage: null,
                availableActions: ['edit', 'delete', 'complete'],
                canEdit: true,
                canDelete: true,
                canComplete: true,
                icon: '🔄'
            });

            expect(displayData.statusText).toBe('Đang làm');
            expect(displayData.statusClass).toBe('in-progress');
            expect(displayData.progressColor).toBe('warning');
            expect(displayData.startDateFormatted).toBe('16/12/2025 10:30');
            expect(displayData.deadlineFormatted).toBe('20/12/2025 17:00');
            expect(displayData.overdueMessage).toBeNull();
            expect(displayData.availableActions).toEqual(['edit', 'delete', 'complete']);
            expect(displayData.canEdit).toBe(true);
            expect(displayData.canDelete).toBe(true);
            expect(displayData.canComplete).toBe(true);
            expect(displayData.icon).toBe('🔄');
        });

        it('should use default values when optional fields not provided', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang chờ',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30'
            });

            expect(displayData.deadlineFormatted).toBeNull();
            expect(displayData.overdueMessage).toBeNull();
            expect(displayData.availableActions).toEqual([]);
            expect(displayData.canEdit).toBe(false);
            expect(displayData.canDelete).toBe(false);
            expect(displayData.canComplete).toBe(false);
            expect(displayData.icon).toBe('📋');
        });

        it('should throw error when statusText is missing', () => {
            expect(() => {
                new TaskDisplayData({
                    statusClass: 'pending',
                    progressColor: 'safe',
                    startDateFormatted: '16/12/2025 10:30'
                });
            }).toThrow('statusText is required and must be a string');
        });

        it('should throw error when statusClass is missing', () => {
            expect(() => {
                new TaskDisplayData({
                    statusText: 'Đang chờ',
                    progressColor: 'safe',
                    startDateFormatted: '16/12/2025 10:30'
                });
            }).toThrow('statusClass is required and must be a string');
        });

        it('should throw error when progressColor is missing', () => {
            expect(() => {
                new TaskDisplayData({
                    statusText: 'Đang chờ',
                    statusClass: 'pending',
                    startDateFormatted: '16/12/2025 10:30'
                });
            }).toThrow('progressColor is required and must be a string');
        });

        it('should throw error when startDateFormatted is missing', () => {
            expect(() => {
                new TaskDisplayData({
                    statusText: 'Đang chờ',
                    statusClass: 'pending',
                    progressColor: 'safe'
                });
            }).toThrow('startDateFormatted is required and must be a string');
        });

        it('should throw error when statusClass is invalid', () => {
            expect(() => {
                new TaskDisplayData({
                    statusText: 'Invalid',
                    statusClass: 'invalid-status',
                    progressColor: 'safe',
                    startDateFormatted: '16/12/2025 10:30'
                });
            }).toThrow('statusClass must be one of: scheduled, pending, in-progress, completed, failed, cancelled');
        });

        it('should throw error when progressColor is invalid', () => {
            expect(() => {
                new TaskDisplayData({
                    statusText: 'Đang chờ',
                    statusClass: 'pending',
                    progressColor: 'invalid-color',
                    startDateFormatted: '16/12/2025 10:30'
                });
            }).toThrow('progressColor must be one of: safe, warning, danger, completed');
        });

        it('should throw error when availableActions contains invalid action', () => {
            expect(() => {
                new TaskDisplayData({
                    statusText: 'Đang chờ',
                    statusClass: 'pending',
                    progressColor: 'safe',
                    startDateFormatted: '16/12/2025 10:30',
                    availableActions: ['edit', 'invalid-action']
                });
            }).toThrow('Invalid action \'invalid-action\'. Must be one of: edit, delete, complete, view');
        });

        it('should throw error when availableActions is not array', () => {
            expect(() => {
                new TaskDisplayData({
                    statusText: 'Đang chờ',
                    statusClass: 'pending',
                    progressColor: 'safe',
                    startDateFormatted: '16/12/2025 10:30',
                    availableActions: 'edit'
                });
            }).toThrow('availableActions must be an array');
        });
    });

    describe('Immutability', () => {
        it('should not allow modification of statusText', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang chờ',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30'
            });

            const originalStatus = displayData.statusText;
            try {
                displayData.statusText = 'New status';
            } catch (e) {
                // Expected in strict mode
            }
            expect(displayData.statusText).toBe(originalStatus);
        });

        it('should be frozen object', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang chờ',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30'
            });

            expect(Object.isFrozen(displayData)).toBe(true);
        });

        it('should have frozen availableActions array', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang chờ',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30',
                availableActions: ['edit', 'delete']
            });

            expect(Object.isFrozen(displayData.availableActions)).toBe(true);
        });
    });

    describe('Factory Methods', () => {
        describe('forScheduled()', () => {
            it('should create display data for scheduled task', () => {
                const displayData = TaskDisplayData.forScheduled(
                    '20/12/2025 10:00',
                    '25/12/2025 17:00'
                );

                expect(displayData.statusText).toBe('Đang chờ');
                expect(displayData.statusClass).toBe('scheduled');
                expect(displayData.progressColor).toBe('safe');
                expect(displayData.icon).toBe('📅');
                expect(displayData.canEdit).toBe(true);
                expect(displayData.canDelete).toBe(true);
                expect(displayData.canComplete).toBe(false);
            });
        });

        describe('forPending()', () => {
            it('should create display data for pending task with deadline', () => {
                const displayData = TaskDisplayData.forPending(
                    '16/12/2025 10:00',
                    '20/12/2025 17:00'
                );

                expect(displayData.statusText).toBe('Đang chờ');
                expect(displayData.statusClass).toBe('pending');
                expect(displayData.progressColor).toBe('safe');
                expect(displayData.icon).toBe('⏸️');
                expect(displayData.canEdit).toBe(true);
                expect(displayData.canDelete).toBe(true);
                expect(displayData.canComplete).toBe(true);
            });

            it('should create display data for pending task without deadline', () => {
                const displayData = TaskDisplayData.forPending(
                    '16/12/2025 10:00',
                    null
                );

                expect(displayData.deadlineFormatted).toBeNull();
                expect(displayData.progressColor).toBe('safe');
            });
        });

        describe('forInProgress()', () => {
            it('should create display data for in-progress task', () => {
                const displayData = TaskDisplayData.forInProgress(
                    '16/12/2025 10:00',
                    '20/12/2025 17:00',
                    30
                );

                expect(displayData.statusText).toBe('Đang làm');
                expect(displayData.statusClass).toBe('in-progress');
                expect(displayData.progressColor).toBe('safe');
                expect(displayData.icon).toBe('🔄');
                expect(displayData.canEdit).toBe(true);
                expect(displayData.canDelete).toBe(true);
                expect(displayData.canComplete).toBe(true);
            });
        });

        describe('forCompleted()', () => {
            it('should create display data for completed task', () => {
                const displayData = TaskDisplayData.forCompleted(
                    '16/12/2025 10:00',
                    '20/12/2025 17:00'
                );

                expect(displayData.statusText).toBe('Hoàn thành');
                expect(displayData.statusClass).toBe('completed');
                expect(displayData.progressColor).toBe('completed');
                expect(displayData.icon).toBe('✅');
                expect(displayData.canEdit).toBe(false);
                expect(displayData.canDelete).toBe(true);
                expect(displayData.canComplete).toBe(false);
            });
        });

        describe('forFailed()', () => {
            it('should create display data for failed task with overdue message', () => {
                const displayData = TaskDisplayData.forFailed(
                    '16/12/2025 10:00',
                    '18/12/2025 17:00',
                    'Quá hạn 2 ngày'
                );

                expect(displayData.statusText).toBe('Không hoàn thành');
                expect(displayData.statusClass).toBe('failed');
                expect(displayData.progressColor).toBe('danger');
                expect(displayData.icon).toBe('❌');
                expect(displayData.overdueMessage).toBe('Quá hạn 2 ngày');
                expect(displayData.canEdit).toBe(false);
                expect(displayData.canDelete).toBe(true);
                expect(displayData.canComplete).toBe(true);
            });
        });

        describe('forCancelled()', () => {
            it('should create display data for cancelled task', () => {
                const displayData = TaskDisplayData.forCancelled(
                    '16/12/2025 10:00',
                    null
                );

                expect(displayData.statusText).toBe('Đã hủy');
                expect(displayData.statusClass).toBe('cancelled');
                expect(displayData.progressColor).toBe('safe');
                expect(displayData.icon).toBe('🚫');
                expect(displayData.canEdit).toBe(false);
                expect(displayData.canDelete).toBe(false);
                expect(displayData.canComplete).toBe(false);
            });
        });
    });

    describe('Business Logic - Properties', () => {
        it('should have deadline when deadlineFormatted is set', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang chờ',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30',
                deadlineFormatted: '20/12/2025 17:00'
            });

            expect(displayData.deadlineFormatted).toBe('20/12/2025 17:00');
            expect(displayData.deadlineFormatted).not.toBeNull();
        });

        it('should have null deadline when not set', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang chờ',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30'
            });

            expect(displayData.deadlineFormatted).toBeNull();
        });

        it('should have overdue message when set', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Không hoàn thành',
                statusClass: 'failed',
                progressColor: 'danger',
                startDateFormatted: '16/12/2025 10:30',
                overdueMessage: 'Quá hạn 2 ngày'
            });

            expect(displayData.overdueMessage).toBe('Quá hạn 2 ngày');
        });

        it('should check if action exists in availableActions', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang chờ',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30',
                availableActions: ['edit', 'delete']
            });

            expect(displayData.availableActions).toContain('edit');
            expect(displayData.availableActions).toContain('delete');
            expect(displayData.availableActions).not.toContain('view');
        });
    });

    describe('toJSON()', () => {
        it('should serialize to plain object with all fields', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Đang làm',
                statusClass: 'in-progress',
                progressColor: 'warning',
                startDateFormatted: '16/12/2025 10:30',
                deadlineFormatted: '20/12/2025 17:00',
                overdueMessage: null,
                availableActions: ['edit', 'complete'],
                canEdit: true,
                canDelete: false,
                canComplete: true,
                icon: '🔄'
            });

            const json = displayData.toJSON();

            expect(json).toEqual({
                statusText: 'Đang làm',
                statusClass: 'in-progress',
                progressColor: 'warning',
                startDateFormatted: '16/12/2025 10:30',
                deadlineFormatted: '20/12/2025 17:00',
                overdueMessage: null,
                availableActions: ['edit', 'complete'],
                canEdit: true,
                canDelete: false,
                canComplete: true,
                icon: '🔄'
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle all valid statusClass values', () => {
            const validStatuses = ['scheduled', 'pending', 'in-progress', 'completed', 'failed', 'cancelled'];

            validStatuses.forEach(status => {
                const displayData = new TaskDisplayData({
                    statusText: 'Test',
                    statusClass: status,
                    progressColor: 'safe',
                    startDateFormatted: '16/12/2025 10:30'
                });

                expect(displayData.statusClass).toBe(status);
            });
        });

        it('should handle all valid progressColor values', () => {
            const validColors = ['safe', 'warning', 'danger', 'completed'];

            validColors.forEach(color => {
                const displayData = new TaskDisplayData({
                    statusText: 'Test',
                    statusClass: 'pending',
                    progressColor: color,
                    startDateFormatted: '16/12/2025 10:30'
                });

                expect(displayData.progressColor).toBe(color);
            });
        });

        it('should handle all valid actions', () => {
            const validActions = ['edit', 'delete', 'complete', 'view'];

            const displayData = new TaskDisplayData({
                statusText: 'Test',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30',
                availableActions: validActions
            });

            expect(displayData.availableActions).toEqual(validActions);
        });

        it('should convert non-boolean permission values to boolean', () => {
            const displayData = new TaskDisplayData({
                statusText: 'Test',
                statusClass: 'pending',
                progressColor: 'safe',
                startDateFormatted: '16/12/2025 10:30',
                canEdit: 1,
                canDelete: 0,
                canComplete: 'true'
            });

            expect(displayData.canEdit).toBe(true);
            expect(displayData.canDelete).toBe(false);
            expect(displayData.canComplete).toBe(true);
        });
    });
});
