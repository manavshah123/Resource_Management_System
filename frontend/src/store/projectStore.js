import { create } from 'zustand';
import { projectApi } from '@api/projectApi';

const useProjectStore = create((set, get) => ({
  projects: [],
  selectedProject: null,
  totalCount: 0,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    startDate: null,
    endDate: null,
    page: 0,
    size: 10,
    sort: 'createdAt,desc',
  },

  // Fetch all projects
  fetchProjects: async (customFilters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const filters = { ...get().filters, ...customFilters };
      const response = await projectApi.getAll(filters);
      
      set({
        projects: response.data.content,
        totalCount: response.data.totalElements,
        isLoading: false,
        filters,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  // Fetch single project
  fetchProject: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectApi.getById(id);
      set({ selectedProject: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch project',
        isLoading: false,
      });
      return null;
    }
  },

  // Create project
  createProject: async (projectData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectApi.create(projectData);
      set((state) => ({
        projects: [response.data, ...state.projects],
        totalCount: state.totalCount + 1,
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectApi.update(id, projectData);
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj.id === id ? response.data : proj
        ),
        selectedProject:
          state.selectedProject?.id === id
            ? response.data
            : state.selectedProject,
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update project';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await projectApi.delete(id);
      set((state) => ({
        projects: state.projects.filter((proj) => proj.id !== id),
        totalCount: state.totalCount - 1,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete project';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Add team member to project
  addTeamMember: async (projectId, employeeId, allocation) => {
    try {
      const response = await projectApi.addTeamMember(projectId, employeeId, allocation);
      set((state) => ({
        selectedProject: state.selectedProject?.id === projectId
          ? { ...state.selectedProject, teamMembers: response.data }
          : state.selectedProject,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Remove team member from project
  removeTeamMember: async (projectId, employeeId) => {
    try {
      const response = await projectApi.removeTeamMember(projectId, employeeId);
      set((state) => ({
        selectedProject: state.selectedProject?.id === projectId
          ? { ...state.selectedProject, teamMembers: response.data }
          : state.selectedProject,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Update project status
  updateProjectStatus: async (id, status) => {
    try {
      const response = await projectApi.updateStatus(id, status);
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj.id === id ? response.data : proj
        ),
        selectedProject:
          state.selectedProject?.id === id
            ? response.data
            : state.selectedProject,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        search: '',
        status: '',
        startDate: null,
        endDate: null,
        page: 0,
        size: 10,
        sort: 'createdAt,desc',
      },
    });
  },

  // Clear selected project
  clearSelectedProject: () => set({ selectedProject: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export { useProjectStore };

