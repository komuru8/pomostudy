import React from 'react';
import { Play, Check, Trash2, Sun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './TaskItem.css';

const TaskItem = ({ task, onSelect, onDelete, onComplete, isActive }) => {
    const { t } = useLanguage();
    const [confirmMode, setConfirmMode] = React.useState(null); // null, 'DELETE', 'FOCUS'

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setConfirmMode('DELETE');
    };

    const handleFocusClick = (e) => {
        e.stopPropagation();
        setConfirmMode('FOCUS');
    };

    const handleConfirm = (e) => {
        e.stopPropagation();
        if (confirmMode === 'DELETE') {
            onDelete(task.id);
        } else if (confirmMode === 'FOCUS') {
            onSelect(task.id);
        }
        setConfirmMode(null);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setConfirmMode(null);
    };

    return (
        <div className={`task-item ${isActive ? 'active-focus' : ''} ${task.priority === 'TODAY' ? 'is-today' : ''} ${task.status === 'DONE' ? 'done' : ''}`}>

            {isActive && (
                <div className="active-indicator-badge">
                    <Play size={12} fill="currentColor" />
                    <span>{t('timer.currentFocus')}</span>
                </div>
            )}

            <div className="task-left">
                <button
                    className={`check-btn ${task.status === 'DONE' ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
                >
                    {task.status === 'DONE' && <Check size={16} />}
                </button>

                <div className="task-info">
                    <span className={`task-title ${task.status === 'DONE' ? 'completed' : ''}`}>
                        {task.title}
                    </span>
                    <div className="task-meta-row">
                        <span className={`category-badge ${task.category ? task.category.toLowerCase() : 'general'}`}>
                            {t(`tasks.categories.${task.category ? task.category.toLowerCase() : 'general'}`)}
                        </span>
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                            {t(`tasks.priority.${task.priority.toLowerCase()}`)}
                        </span>
                        <span className="pomodoro-count">
                            <div className="tomatoes-container">
                                {Array.from({ length: Math.max(task.targetPomodoros || 1, task.pomodorosSpent || 1) }).map((_, i) => {
                                    // i is 0-indexed.
                                    // If spent=1, i=0 is DONE (Colored). i=1 is PENDING (Gray).
                                    // Logic: if (i < pomodorosSpent) -> DONE
                                    const isDone = i < (task.pomodorosSpent || 0);
                                    return (
                                        <span key={i} className={`tomato-icon ${isDone ? 'done-colored' : 'pending-gray'}`}>
                                            🍅
                                        </span>
                                    );
                                })}
                            </div>
                            {(task.targetPomodoros > 0 || task.pomodorosSpent > 0) && (
                                <span className="progress-text">
                                    {task.pomodorosSpent || 0}/{task.targetPomodoros || 1}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <div className="task-actions">
                {task.status !== 'DONE' && !isActive && (
                    <button className="icon-btn focus-btn" onClick={handleFocusClick} title="Focus This">
                        <Play size={20} fill="currentColor" />
                    </button>
                )}
                <button className="icon-btn delete-btn" onClick={handleDeleteClick}>
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Delete Confirmation Overlay inside the card */}
            {/* Confirmation Overlay inside the card */}
            {confirmMode && (
                <div className="confirm-delete-overlay">
                    <div className="confirm-content">
                        <p>{confirmMode === 'DELETE' ? t('tasks.confirmDelete') : t('tasks.confirmFocus')}</p>
                        <div className="confirm-buttons">
                            <button className="confirm-btn yes" onClick={handleConfirm}>{t('tasks.yes')}</button>
                            <button className="confirm-btn no" onClick={handleCancel}>{t('tasks.no')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskItem;
