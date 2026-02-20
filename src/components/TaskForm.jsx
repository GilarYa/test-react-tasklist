import { useState, useEffect } from 'react';
import { taskAPI } from '../api/api';

export default function TaskForm({
    task,
    projects,
    onSave,
    onDelete,
    onAddDependency,
    onRemoveDependency,
    refreshData,
}) {
    const isEdit = !!task?.id;
    const [name, setName] = useState('');
    const [status, setStatus] = useState('Draft');
    const [projectId, setProjectId] = useState('');
    const [parentId, setParentId] = useState('');
    const [bobot, setBobot] = useState(1);
    const [deps, setDeps] = useState([]);
    const [selectedDep, setSelectedDep] = useState('');
    const [saving, setSaving] = useState(false);
    const [allTasks, setAllTasks] = useState([]);

    useEffect(() => {
        if (isEdit && task) {
            setName(task.name || '');
            setStatus(task.status || 'Draft');
            setProjectId(task.project_id?.toString() || '');
            setParentId(task.parent_id?.toString() || '');
            setBobot(task.bobot || 1);
            setDeps(task.dependencies || []);
        } else if (task?.project_id) {
            // Pre-fill project when adding task to a specific project
            setProjectId(task.project_id.toString());
        }
    }, [task, isEdit]);

    // Fetch all tasks for dependency selection
    useEffect(() => {
        async function fetchAllTasks() {
            try {
                const res = await taskAPI.getAll(projectId ? { project_id: projectId } : {});
                setAllTasks(res.data || []);
            } catch (err) {
                console.error('Failed to fetch tasks for deps:', err);
            }
        }
        if (projectId) {
            fetchAllTasks();
        }
    }, [projectId]);

    const handleSave = async () => {
        if (!name.trim() || !projectId) return;
        setSaving(true);
        try {
            const data = {
                name,
                project_id: parseInt(projectId),
                bobot: parseInt(bobot) || 1,
            };

            if (isEdit) {
                data.status = status;
            }

            if (parentId) {
                data.parent_id = parseInt(parentId);
            }

            await onSave(data);
        } catch (err) {
            // handled by parent
        } finally {
            setSaving(false);
        }
    };

    const handleAddDep = async () => {
        if (!selectedDep) return;
        try {
            await onAddDependency(task.id, parseInt(selectedDep));
            // Refresh task data to get updated deps
            const res = await taskAPI.getById(task.id);
            setDeps(res.data.dependencies || []);
            setSelectedDep('');
            refreshData();
        } catch (err) {
            // handled by parent
        }
    };

    const handleRemoveDep = async (depId) => {
        try {
            await onRemoveDependency(task.id, depId);
            setDeps((prev) => prev.filter((d) => d.id !== depId));
            refreshData();
        } catch (err) {
            // handled by parent
        }
    };

    // Flatten tasks for parent selection (exclude current task and its children)
    const flattenTasks = (tasks, level = 0) => {
        let result = [];
        for (const t of tasks) {
            if (t.id !== task?.id) {
                result.push({ ...t, level });
                if (t.children && t.children.length > 0) {
                    result = result.concat(flattenTasks(t.children, level + 1));
                }
            }
        }
        return result;
    };

    // Get available tasks for dependency (exclude self and already added)
    const flatAllTasks = flattenTasks(allTasks);
    const availableTasksForDep = flatAllTasks.filter(
        (t) =>
            t.id !== task?.id &&
            !deps.some((d) => d.depends_on_task_id === t.id)
    );

    // Get current project's tasks for parent selection
    const selectedProjectObj = projects.find((p) => p.id === parseInt(projectId));
    const parentOptions = selectedProjectObj
        ? flattenTasks(selectedProjectObj.tasks || [])
        : [];

    return (
        <div>
            <div className="form-group">
                <label className="form-label">Name</label>
                <input
                    className="form-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Task name..."
                    autoFocus
                />
            </div>

            {isEdit && (
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="Draft">Draft</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Project</label>
                <select
                    className="form-select"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={isEdit}
                >
                    <option value="">Pilih project...</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Bobot (Weight)</label>
                    <input
                        className="form-input"
                        type="number"
                        min="1"
                        value={bobot}
                        onChange={(e) => setBobot(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Parent Task (optional)</label>
                    <select
                        className="form-select"
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                        disabled={isEdit}
                    >
                        <option value="">None (Top-level)</option>
                        {parentOptions.map((t) => (
                            <option key={t.id} value={t.id}>
                                {'  '.repeat(t.level)}{t.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Dependencies Section */}
            {isEdit && (
                <div className="dep-section">
                    <h3>🔗 Task Dependencies</h3>
                    <div className="dep-list">
                        {deps.length === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Tidak ada dependency
                            </span>
                        ) : (
                            deps.map((dep) => (
                                <div key={dep.id} className="dep-item">
                                    <span className="dep-item-name">
                                        {dep.depends_on_task?.name || `Task #${dep.depends_on_task_id}`}
                                        {dep.depends_on_task && (
                                            <span className={`status-badge ${dep.depends_on_task.status === 'Done' ? 'status-done' : dep.depends_on_task.status === 'In Progress' ? 'status-in-progress' : 'status-draft'}`} style={{ marginLeft: '8px' }}>
                                                {dep.depends_on_task.status}
                                            </span>
                                        )}
                                    </span>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleRemoveDep(dep.id)}
                                        style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {availableTasksForDep.length > 0 && (
                        <div className="dep-add">
                            <select
                                value={selectedDep}
                                onChange={(e) => setSelectedDep(e.target.value)}
                            >
                                <option value="">Pilih task...</option>
                                {availableTasksForDep.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {'  '.repeat(t.level)}{t.name} ({t.status})
                                    </option>
                                ))}
                            </select>
                            <button className="btn btn-sm btn-primary" onClick={handleAddDep}>
                                Add
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="slide-panel-footer" style={{ marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
                <div>
                    {onDelete && (
                        <button className="btn btn-danger" onClick={onDelete}>
                            🗑 Hapus
                        </button>
                    )}
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving || !name.trim() || !projectId}
                >
                    {saving ? '...' : '💾 Simpan'}
                </button>
            </div>
        </div>
    );
}
