import { create } from 'zustand';
import { skillApi } from '@api/skillApi';

const useSkillStore = create((set, get) => ({
  skills: [],
  categories: [],
  isLoading: false,
  error: null,

  // Fetch all skills
  fetchSkills: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await skillApi.getAll();
      set({ skills: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch skills',
        isLoading: false,
      });
    }
  },

  // Fetch skill categories
  fetchCategories: async () => {
    try {
      const response = await skillApi.getCategories();
      set({ categories: response.data });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  // Create skill
  createSkill: async (skillData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await skillApi.create(skillData);
      set((state) => ({
        skills: [...state.skills, response.data],
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create skill';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Update skill
  updateSkill: async (id, skillData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await skillApi.update(id, skillData);
      set((state) => ({
        skills: state.skills.map((skill) =>
          skill.id === id ? response.data : skill
        ),
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update skill';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Delete skill
  deleteSkill: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await skillApi.delete(id);
      set((state) => ({
        skills: state.skills.filter((skill) => skill.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete skill';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Get skills by category
  getSkillsByCategory: (category) => {
    return get().skills.filter((skill) => skill.category === category);
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export { useSkillStore };

