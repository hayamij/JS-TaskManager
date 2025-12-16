
class TaskDisplayDTO {

    constructor({
        id,
        title,
        description,
        status,
        userId,
        createdAt,
        updatedAt,
        startDate,
        deadline,
        progress,
        isOverdue,
        displayData,
        createdAtFormatted
    }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.startDate = startDate;
        this.deadline = deadline;
        this.progress = progress;
        this.isOverdue = isOverdue;

        this.statusText = displayData.statusText;
        this.statusClass = displayData.statusClass;
        this.progressColor = displayData.progressColor;
        this.startDateFormatted = displayData.startDateFormatted;
        this.deadlineFormatted = displayData.deadlineFormatted;
        this.createdAtFormatted = createdAtFormatted;
        this.overdueMessage = displayData.overdueMessage;
        this.availableActions = displayData.availableActions;
        this.canEdit = displayData.canEdit;
        this.canDelete = displayData.canDelete;
        this.canComplete = displayData.canComplete;
        this.icon = displayData.icon;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            userId: this.userId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            startDate: this.startDate,
            deadline: this.deadline,
            progress: this.progress,
            isOverdue: this.isOverdue,

            statusText: this.statusText,
            statusClass: this.statusClass,
            progressColor: this.progressColor,
            startDateFormatted: this.startDateFormatted,
            deadlineFormatted: this.deadlineFormatted,
            createdAtFormatted: this.createdAtFormatted,
            overdueMessage: this.overdueMessage,
            availableActions: this.availableActions,
            canEdit: this.canEdit,
            canDelete: this.canDelete,
            canComplete: this.canComplete,
            icon: this.icon
        };
    }
}

module.exports = TaskDisplayDTO;
