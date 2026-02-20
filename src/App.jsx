import { useState, useEffect, useCallback } from 'react';
import { useProjects, useTasks } from './hooks/useData';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import TaskForm from './components/TaskForm';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import './index.css';

function App() {
  const {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addProjectDependency,
    removeProjectDependency,
  } = useProjects();

  const {
    createTask,
    updateTask,
    deleteTask,
    addTaskDependency,
    removeTaskDependency,
  } = useTasks();

  const [selectedProject, setSelectedProject] = useState(null);
  const [panel, setPanel] = useState({ open: false, type: null, data: null });
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  // Fetch projects on mount and when filters change
  useEffect(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    fetchProjects(params);
  }, [filters, fetchProjects]);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshData = useCallback(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    fetchProjects(params);
  }, [filters, fetchProjects]);

  // ============ Panel Management ============
  const openPanel = (type, data = null) => {
    setPanel({ open: true, type, data });
  };

  const closePanel = () => {
    setPanel({ open: false, type: null, data: null });
  };

  // ============ Project Actions ============
  const handleCreateProject = async (data) => {
    try {
      await createProject(data);
      showToast('success', 'Project berhasil dibuat!');
      closePanel();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleUpdateProject = async (id, data) => {
    try {
      await updateProject(id, data);
      showToast('success', 'Project berhasil diupdate!');
      closePanel();
      refreshData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteProject = (id) => {
    setConfirm({
      title: 'Hapus Project?',
      message: 'Semua task dalam project ini akan ikut terhapus. Lanjutkan?',
      onConfirm: async () => {
        try {
          await deleteProject(id);
          showToast('success', 'Project berhasil dihapus!');
          closePanel();
          if (selectedProject?.id === id) setSelectedProject(null);
        } catch (err) {
          showToast('error', err.message);
        }
        setConfirm(null);
      },
      onCancel: () => setConfirm(null),
    });
  };

  // ============ Task Actions ============
  const handleCreateTask = async (data) => {
    try {
      await createTask(data);
      showToast('success', 'Task berhasil dibuat!');
      closePanel();
      refreshData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleUpdateTask = async (id, data) => {
    try {
      await updateTask(id, data);
      showToast('success', 'Task berhasil diupdate!');
      closePanel();
      refreshData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteTask = (id) => {
    setConfirm({
      title: 'Hapus Task?',
      message: 'Subtask dan dependency terkait akan ikut terhapus. Lanjutkan?',
      onConfirm: async () => {
        try {
          await deleteTask(id);
          showToast('success', 'Task berhasil dihapus!');
          closePanel();
          refreshData();
        } catch (err) {
          showToast('error', err.message);
        }
        setConfirm(null);
      },
      onCancel: () => setConfirm(null),
    });
  };

  // ============ Dependency Actions ============
  const handleAddProjectDep = async (projectId, depProjectId) => {
    try {
      await addProjectDependency(projectId, depProjectId);
      showToast('success', 'Project dependency ditambahkan!');
      refreshData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleRemoveProjectDep = async (projectId, depId) => {
    try {
      await removeProjectDependency(projectId, depId);
      showToast('success', 'Project dependency dihapus!');
      refreshData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleAddTaskDep = async (taskId, depTaskId) => {
    try {
      await addTaskDependency(taskId, depTaskId);
      showToast('success', 'Task dependency ditambahkan!');
      refreshData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleRemoveTaskDep = async (taskId, depId) => {
    try {
      await removeTaskDependency(taskId, depId);
      showToast('success', 'Task dependency dihapus!');
      refreshData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Get panel title
  const getPanelTitle = () => {
    switch (panel.type) {
      case 'create-project': return 'Add Project';
      case 'edit-project': return 'Edit Project';
      case 'create-task': return 'Add Task';
      case 'edit-task': return 'Edit Task';
      default: return '';
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>📋 Project Tracker</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => openPanel('create-project')}>
            + Add Project
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => openPanel('create-task')}
            disabled={projects.length === 0}
          >
            + Add Task
          </button>
        </div>
      </header>

      {/* Body — 2-column layout */}
      <div className="app-body">
        {/* Left Panel: Project & Task List */}
        <ProjectList
          projects={projects}
          loading={loading}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          onEditProject={(p) => openPanel('edit-project', p)}
          onAddTask={(projectId) => openPanel('create-task', { project_id: projectId })}
          onEditTask={(task) => openPanel('edit-task', task)}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Right Panel: Form or Empty State */}
        <div className="content-area">
          {panel.open ? (
            <div className="form-panel">
              <div className="form-panel-header">
                <h2>{getPanelTitle()}</h2>
                <button className="btn-icon" onClick={closePanel} style={{ fontSize: '1.2rem' }}>
                  ✕
                </button>
              </div>
              <div className="form-panel-body">
                {(panel.type === 'create-project' || panel.type === 'edit-project') && (
                  <ProjectForm
                    project={panel.data}
                    projects={projects}
                    onSave={panel.type === 'create-project' ? handleCreateProject : (data) => handleUpdateProject(panel.data.id, data)}
                    onDelete={panel.type === 'edit-project' ? () => handleDeleteProject(panel.data.id) : null}
                    onAddDependency={handleAddProjectDep}
                    onRemoveDependency={handleRemoveProjectDep}
                    refreshData={refreshData}
                    onError={(msg) => showToast('error', msg)}
                  />
                )}
                {(panel.type === 'create-task' || panel.type === 'edit-task') && (
                  <TaskForm
                    task={panel.data}
                    projects={projects}
                    onSave={panel.type === 'create-task' ? handleCreateTask : (data) => handleUpdateTask(panel.data.id, data)}
                    onDelete={panel.type === 'edit-task' ? () => handleDeleteTask(panel.data.id) : null}
                    onAddDependency={handleAddTaskDep}
                    onRemoveDependency={handleRemoveTaskDep}
                    refreshData={refreshData}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🚀</div>
              <h2>Mini Project Tracker</h2>
              <p>Klik project atau task di sidebar, atau buat baru untuk memulai</p>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}
    </div>
  );
}

export default App;
