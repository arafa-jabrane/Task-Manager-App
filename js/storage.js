// storage.js - Handles localStorage operations

const STORAGE_KEY = 'taskManagerTasks';
const DARK_MODE_KEY = 'taskManagerDarkMode';

/**
 * Save tasks to localStorage.
 * @param {Array} tasks
 */
function saveTasksToStorage(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
    }
}

/**
 * Load tasks from localStorage.
 * @returns {Array}
 */
function loadTasksFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
        return [];
    }
}

/**
 * Save dark mode preference.
 * @param {boolean} isDark
 */
function saveDarkModePreference(isDark) {
    try {
        localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDark));
    } catch (error) {
        console.error('Error saving dark mode setting:', error);
    }
}

/**
 * Load dark mode preference.
 * @returns {boolean}
 */
function loadDarkModePreference() {
    try {
        return JSON.parse(localStorage.getItem(DARK_MODE_KEY)) === true;
    } catch (error) {
        return false;
    }
}
