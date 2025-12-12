/**
 * Dashboard Page JavaScript
 */

let currentFilter = 'ALL';
let currentEditingTaskId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!API.getToken()) {
        window.location.href = '/login.html';
        return;
    }

    // Initialize page
    await init();

    // Setup event listeners
    setupEventListeners();
});

async function init() {
    try {
        // Load user info
        await loadUserInfo();

        // Load statistics
        await loadStatistics();

        // Load tasks
        await loadTasks();
    } catch (error) {
        console.error('Initialization error:', error);
        if (error.message.includes('token') || error.message.includes('auth')) {
            API.removeToken();
            window.location.href = '/login.html';
        }
    }
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Create task button
    document.getElementById('createTaskBtn').addEventListener('click', () => openTaskModal());

    // Task form submit
    document.getElementById('taskForm').addEventListener('submit', handleTaskFormSubmit);

    // Modal close buttons
    document.querySelector('.modal .close').addEventListener('click', closeTaskModal);
    document.getElementById('cancelTaskBtn').addEventListener('click', closeTaskModal);

    // Click outside modal to close
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('taskModal')) {
            closeTaskModal();
        }
    });

    // Filter tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const status = e.target.dataset.status;
            handleFilterChange(status);
        });
    });
}

async function loadUserInfo() {
    try {
        const response = await API.getCurrentUser();
        if (response.success && response.user) {
            const userInfo = document.getElementById('userInfo');
            userInfo.textContent = `👤 ${response.user.username}`;
        }
    } catch (error) {
        console.error('Failed to load user info:', error);
    }
}

async function loadStatistics() {
    try {
        const response = await API.getStatistics();
        if (response.success && response.statistics) {
            const stats = response.statistics;
            document.getElementById('statTotal').textContent = stats.total || 0;
            document.getElementById('statPending').textContent = stats.pending || 0;
            document.getElementById('statInProgress').textContent = stats.inProgress || 0;
            document.getElementById('statCompleted').textContent = stats.completed || 0;
        }
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

async function loadTasks(status = null) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '<div class="loading">Đang tải...</div>';

    try {
        const response = await API.getTasks(status);
        
        if (response.success && response.tasks) {
            if (response.tasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <p>Chưa có công việc nào</p>
                    </div>
                `;
                return;
            }

            taskList.innerHTML = response.tasks.map(task => createTaskCard(task)).join('');
            
            // Attach event listeners to task actions
            attachTaskActionListeners();
        }
    } catch (error) {
        console.error('Failed to load tasks:', error);
        taskList.innerHTML = `
            <div class="error-message">
                Không thể tải danh sách công việc. Vui lòng thử lại.
            </div>
        `;
    }
}

function createTaskCard(task) {
    const statusClass = `status-${task.status}`;
    const statusText = Utils.getStatusText(task.status);
    
    // Status change buttons based on current status
    let statusButtons = '';
    if (task.status === 'PENDING') {
        statusButtons = `
            <button class="btn btn-success btn-status" data-id="${task.id}" data-status="IN_PROGRESS">
                🔄 Bắt đầu
            </button>
            <button class="btn btn-success btn-status" data-id="${task.id}" data-status="COMPLETED">
                ✅ Hoàn thành
            </button>
        `;
    } else if (task.status === 'IN_PROGRESS') {
        statusButtons = `
            <button class="btn btn-secondary btn-status" data-id="${task.id}" data-status="PENDING">
                ⏳ Chờ xử lý
            </button>
            <button class="btn btn-success btn-status" data-id="${task.id}" data-status="COMPLETED">
                ✅ Hoàn thành
            </button>
        `;
    } else if (task.status === 'COMPLETED') {
        statusButtons = `<span style="color: var(--success-color); font-weight: 500;">✓ Đã hoàn thành</span>`;
    }

    return `
        <div class="task-item">
            <div class="task-header">
                <div>
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <span class="task-status ${statusClass}">${statusText}</span>
                </div>
            </div>
            
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            
            <div class="task-meta">
                <span>📅 Tạo: ${Utils.formatDate(task.createdAt)}</span>
                <span>🔄 Cập nhật: ${Utils.formatDate(task.updatedAt)}</span>
            </div>
            
            <div class="task-actions">
                ${statusButtons}
                <button class="btn btn-secondary btn-edit" data-id="${task.id}">
                    ✏️ Sửa
                </button>
                <button class="btn btn-danger btn-delete" data-id="${task.id}">
                    🗑️ Xóa
                </button>
            </div>
        </div>
    `;
}

function attachTaskActionListeners() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.id;
            handleEditTask(taskId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.id;
            handleDeleteTask(taskId);
        });
    });

    // Status change buttons
    document.querySelectorAll('.btn-status').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.id;
            const newStatus = e.currentTarget.dataset.status;
            handleStatusChange(taskId, newStatus);
        });
    });
}

function handleFilterChange(status) {
    currentFilter = status;

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === status) {
            btn.classList.add('active');
        }
    });

    // Load tasks with filter
    const filterStatus = status === 'ALL' ? null : status;
    loadTasks(filterStatus);
}

function openTaskModal(task = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const taskForm = document.getElementById('taskForm');
    
    currentEditingTaskId = task ? task.id : null;

    if (task) {
        // Edit mode
        modalTitle.textContent = 'Chỉnh sửa công việc';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
    } else {
        // Create mode
        modalTitle.textContent = 'Tạo công việc mới';
        taskForm.reset();
        document.getElementById('taskId').value = '';
    }

    Utils.hideError('taskFormError');
    modal.classList.add('show');
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('show');
    currentEditingTaskId = null;
}

async function handleTaskFormSubmit(e) {
    e.preventDefault();
    Utils.hideError('taskFormError');

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const taskId = document.getElementById('taskId').value;

    if (!title) {
        Utils.showError('taskFormError', 'Vui lòng nhập tiêu đề');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang lưu...';

    try {
        if (taskId) {
            // Update task
            await API.updateTask(taskId, title, description);
        } else {
            // Create new task
            await API.createTask(title, description);
        }

        closeTaskModal();
        await loadStatistics();
        await loadTasks(currentFilter === 'ALL' ? null : currentFilter);
    } catch (error) {
        Utils.showError('taskFormError', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Lưu';
    }
}

async function handleEditTask(taskId) {
    try {
        const response = await API.getTaskById(taskId);
        if (response.success && response.task) {
            openTaskModal(response.task);
        }
    } catch (error) {
        alert('Không thể tải thông tin công việc: ' + error.message);
    }
}

async function handleDeleteTask(taskId) {
    if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        return;
    }

    try {
        await API.deleteTask(taskId);
        await loadStatistics();
        await loadTasks(currentFilter === 'ALL' ? null : currentFilter);
    } catch (error) {
        alert('Không thể xóa công việc: ' + error.message);
    }
}

async function handleStatusChange(taskId, newStatus) {
    try {
        await API.changeTaskStatus(taskId, newStatus);
        await loadStatistics();
        await loadTasks(currentFilter === 'ALL' ? null : currentFilter);
    } catch (error) {
        alert('Không thể thay đổi trạng thái: ' + error.message);
    }
}

async function handleLogout() {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        return;
    }

    try {
        await API.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        API.removeToken();
        window.location.href = '/login.html';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
