
class TaskDisplayData {

    constructor({
        statusText,
        statusClass,
        progressColor,
        startDateFormatted,
        deadlineFormatted = null,
        overdueMessage = null,
        availableActions = [],
        canEdit = false,
        canDelete = false,
        canComplete = false,
        icon = '📋'
    }) {
        // Validate required fields
        if (!statusText || typeof statusText !== 'string') {
            throw new Error('statusText is required and must be a string');
        }
        if (!statusClass || typeof statusClass !== 'string') {
            throw new Error('statusClass is required and must be a string');
        }
        if (!progressColor || typeof progressColor !== 'string') {
            throw new Error('progressColor is required and must be a string');
        }
        if (!startDateFormatted || typeof startDateFormatted !== 'string') {
            throw new Error('startDateFormatted is required and must be a string');
        }
        if (!Array.isArray(availableActions)) {
            throw new Error('availableActions must be an array');
        }

        const validStatusClasses = ['scheduled', 'pending', 'in-progress', 'completed', 'failed', 'cancelled'];
        if (!validStatusClasses.includes(statusClass)) {
            throw new Error(`statusClass must be one of: ${validStatusClasses.join(', ')}`);
        }

        const validProgressColors = ['safe', 'warning', 'danger', 'completed'];
        if (!validProgressColors.includes(progressColor)) {
            throw new Error(`progressColor must be one of: ${validProgressColors.join(', ')}`);
        }

        const validActions = ['edit', 'delete', 'complete', 'view'];
        for (const action of availableActions) {
            if (!validActions.includes(action)) {
                throw new Error(`Invalid action '${action}'. Must be one of: ${validActions.join(', ')}`);
            }
        }

        Object.defineProperties(this, {
            statusText: { value: statusText, enumerable: true },
            statusClass: { value: statusClass, enumerable: true },
            progressColor: { value: progressColor, enumerable: true },
            startDateFormatted: { value: startDateFormatted, enumerable: true },
            deadlineFormatted: { value: deadlineFormatted, enumerable: true },
            overdueMessage: { value: overdueMessage, enumerable: true },
            availableActions: { value: Object.freeze([...availableActions]), enumerable: true },
            canEdit: { value: Boolean(canEdit), enumerable: true },
            canDelete: { value: Boolean(canDelete), enumerable: true },
            canComplete: { value: Boolean(canComplete), enumerable: true },
            icon: { value: icon, enumerable: true }
        });

        Object.freeze(this);
    }

    static forScheduled(startDateFormatted, deadlineFormatted = null) {
        return new TaskDisplayData({
            statusText: 'Đang chờ',
            statusClass: 'scheduled',
            progressColor: 'safe',
            startDateFormatted,
            deadlineFormatted,
            overdueMessage: null,
            availableActions: ['edit', 'delete'],
            canEdit: true,
            canDelete: true,
            canComplete: false, // Cannot complete until startDate
            icon: '📅'
        });
    }

    static forPending(startDateFormatted, deadlineFormatted = null, overdueMessage = null) {
        return new TaskDisplayData({
            statusText: 'Đang chờ',
            statusClass: 'pending',
            progressColor: 'safe',
            startDateFormatted,
            deadlineFormatted,
            overdueMessage,
            availableActions: ['edit', 'delete', 'complete'],
            canEdit: true,
            canDelete: true,
            canComplete: true,
            icon: '⏸️'
        });
    }

    static forInProgress(startDateFormatted, deadlineFormatted = null, progress = 0, overdueMessage = null) {
        let progressColor = 'safe';
        if (progress >= 80) {
            progressColor = 'danger';
        } else if (progress >= 50) {
            progressColor = 'warning';
        }

        return new TaskDisplayData({
            statusText: 'Đang làm',
            statusClass: 'in-progress',
            progressColor,
            startDateFormatted,
            deadlineFormatted,
            overdueMessage,
            availableActions: ['edit', 'delete', 'complete'],
            canEdit: true,
            canDelete: true,
            canComplete: true,
            icon: '🔄'
        });
    }

    static forCompleted(startDateFormatted, deadlineFormatted = null) {
        return new TaskDisplayData({
            statusText: 'Hoàn thành',
            statusClass: 'completed',
            progressColor: 'completed',
            startDateFormatted,
            deadlineFormatted,
            overdueMessage: null, // Completed tasks can't be overdue
            availableActions: ['view', 'delete'],
            canEdit: false,
            canDelete: true,
            canComplete: false,
            icon: '✅'
        });
    }

    static forFailed(startDateFormatted, deadlineFormatted = null, overdueMessage = null) {
        return new TaskDisplayData({
            statusText: 'Không hoàn thành',
            statusClass: 'failed',
            progressColor: 'danger',
            startDateFormatted,
            deadlineFormatted,
            overdueMessage,
            availableActions: ['view', 'delete', 'complete'],
            canEdit: false,
            canDelete: true,
            canComplete: true,
            icon: '❌'
        });
    }

    static forCancelled(startDateFormatted, deadlineFormatted = null) {
        return new TaskDisplayData({
            statusText: 'Đã hủy',
            statusClass: 'cancelled',
            progressColor: 'safe',
            startDateFormatted,
            deadlineFormatted,
            overdueMessage: null,
            availableActions: ['view'], 
            canEdit: false,
            canDelete: false,
            canComplete: false,
            icon: '🚫'
        });
    }

    toJSON() {
        return {
            statusText: this.statusText,
            statusClass: this.statusClass,
            progressColor: this.progressColor,
            startDateFormatted: this.startDateFormatted,
            deadlineFormatted: this.deadlineFormatted,
            overdueMessage: this.overdueMessage,
            availableActions: [...this.availableActions],
            canEdit: this.canEdit,
            canDelete: this.canDelete,
            canComplete: this.canComplete,
            icon: this.icon
        };
    }
}

module.exports = TaskDisplayData;
