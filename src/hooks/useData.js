import { useState, useCallback } from 'react';
import { projectAPI, taskAPI } from '../api/api';

export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProjects = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const res = await projectAPI.getAll(filters);
            setProjects(res.data || []);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(async (data) => {
        const res = await projectAPI.create(data);
        setProjects((prev) => [res.data, ...prev]);
        return res.data;
    }, []);

    const updateProject = useCallback(async (id, data) => {
        const res = await projectAPI.update(id, data);
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? res.data : p))
        );
        return res.data;
    }, []);

    const deleteProject = useCallback(async (id) => {
        await projectAPI.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const addProjectDependency = useCallback(async (id, depId) => {
        const res = await projectAPI.addDependency(id, depId);
        return res.data;
    }, []);

    const removeProjectDependency = useCallback(async (id, depId) => {
        await projectAPI.removeDependency(id, depId);
    }, []);

    return {
        projects,
        loading,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        addProjectDependency,
        removeProjectDependency,
    };
}

export function useTasks() {
    const fetchTasks = useCallback(async (params = {}) => {
        const res = await taskAPI.getAll(params);
        return res.data || [];
    }, []);

    const createTask = useCallback(async (data) => {
        const res = await taskAPI.create(data);
        return res.data;
    }, []);

    const updateTask = useCallback(async (id, data) => {
        const res = await taskAPI.update(id, data);
        return res.data;
    }, []);

    const deleteTask = useCallback(async (id) => {
        await taskAPI.delete(id);
    }, []);

    const addTaskDependency = useCallback(async (id, depId) => {
        const res = await taskAPI.addDependency(id, depId);
        return res.data;
    }, []);

    const removeTaskDependency = useCallback(async (id, depId) => {
        await taskAPI.removeDependency(id, depId);
    }, []);

    return {
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        addTaskDependency,
        removeTaskDependency,
    };
}
