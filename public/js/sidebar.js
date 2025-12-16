/**
 * Sidebar Component Loader
 * Loads sidebar HTML and handles active state
 * 
 * @author Clean Architecture Team
 * @version 1.0.0
 */

/**
 * Load sidebar component into container
 * @param {string} containerSelector - CSS selector for sidebar container
 * @param {string} currentPage - Current page identifier ('dashboard' or status value)
 */
async function loadSidebar(containerSelector, currentPage = 'dashboard') {
    try {
        const response = await fetch('/components/sidebar.html');
        const html = await response.text();
        
        const container = document.querySelector(containerSelector);
        if (container) {
            container.innerHTML = html;
            
            // Set active state after sidebar is loaded
            setActiveSidebarItem(currentPage);
        }
    } catch (error) {
        console.error('Failed to load sidebar:', error);
    }
}

/**
 * Set active state for sidebar navigation item
 * @param {string} identifier - Page identifier or status value
 */
function setActiveSidebarItem(identifier) {
    // Remove all active classes
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to matching item
    if (identifier === 'dashboard') {
        const dashboardItem = document.querySelector('.nav-item[data-page="dashboard"]');
        if (dashboardItem) {
            dashboardItem.classList.add('active');
        }
    } else {
        const statusItem = document.querySelector(`.nav-item[data-status="${identifier}"]`);
        if (statusItem) {
            statusItem.classList.add('active');
        }
    }
}

/**
 * Update sidebar badges with statistics
 * @param {Object} stats - Statistics object from API
 */
function updateSidebarBadges(stats) {
    const badgeElements = {
        'badge-total': stats.totalTasks,
        'badge-scheduled': stats.scheduledTasks,
        'badge-inprogress': stats.inProgressTasks,
        'badge-completed': stats.completedTasks,
        'badge-failed': stats.failedTasks,
        'badge-cancelled': stats.cancelledTasks
    };
    
    for (const [id, value] of Object.entries(badgeElements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

// Export functions for use in other scripts
window.Sidebar = {
    load: loadSidebar,
    setActive: setActiveSidebarItem,
    updateBadges: updateSidebarBadges
};
