import { create } from 'zustand';
import { allocationApi } from '@api/allocationApi';

const useAllocationStore = create((set, get) => ({
  allocations: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  filters: {
    employeeId: null,
    projectId: null,
    startDate: null,
    endDate: null,
    page: 0,
    size: 10,
  },

  // Fetch allocations
  fetchAllocations: async (customFilters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const filters = { ...get().filters, ...customFilters };
      const response = await allocationApi.getAll(filters);
      
      set({
        allocations: response.data.content,
        totalCount: response.data.totalElements,
        isLoading: false,
        filters,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch allocations',
        isLoading: false,
      });
    }
  },

  // Create allocation
  createAllocation: async (allocationData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await allocationApi.create(allocationData);
      set((state) => ({
        allocations: [response.data, ...state.allocations],
        totalCount: state.totalCount + 1,
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create allocation';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Update allocation
  updateAllocation: async (id, allocationData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await allocationApi.update(id, allocationData);
      set((state) => ({
        allocations: state.allocations.map((alloc) =>
          alloc.id === id ? response.data : alloc
        ),
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update allocation';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Delete allocation
  deleteAllocation: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await allocationApi.delete(id);
      set((state) => ({
        allocations: state.allocations.filter((alloc) => alloc.id !== id),
        totalCount: state.totalCount - 1,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete allocation';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Get allocations by employee
  fetchEmployeeAllocations: async (employeeId) => {
    try {
      const response = await allocationApi.getByEmployee(employeeId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch employee allocations:', error);
      return [];
    }
  },

  // Get allocations by project
  fetchProjectAllocations: async (projectId) => {
    try {
      const response = await allocationApi.getByProject(projectId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project allocations:', error);
      return [];
    }
  },

  // Check availability
  checkAvailability: async (employeeId, startDate, endDate) => {
    try {
      const response = await allocationApi.checkAvailability(employeeId, startDate, endDate);
      return response.data;
    } catch (error) {
      console.error('Failed to check availability:', error);
      return null;
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
        employeeId: null,
        projectId: null,
        startDate: null,
        endDate: null,
        page: 0,
        size: 10,
      },
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export { useAllocationStore };

