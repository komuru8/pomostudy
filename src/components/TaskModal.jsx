import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './TaskModal.css';

const TaskModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { t } = useLanguage();

    // Form State
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('TODAY');
    const [category, setCategory] = useState('Study');
    const [subCategory, setSubCategory] = useState('');
    const [targetPomodoros, setTargetPomodoros] = useState(1);

    // Categories
    const CATEGORIES = ['Study', 'Health', 'Hobby', 'Work', 'General'];
    const SUB_CATEGORIES = {
        Study: ['languages', 'certification', 'tech', 'reading', 'assignment', 'misc'],
        Health: ['exercise', 'cooking', 'sleep', 'mental', 'beauty', 'misc'],
        Hobby: ['creative', 'sports', 'game', 'entertainment', 'travel', 'misc'],
        Work: ['planning', 'development', 'meeting', 'admin', 'analysis', 'misc'],
        General: ['chores', 'shopping', 'finance', 'family', 'organize', 'misc']
    };

    // Validations State
    const [errors, setErrors] = useState({});

    // Reset or Load Data when opening
    useEffect(() => {
        if (isOpen) {
            setErrors({}); // Reset errors
            if (initialData) {
                // Edit Mode (Future proofing)
                setTitle(initialData.title || '');
                setPriority(initialData.priority || 'TODAY');
                setCategory(initialData.category || 'Study');
                setSubCategory(initialData.subCategory || '');
                setTargetPomodoros(initialData.targetPomodoros || 1);
            } else {
                // New Task
                setTitle('');
                setCategory('Study');
                setPriority('TODAY');
                setSubCategory('');
                setTargetPomodoros(1);
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!title.trim()) {
            newErrors.title = t('tasks.validation.titleRequired');
        }
        if (!subCategory) {
            newErrors.subCategory = t('tasks.validation.subCategoryRequired');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit if valid
        onSubmit({
            title,
            priority,
            category,
            subCategory,
            targetPomodoros
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{t('tasks.newTask')}</h2>
                    <button className="close-modal-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                        {/* Title Input */}
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder={t('tasks.placeholder')}
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                                }}
                                className={`task-input ${errors.title ? 'input-error' : ''}`}
                                style={{ fontSize: '1.2rem', padding: '12px 0' }}
                            />
                            {errors.title && <p className="error-message">{errors.title}</p>}
                        </div>

                        {/* Selectors Grid */}
                        <div className="selectors-grid-2col">
                            {/* 1. Category */}
                            <div className="select-wrapper">
                                <label className="select-label">{t('tasks.labels.category') || 'Category'}</label>
                                <select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setSubCategory('');
                                        if (errors.subCategory) setErrors(prev => ({ ...prev, subCategory: null }));
                                    }}
                                    className="priority-select"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>
                                            {t(`tasks.categories.${cat.toLowerCase()}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. SubCategory */}
                            <div className="select-wrapper">
                                <label className="select-label">{t('tasks.labels.subCategory') || 'Sub'}</label>
                                <select
                                    value={subCategory}
                                    onChange={(e) => {
                                        setSubCategory(e.target.value);
                                        if (errors.subCategory) setErrors(prev => ({ ...prev, subCategory: null }));
                                    }}
                                    className={`priority-select ${errors.subCategory ? 'input-error' : ''}`}
                                    disabled={!SUB_CATEGORIES[category]}
                                >
                                    <option value="">{t('tasks.selectPlaceholder') || 'Select...'}</option>
                                    {SUB_CATEGORIES[category]?.map(sub => (
                                        <option key={sub} value={sub}>
                                            {t(`tasks.subCategories.${sub}`) || sub}
                                        </option>
                                    ))}
                                </select>
                                {errors.subCategory && <p className="error-message">{errors.subCategory}</p>}
                            </div>

                            {/* 3. Priority */}
                            <div className="select-wrapper">
                                <label className="select-label">{t('tasks.labels.priority') || 'Priority'}</label>
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
                            </div>

                            {/* 4. Target Time */}
                            <div className="select-wrapper">
                                <label className="select-label">{t('tasks.labels.target') || 'Target'}</label>
                                <select
                                    value={targetPomodoros}
                                    onChange={(e) => setTargetPomodoros(Number(e.target.value))}
                                    className="priority-select"
                                >
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                        <option key={num} value={num}>
                                            {num} {'🍅'.repeat(num)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <footer className="modal-footer">
                        <button type="submit" className="save-btn">
                            <Save size={20} style={{ marginRight: '8px' }} />
                            {t('tasks.save')}
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            {t('tasks.cancel')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
