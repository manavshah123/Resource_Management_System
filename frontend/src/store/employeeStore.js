import { create } from 'zustand';
import { employeeApi } from '@api/employeeApi';

const useEmployeeStore = create((set, get) => ({
  employees: [],
  selectedEmployee: null,
  totalCount: 0,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    department: '',
    status: '',
    skills: [],
    page: 0,
    size: 10,
    sort: 'createdAt,desc',
  },

  // Fetch all employees with filters
  fetchEmployees: async (customFilters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const filters = { ...get().filters, ...customFilters };
      const response = await employeeApi.getAll(filters);
      
      set({
        employees: response.data.content,
        totalCount: response.data.totalElements,
        isLoading: false,
        filters,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch employees',
        isLoading: false,
      });
    }
  },

  // Fetch single employee
  fetchEmployee: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await employeeApi.getById(id);
      set({ selectedEmployee: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch employee',
        isLoading: false,
      });
      return null;
    }
  },

  // Create employee
  createEmployee: async (employeeData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await employeeApi.create(employeeData);
      set((state) => ({
        employees: [response.data, ...state.employees],
        totalCount: state.totalCount + 1,
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create employee';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await employeeApi.update(id, employeeData);
      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === id ? response.data : emp
        ),
        selectedEmployee:
          state.selectedEmployee?.id === id
            ? response.data
            : state.selectedEmployee,
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update employee';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await employeeApi.delete(id);
      set((state) => ({
        employees: state.employees.filter((emp) => emp.id !== id),
        totalCount: state.totalCount - 1,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete employee';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Update employee skills
  updateEmployeeSkills: async (id, skills) => {
    try {
      const response = await employeeApi.updateSkills(id, skills);
      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === id ? { ...emp, skills: response.data } : emp
        ),
        selectedEmployee:
          state.selectedEmployee?.id === id
            ? { ...state.selectedEmployee, skills: response.data }
            : state.selectedEmployee,
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
        department: '',
        status: '',
        skills: [],
        page: 0,
        size: 10,
        sort: 'createdAt,desc',
      },
    });
  },

  // Clear selected employee
  clearSelectedEmployee: () => set({ selectedEmployee: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export { useEmployeeStore };

