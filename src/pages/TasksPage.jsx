import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import { useLanguage } from '../context/LanguageContext';
import { Plus, X } from 'lucide-react';
import './TasksPage.css';

const TasksPage = () => {
    const { tasks, activeTaskId, addTask, updateTask, deleteTask, selectActiveTask, toggleToday } = useTasks();
    const { t } = useLanguage();

    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('TODAY');
    const [category, setCategory] = useState('Study'); // Default changed to Study
    const [subCategory, setSubCategory] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('PRIORITY');

    // Requested Order: Study, Health, Hobby, Work, General
    const CATEGORIES = ['Study', 'Health', 'Hobby', 'Work', 'General'];

    const SUB_CATEGORIES = {
        Work: ['meeting', 'development', 'planning', 'email'],
        Study: ['math', 'english', 'programming', 'reading'],
        Health: ['exercise', 'meditation', 'meal'],
        Hobby: ['game', 'art', 'music'],
        General: ['chores', 'shopping', 'misc']
    };

    const handleCategoryChange = (e) => {
        const newCat = e.target.value;
        setCategory(newCat);
        setSubCategory('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        addTask({
            title,
            priority,
            category,
            subCategory
        });

        setTitle('');
        setCategory('General');
        setSubCategory('');
        setIsFormOpen(false);
    };

    const handleComplete = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
            updateTask(id, { status: newStatus });
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
                <button className="add-task-btn-pill" onClick={() => setIsFormOpen(!isFormOpen)}>
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

            {isFormOpen && (
                <form className="task-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder={t('tasks.placeholder')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                            className="task-input"
                        />
                        {title && (
                            <button type="button" className="clear-input-btn" onClick={() => setTitle('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="form-actions-grid">
                        <div className="selectors-row">
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="priority-select"
                            >
                                <option value="TODAY">{t('tasks.priority.today')}</option>
                                <option value="HIGH">{t('tasks.priority.high')}</option>
                                <option value="MEDIUM">{t('tasks.priority.medium')}</option>
                                <option value="LOW">{t('tasks.priority.low')}</option>
                            </select>

                            <select
                                value={category}
                                onChange={handleCategoryChange}
                                className="priority-select"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {t(`tasks.categories.${cat.toLowerCase()}`)}
                                    </option>
                                ))}
                            </select>

                            {SUB_CATEGORIES[category] && (
                                <select
                                    value={subCategory}
                                    onChange={(e) => setSubCategory(e.target.value)}
                                    className="priority-select"
                                >
                                    <option value="">{t('tasks.subCategories.misc') || 'Select...'}</option>
                                    {SUB_CATEGORIES[category].map(sub => (
                                        <option key={sub} value={sub}>
                                            {t(`tasks.subCategories.${sub}`) || sub}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <button type="submit" className="save-btn">{t('tasks.save')}</button>
                    </div>
                </form>
            )}

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
