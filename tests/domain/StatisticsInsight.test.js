const StatisticsInsight = require('../../domain/valueobjects/StatisticsInsight');

describe('StatisticsInsight Value Object', () => {
    describe('Constructor - Validation', () => {
        it('should create valid insight with all required fields', () => {
            const insight = new StatisticsInsight({
                type: 'success',
                message: 'All tasks completed!',
                icon: '✅',
                priority: 1
            });

            expect(insight.type).toBe('success');
            expect(insight.message).toBe('All tasks completed!');
            expect(insight.icon).toBe('✅');
            expect(insight.priority).toBe(1);
        });

        it('should use default priority 0 when not provided', () => {
            const insight = new StatisticsInsight({
                type: 'info',
                message: 'Test message',
                icon: 'ℹ️'
            });

            expect(insight.priority).toBe(0);
        });

        it('should throw error when type is missing', () => {
            expect(() => {
                new StatisticsInsight({
                    message: 'Test message',
                    icon: '✅'
                });
            }).toThrow('type is required and must be a string');
        });

        it('should throw error when type is not string', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 123,
                    message: 'Test message',
                    icon: '✅'
                });
            }).toThrow('type is required and must be a string');
        });

        it('should throw error when message is missing', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'success',
                    icon: '✅'
                });
            }).toThrow('message is required and must be a string');
        });

        it('should throw error when message is not string', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'success',
                    message: 123,
                    icon: '✅'
                });
            }).toThrow('message is required and must be a string');
        });

        it('should throw error when icon is missing', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'success',
                    message: 'Test message'
                });
            }).toThrow('icon is required and must be a string');
        });

        it('should throw error when icon is not string', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'success',
                    message: 'Test message',
                    icon: 123
                });
            }).toThrow('icon is required and must be a string');
        });

        it('should throw error when type is not valid enum value', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'invalid',
                    message: 'Test message',
                    icon: '✅'
                });
            }).toThrow('type must be one of: success, warning, danger, info');
        });

        it('should throw error when priority is not a number', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'success',
                    message: 'Test message',
                    icon: '✅',
                    priority: 'high'
                });
            }).toThrow('priority must be a non-negative number');
        });

        it('should throw error when priority is negative', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'success',
                    message: 'Test message',
                    icon: '✅',
                    priority: -1
                });
            }).toThrow('priority must be a non-negative number');
        });
    });

    describe('Immutability', () => {
        it('should be frozen object', () => {
            const insight = new StatisticsInsight({
                type: 'success',
                message: 'Test message',
                icon: '✅'
            });

            expect(Object.isFrozen(insight)).toBe(true);
        });

        it('should not allow modification of type', () => {
            const insight = new StatisticsInsight({
                type: 'success',
                message: 'Test message',
                icon: '✅'
            });

            const originalType = insight.type;
            try {
                insight.type = 'warning';
            } catch (e) {
                // Expected in strict mode
            }
            expect(insight.type).toBe(originalType);
        });

        it('should not allow modification of message', () => {
            const insight = new StatisticsInsight({
                type: 'success',
                message: 'Test message',
                icon: '✅'
            });

            const originalMessage = insight.message;
            try {
                insight.message = 'New message';
            } catch (e) {
                // Expected in strict mode
            }
            expect(insight.message).toBe(originalMessage);
        });
    });

    describe('Factory Methods', () => {
        describe('success()', () => {
            it('should create success insight with correct defaults', () => {
                const insight = StatisticsInsight.success('Task completed');

                expect(insight.type).toBe('success');
                expect(insight.message).toBe('Task completed');
                expect(insight.icon).toBe('✅');
                expect(insight.priority).toBe(1);
            });

            it('should allow custom priority', () => {
                const insight = StatisticsInsight.success('Task completed', 5);

                expect(insight.priority).toBe(5);
            });
        });

        describe('warning()', () => {
            it('should create warning insight with correct defaults', () => {
                const insight = StatisticsInsight.warning('Deadline approaching');

                expect(insight.type).toBe('warning');
                expect(insight.message).toBe('Deadline approaching');
                expect(insight.icon).toBe('⚠️');
                expect(insight.priority).toBe(2);
            });

            it('should allow custom priority', () => {
                const insight = StatisticsInsight.warning('Deadline approaching', 4);

                expect(insight.priority).toBe(4);
            });
        });

        describe('danger()', () => {
            it('should create danger insight with correct defaults', () => {
                const insight = StatisticsInsight.danger('Tasks overdue');

                expect(insight.type).toBe('danger');
                expect(insight.message).toBe('Tasks overdue');
                expect(insight.icon).toBe('🚨');
                expect(insight.priority).toBe(3);
            });

            it('should allow custom priority', () => {
                const insight = StatisticsInsight.danger('Tasks overdue', 6);

                expect(insight.priority).toBe(6);
            });
        });

        describe('info()', () => {
            it('should create info insight with correct defaults', () => {
                const insight = StatisticsInsight.info('No tasks pending');

                expect(insight.type).toBe('info');
                expect(insight.message).toBe('No tasks pending');
                expect(insight.icon).toBe('ℹ️');
                expect(insight.priority).toBe(0);
            });

            it('should allow custom priority', () => {
                const insight = StatisticsInsight.info('No tasks pending', 2);

                expect(insight.priority).toBe(2);
            });
        });
    });

    describe('Business Logic - generateFromStatistics()', () => {
        it('should generate info insight for no tasks', () => {
            const stats = {
                totalTasks: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
                overdueTasks: 0,
                completionRate: 0
            };

            const insights = StatisticsInsight.generateFromStatistics(stats);

            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('info');
            expect(insights[0].message).toContain('chưa có công việc');
        });

        it('should generate danger insight for overdue tasks', () => {
            const stats = {
                totalTasks: 5,
                pendingTasks: 1,
                inProgressTasks: 2,
                completedTasks: 1,
                overdueTasks: 1,
                completionRate: 20
            };

            const insights = StatisticsInsight.generateFromStatistics(stats);
            const overdueInsight = insights.find(i => i.message.includes('quá hạn'));

            expect(overdueInsight).toBeDefined();
            expect(overdueInsight.type).toBe('danger');
        });

        it('should generate success insight for high completion rate', () => {
            const stats = {
                totalTasks: 10,
                pendingTasks: 1,
                inProgressTasks: 1,
                completedTasks: 8,
                overdueTasks: 0,
                completionRate: 80
            };

            const insights = StatisticsInsight.generateFromStatistics(stats);
            const successInsight = insights.find(i => i.type === 'success' && i.message.includes('Tuyệt vời'));

            expect(successInsight).toBeDefined();
        });

        it('should sort insights by priority descending', () => {
            const stats = {
                totalTasks: 10,
                pendingTasks: 2,
                inProgressTasks: 3,
                completedTasks: 4,
                overdueTasks: 1,
                completionRate: 40
            };

            const insights = StatisticsInsight.generateFromStatistics(stats);

            // Verify sorting
            for (let i = 0; i < insights.length - 1; i++) {
                expect(insights[i].priority).toBeGreaterThanOrEqual(insights[i + 1].priority);
            }
        });
    });

    describe('toJSON()', () => {
        it('should serialize to plain object', () => {
            const insight = StatisticsInsight.success('Test message', 2);
            const json = insight.toJSON();

            expect(json).toEqual({
                type: 'success',
                message: 'Test message',
                icon: '✅',
                priority: 2
            });
        });

        it('should create equal JSON for same data', () => {
            const insight1 = StatisticsInsight.warning('Warning message');
            const insight2 = StatisticsInsight.warning('Warning message');

            expect(insight1.toJSON()).toEqual(insight2.toJSON());
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string message (invalid)', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'success',
                    message: '',
                    icon: '✅'
                });
            }).toThrow('message is required and must be a string');
        });

        it('should handle empty string icon (invalid)', () => {
            expect(() => {
                new StatisticsInsight({
                    type: 'success',
                    message: 'Test',
                    icon: ''
                });
            }).toThrow('icon is required and must be a string');
        });

        it('should handle zero priority', () => {
            const insight = new StatisticsInsight({
                type: 'info',
                message: 'Test',
                icon: 'ℹ️',
                priority: 0
            });

            expect(insight.priority).toBe(0);
        });

        it('should handle very long message', () => {
            const longMessage = 'A'.repeat(1000);
            const insight = new StatisticsInsight({
                type: 'info',
                message: longMessage,
                icon: 'ℹ️'
            });

            expect(insight.message).toBe(longMessage);
        });
    });
});
