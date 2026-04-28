// app.js - Primary app logic and state management

let tasks = [];
const activeFilters = {
    status: 'all',
    priority: 'all'
};

function initApp() {
    tasks = loadTasksFromStorage();
    applySavedTheme();
    renderTasks(getFilteredTasks(tasks, activeFilters.status, activeFilters.priority));
    setupEventListeners();
}

function getTaskById(id) {
    return tasks.find(task => task.id === id) || null;
}

function addTask(taskData) {
    const task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        status: 'todo',
        priority: taskData.priority,
        dueDate: taskData.dueDate
    };

    tasks.push(task);
    saveAndRender();
}

function updateTask(id, updates) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
        return;
    }

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates
    };

    saveAndRender();
}

function updateTaskStatus(id, newStatus) {
    updateTask(id, { status: newStatus });
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function saveAndRender() {
    saveTasksToStorage(tasks);
    renderTasks(getFilteredTasks(tasks, activeFilters.status, activeFilters.priority));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function applySavedTheme() {
    const darkMode = loadDarkModePreference();
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    saveDarkModePreference(isDark);
}

function setupEventListeners() {
    const taskForm = document.getElementById('task-form');
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const columns = document.querySelectorAll('.column');

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-due-date').value;

        if (!title) {
            return;
        }

        addTask({ title, description, priority, dueDate });
        taskForm.reset();
    });

    statusFilter.addEventListener('change', () => {
        activeFilters.status = statusFilter.value;
        renderTasks(getFilteredTasks(tasks, activeFilters.status, activeFilters.priority));
    });

    priorityFilter.addEventListener('change', () => {
        activeFilters.priority = priorityFilter.value;
        renderTasks(getFilteredTasks(tasks, activeFilters.status, activeFilters.priority));
    });

    darkModeToggle.addEventListener('click', toggleDarkMode);

    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

document.addEventListener('DOMContentLoaded', initApp);
