// ui.js - Handles UI rendering and DOM updates

/**
 * Render all tasks to the board.
 * @param {Array} tasks
 */
function renderTasks(tasks) {
    const todoList = document.getElementById('todo-list');
    const doingList = document.getElementById('doing-list');
    const doneList = document.getElementById('done-list');

    const statusMap = {
        todo: todoList,
        doing: doingList,
        done: doneList
    };

    todoList.innerHTML = '';
    doingList.innerHTML = '';
    doneList.innerHTML = '';

    const tasksByStatus = {
        todo: [],
        doing: [],
        done: []
    };

    tasks.forEach(task => {
        if (tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(task);
        }
    });

    Object.entries(tasksByStatus).forEach(([status, taskList]) => {
        const container = statusMap[status];

        if (taskList.length === 0) {
            container.innerHTML = '<div class="empty-state">No cards yet</div>';
            return;
        }

        taskList.forEach(task => renderTask(task, container));
    });

    updateColumnCounts(tasksByStatus);
}

/**
 * Render a single task card.
 * @param {Object} task
 * @param {HTMLElement} container
 */
function renderTask(task, container) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.draggable = true;
    taskCard.dataset.id = task.id;

    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < now && task.status !== 'done';

    if (isOverdue) {
        taskCard.classList.add('overdue');
    }

    taskCard.innerHTML = `
        <div class="task-title">${task.title}</div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
        <div class="task-meta">
            <span class="task-priority ${task.priority}">${task.priority}</span>
            ${task.dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">${formatDate(task.dueDate)}</span>` : ''}
        </div>
        <div class="task-actions">
            <button class="edit-btn" type="button" aria-label="Edit task">✏️</button>
            <button class="delete-btn" type="button" aria-label="Delete task">🗑️</button>
        </div>
    `;

    taskCard.addEventListener('dragstart', handleDragStart);
    taskCard.addEventListener('dragend', handleDragEnd);

    taskCard.querySelector('.edit-btn').addEventListener('click', () => showEditForm(task.id));
    taskCard.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    container.appendChild(taskCard);
}

/**
 * Show inline edit form for a specific task.
 * @param {string} taskId
 */
function showEditForm(taskId) {
    const taskCard = document.querySelector(`[data-id="${taskId}"]`);
    const task = getTaskById(taskId);

    if (!task || !taskCard) {
        return;
    }

    taskCard.innerHTML = `
        <form class="edit-form">
            <input type="text" name="title" value="${task.title}" required>
            <textarea name="description">${task.description || ''}</textarea>
            <select name="priority">
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
            <input type="date" name="dueDate" value="${task.dueDate || ''}">
            <div class="edit-actions">
                <button class="save-btn" type="submit">Save</button>
                <button class="cancel-btn" type="button">Cancel</button>
            </div>
        </form>
    `;

    const form = taskCard.querySelector('.edit-form');
    const cancelBtn = taskCard.querySelector('.cancel-btn');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        updateTask(taskId, {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate') || ''
        });
    });

    cancelBtn.addEventListener('click', () => renderTasks(getFilteredTasks(tasks, activeFilters.status, activeFilters.priority)));
}

/**
 * Format a date string for display.
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Return a filtered task list.
 * @param {Array} tasks
 * @param {string} statusFilter
 * @param {string} priorityFilter
 * @returns {Array}
 */
function getFilteredTasks(tasks, statusFilter, priorityFilter) {
    return tasks.filter(task => {
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesStatus && matchesPriority;
    });
}

/**
 * Update the count badges in each board column.
 * @param {Object} tasksByStatus
 */
function updateColumnCounts(tasksByStatus) {
    document.getElementById('todo-count').textContent = tasksByStatus.todo.length;
    document.getElementById('doing-count').textContent = tasksByStatus.doing.length;
    document.getElementById('done-count').textContent = tasksByStatus.done.length;
}

/**
 * Handle drag over on a column.
 * @param {DragEvent} event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
    event.dataTransfer.dropEffect = 'move';
}

/**
 * Handle drop event on a column.
 * @param {DragEvent} event
 */
function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const taskId = event.dataTransfer.getData('text/plain');
    const targetStatus = event.currentTarget.dataset.status;
    if (taskId && targetStatus) {
        updateTaskStatus(taskId, targetStatus);
    }
}

/**
 * Handle drag leave on a column.
 * @param {DragEvent} event
 */
function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

let draggedTaskId = null;

function handleDragStart(event) {
    draggedTaskId = event.target.dataset.id;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedTaskId);
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
}
