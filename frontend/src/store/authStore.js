import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@api/authApi';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Login action
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.login(credentials);
          const { user, accessToken, refreshToken } = response.data;
          
          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Logout action
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Refresh token action
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return null;
        }

        try {
          const response = await authApi.refreshToken(refreshToken);
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          set({
            token: accessToken,
            refreshToken: newRefreshToken,
          });
          
          return accessToken;
        } catch (error) {
          get().logout();
          return null;
        }
      },

      // Check authentication status
      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          const response = await authApi.getCurrentUser();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Try to refresh token
          const newToken = await get().refreshAccessToken();
          if (!newToken) {
            set({ isLoading: false, isAuthenticated: false });
          } else {
            try {
              const response = await authApi.getCurrentUser();
              set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch {
              get().logout();
              set({ isLoading: false });
            }
          }
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        try {
          const response = await authApi.updateProfile(profileData);
          set({ user: response.data });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed';
          return { success: false, error: message };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check if user has a specific role
      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) || false;
      },

      // Check if user has any of the specified roles
      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.some((role) => user?.roles?.includes(role)) || false;
      },

      // Check if user has a specific permission
      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      // Check if user has any of the specified permissions
      hasAnyPermission: (permissions) => {
        const { user } = get();
        return permissions.some((perm) => user?.permissions?.includes(perm)) || false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

export { useAuthStore };

