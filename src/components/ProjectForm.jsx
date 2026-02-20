import { useState, useEffect } from 'react';
import { projectAPI } from '../api/api';

export default function ProjectForm({
    project,
    projects,
    onSave,
    onDelete,
    onAddDependency,
    onRemoveDependency,
    refreshData,
    onError,
}) {
    const isEdit = !!project?.id;
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deps, setDeps] = useState([]);
    const [selectedDep, setSelectedDep] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isEdit && project) {
            setName(project.name || '');
            setStartDate(project.start_date ? project.start_date.split('T')[0] : '');
            setEndDate(project.end_date ? project.end_date.split('T')[0] : '');
            setDeps(project.dependencies || []);
        }
    }, [project, isEdit]);

    const handleSave = async () => {
        if (!name.trim()) {
            onError && onError('Nama project wajib diisi');
            return;
        }
        if (!startDate) {
            onError && onError('Start Date wajib diisi');
            return;
        }
        if (!endDate) {
            onError && onError('End Date wajib diisi');
            return;
        }
        setSaving(true);
        try {
            const data = {
                name,
                start_date: startDate,
                end_date: endDate,
            };
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
            await onAddDependency(project.id, parseInt(selectedDep));
            // Refresh project data to get updated deps
            const res = await projectAPI.getById(project.id);
            setDeps(res.data.dependencies || []);
            setSelectedDep('');
            refreshData();
        } catch (err) {
            // handled by parent
        }
    };

    const handleRemoveDep = async (depId) => {
        try {
            await onRemoveDependency(project.id, depId);
            setDeps((prev) => prev.filter((d) => d.id !== depId));
            refreshData();
        } catch (err) {
            // handled by parent
        }
    };

    const availableProjects = projects.filter(
        (p) =>
            p.id !== project?.id &&
            !deps.some((d) => d.depends_on_project_id === p.id)
    );

    return (
        <div>
            <div className="form-group">
                <label className="form-label">Name</label>
                <input
                    className="form-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Project name..."
                    autoFocus
                />
            </div>

            {isEdit && (
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <input
                        className="form-input"
                        type="text"
                        value={project.status}
                        disabled
                        style={{ opacity: 0.6 }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Status otomatis berdasarkan task
                    </span>
                </div>
            )}

            {isEdit && (
                <div className="form-group">
                    <label className="form-label">Completion Progress</label>
                    <div className="project-progress" style={{ height: '8px', marginBottom: '4px' }}>
                        <div
                            className="project-progress-bar"
                            style={{ width: `${project.completion_progress || 0}%` }}
                        />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {project.completion_progress?.toFixed(1)}%
                    </span>
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                        className="form-input"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input
                        className="form-input"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Dependencies Section */}
            {isEdit && (
                <div className="dep-section">
                    <h3>🔗 Project Dependencies</h3>
                    <div className="dep-list">
                        {deps.length === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Tidak ada dependency
                            </span>
                        ) : (
                            deps.map((dep) => (
                                <div key={dep.id} className="dep-item">
                                    <span className="dep-item-name">
                                        {dep.depends_on_project?.name || `Project #${dep.depends_on_project_id}`}
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

                    {availableProjects.length > 0 && (
                        <div className="dep-add">
                            <select
                                value={selectedDep}
                                onChange={(e) => setSelectedDep(e.target.value)}
                            >
                                <option value="">Pilih project...</option>
                                {availableProjects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
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
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || !name.trim() || !startDate || !endDate}>
                    {saving ? '...' : '💾 Simpan'}
                </button>
            </div>
        </div>
    );
}
