import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useGame } from '../context/GameContext';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal'; // Import Modal
import { useLanguage } from '../context/LanguageContext';
import { Plus } from 'lucide-react';
import './TasksPage.css';

const TasksPage = () => {
    const { tasks, activeTaskId, addTask, updateTask, deleteTask, selectActiveTask } = useTasks();
    const { incrementTaskStat } = useGame();
    const { t } = useLanguage();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('PRIORITY');

    const CATEGORIES = ['Study', 'Health', 'Hobby', 'Work', 'General'];

    const handleAddTask = (taskData) => {
        addTask(taskData);
        setIsFormOpen(false);
    };

    const handleComplete = (id) => {
        // ... (Keep existing logic)
        const task = tasks.find(t => t.id === id);
        if (task) {
            const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
            const updates = { status: newStatus };
            if (newStatus === 'DONE') {
                updates.completedAt = new Date().toISOString();
                incrementTaskStat();
            } else {
                updates.completedAt = null;
            }
            updateTask(id, updates);
        }
    };

    const filteredAndSortedTasks = tasks
        .filter(task => {
            if (filterCategory !== 'ALL' && task.category !== filterCategory) return false;
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            if (a.id === activeTaskId) return -1;
            if (b.id === activeTaskId) return 1;
            if (a.status === 'DONE' && b.status !== 'DONE') return 1;
            if (a.status !== 'DONE' && b.status === 'DONE') return -1;

            if (sortBy === 'PRIORITY') {
                const pMap = { TODAY: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                return pMap[b.priority] - pMap[a.priority];
            } else if (sortBy === 'NEWEST') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'OLDEST') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
        });

    return (
        <div className="tasks-page">
            <header className="page-header">
                <h1>{t('tasks.title')}</h1>
                <button className="add-task-btn-pill" onClick={() => setIsFormOpen(true)}>
                    <Plus size={18} />
                    <span>{t('tasks.newTask')}</span>
                </button>
            </header>

            <div className="tasks-controls">
                <input
                    type="search"
                    placeholder={t('tasks.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <div className="filters-row">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="control-select"
                    >
                        <option value="ALL">{t('tasks.filterAll')}</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {t(`tasks.categories.${cat.toLowerCase()}`)}
                            </option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="control-select"
                    >
                        <option value="PRIORITY">{t('tasks.sort.priority')}</option>
                        <option value="NEWEST">{t('tasks.sort.newest')}</option>
                        <option value="OLDEST">{t('tasks.sort.oldest')}</option>
                    </select>
                </div>
            </div>

            {/* Task Modal Replacement */}
            <TaskModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleAddTask}
            />

            <div className="tasks-list">
                {filteredAndSortedTasks.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('tasks.empty')}</p>
                    </div>
                ) : (
                    filteredAndSortedTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            isActive={task.id === activeTaskId}
                            onSelect={selectActiveTask}
                            onDelete={deleteTask}
                            onComplete={handleComplete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TasksPage;
