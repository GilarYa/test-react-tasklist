import { useState } from 'react';

export default function ProjectList({
    projects,
    loading,
    selectedProject,
    onSelectProject,
    onEditProject,
    onAddTask,
    onEditTask,
    filters,
    onFiltersChange,
}) {
    const [expandedProjects, setExpandedProjects] = useState({});

    const toggleExpand = (projectId) => {
        setExpandedProjects((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Done': return 'status-done';
            case 'In Progress': return 'status-in-progress';
            default: return 'status-draft';
        }
    };

    const renderTask = (task, isSubtask = false) => (
        <div key={task.id}>
            <div
                className={`task-item ${isSubtask ? 'subtask' : ''}`}
                onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
            >
                <span className={`task-status-dot ${getStatusClass(task.status)}`} />
                <span className="task-name">{task.name}</span>
                <span className={`status-badge ${getStatusClass(task.status)}`}>
                    {task.status}
                </span>
            </div>
            {task.children && task.children.length > 0 && (
                <div style={{ paddingLeft: '16px' }}>
                    {task.children.map((child) => renderTask(child, true))}
                </div>
            )}
        </div>
    );

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="🔍 Search tasks..."
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                    >
                        <option value="">All</option>
                        <option value="Draft">Draft</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
            </div>

            <div className="project-list">
                {loading ? (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px 16px' }}>
                        <p style={{ fontSize: '0.85rem' }}>Belum ada project</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="project-item">
                            <div
                                className={`project-header ${selectedProject?.id === project.id ? 'active' : ''}`}
                                onClick={() => {
                                    toggleExpand(project.id);
                                    onSelectProject(project);
                                }}
                            >
                                <span className={`expand-icon ${expandedProjects[project.id] ? 'expanded' : ''}`}>
                                    ▶
                                </span>
                                <span className="project-name">{project.name}</span>
                                <span className={`status-badge ${getStatusClass(project.status)}`}>
                                    {project.status}
                                </span>
                                <button
                                    className="btn-icon project-add-task"
                                    title="Add task"
                                    onClick={(e) => { e.stopPropagation(); onAddTask(project.id); }}
                                >
                                    +
                                </button>
                                <button
                                    className="btn-icon project-add-task"
                                    title="Edit project"
                                    onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
                                >
                                    ✏️
                                </button>
                            </div>

                            <div className="project-meta">
                                <span className="project-meta-text">
                                    {project.completion_progress?.toFixed(1)}%
                                </span>
                                {project.start_date && (
                                    <span className="project-meta-text">
                                        📅 {project.start_date.split('T')[0]} → {project.end_date?.split('T')[0] || '...'}
                                    </span>
                                )}
                            </div>

                            <div style={{ padding: '0 12px 4px 36px' }}>
                                <div className="project-progress">
                                    <div
                                        className="project-progress-bar"
                                        style={{ width: `${project.completion_progress || 0}%` }}
                                    />
                                </div>
                            </div>

                            {expandedProjects[project.id] && project.tasks && project.tasks.length > 0 && (
                                <div className="task-list">
                                    {project.tasks.map((task) => renderTask(task))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}
