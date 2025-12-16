
class StatisticsInsight {

    constructor({ type, message, icon, priority = 0 }) {
        if (!type || typeof type !== 'string') {
            throw new Error('type is required and must be a string');
        }
        if (!message || typeof message !== 'string') {
            throw new Error('message is required and must be a string');
        }
        if (!icon || typeof icon !== 'string') {
            throw new Error('icon is required and must be a string');
        }

        const validTypes = ['success', 'warning', 'danger', 'info'];
        if (!validTypes.includes(type)) {
            throw new Error(`type must be one of: ${validTypes.join(', ')}`);
        }

        if (typeof priority !== 'number' || priority < 0) {
            throw new Error('priority must be a non-negative number');
        }

        Object.defineProperties(this, {
            type: { value: type, enumerable: true },
            message: { value: message, enumerable: true },
            icon: { value: icon, enumerable: true },
            priority: { value: priority, enumerable: true }
        });

        Object.freeze(this);
    }

    static success(message, priority = 1) {
        return new StatisticsInsight({
            type: 'success',
            message,
            icon: '✅',
            priority
        });
    }

    static warning(message, priority = 2) {
        return new StatisticsInsight({
            type: 'warning',
            message,
            icon: '⚠️',
            priority
        });
    }

    static danger(message, priority = 3) {
        return new StatisticsInsight({
            type: 'danger',
            message,
            icon: '🚨',
            priority
        });
    }

    static info(message, priority = 0) {
        return new StatisticsInsight({
            type: 'info',
            message,
            icon: 'ℹ️',
            priority
        });
    }

    static generateFromStatistics(stats) {
        const insights = [];
        const {
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            overdueTasks,
            completionRate
        } = stats;

        // Rule 1: No tasks at all
        if (totalTasks === 0) {
            insights.push(
                StatisticsInsight.info('Bạn chưa có công việc nào. Hãy tạo công việc đầu tiên!', 0)
            );
            return insights; // Return early, other rules don't apply
        }

        // Rule 2: Overdue tasks (HIGHEST PRIORITY)
        if (overdueTasks > 0) {
            if (overdueTasks === 1) {
                insights.push(
                    StatisticsInsight.danger('Bạn có 1 công việc quá hạn. Hãy xử lý ngay!', 10)
                );
            } else {
                insights.push(
                    StatisticsInsight.danger(`Bạn có ${overdueTasks} công việc quá hạn. Cần xử lý gấp!`, 10)
                );
            }
        }

        // Rule 3: Too many pending tasks
        if (pendingTasks > 10) {
            insights.push(
                StatisticsInsight.warning(`Bạn có ${pendingTasks} công việc chưa bắt đầu. Hãy ưu tiên!`, 8)
            );
        } else if (pendingTasks >= 5) {
            insights.push(
                StatisticsInsight.info(`Bạn có ${pendingTasks} công việc chưa bắt đầu.`, 3)
            );
        }

        // Rule 4: High completion rate (POSITIVE FEEDBACK)
        if (totalTasks >= 5 && completionRate >= 80) {
            insights.push(
                StatisticsInsight.success(`Tuyệt vời! Bạn đã hoàn thành ${completionRate}% công việc.`, 7)
            );
        } else if (totalTasks >= 5 && completionRate >= 50) {
            insights.push(
                StatisticsInsight.success(`Tốt lắm! Bạn đã hoàn thành ${completionRate}% công việc.`, 6)
            );
        }

        // Rule 5: Low completion rate (WARNING)
        if (totalTasks >= 5 && completionRate < 30) {
            insights.push(
                StatisticsInsight.warning(`Tỉ lệ hoàn thành còn thấp (${completionRate}%). Hãy cố gắng hơn!`, 5)
            );
        }

        // Rule 6: Many in-progress tasks
        if (inProgressTasks > 5) {
            insights.push(
                StatisticsInsight.info(`Bạn đang có ${inProgressTasks} công việc đang làm. Hãy tập trung!`, 4)
            );
        }

        // Rule 7: All tasks completed (CELEBRATION)
        if (totalTasks > 0 && completedTasks === totalTasks) {
            insights.push(
                StatisticsInsight.success('🎉 Hoàn hảo! Bạn đã hoàn thành tất cả công việc!', 9)
            );
        }

        // Rule 8: No overdue, good progress (ENCOURAGEMENT)
        if (overdueTasks === 0 && totalTasks >= 3 && (inProgressTasks + completedTasks) > 0) {
            insights.push(
                StatisticsInsight.success('Tất cả công việc đang đúng tiến độ. Tiếp tục phát huy!', 2)
            );
        }

        // Sort by priority (descending) - higher priority appears first
        insights.sort((a, b) => b.priority - a.priority);

        return insights;
    }

    toJSON() {
        return {
            type: this.type,
            message: this.message,
            icon: this.icon,
            priority: this.priority
        };
    }
}

module.exports = StatisticsInsight;
