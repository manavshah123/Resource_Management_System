import { create } from 'zustand';

const useUIStore = create((set) => ({
  // Sidebar state
  sidebarOpen: true,
  sidebarCollapsed: false,

  // Modal states
  modals: {
    createEmployee: false,
    editEmployee: false,
    deleteEmployee: false,
    createProject: false,
    editProject: false,
    deleteProject: false,
    createSkill: false,
    editSkill: false,
    createAllocation: false,
    editAllocation: false,
    skillMatch: false,
  },

  // Drawer states
  drawers: {
    employeeDetail: false,
    projectDetail: false,
    notifications: false,
    filter: false,
  },

  // Selected items for modals/drawers
  selectedItem: null,

  // Notifications
  notifications: [],

  // Global loading state
  globalLoading: false,

  // Snackbar state
  snackbar: {
    open: false,
    message: '',
    severity: 'info', // 'success' | 'error' | 'warning' | 'info'
  },

  // Toggle sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  // Collapse sidebar
  toggleSidebarCollapse: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  // Open modal
  openModal: (modalName, item = null) => {
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
      selectedItem: item,
    }));
  },

  // Close modal
  closeModal: (modalName) => {
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
      selectedItem: null,
    }));
  },

  // Close all modals
  closeAllModals: () => {
    set((state) => ({
      modals: Object.keys(state.modals).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {}),
      selectedItem: null,
    }));
  },

  // Open drawer
  openDrawer: (drawerName, item = null) => {
    set((state) => ({
      drawers: { ...state.drawers, [drawerName]: true },
      selectedItem: item,
    }));
  },

  // Close drawer
  closeDrawer: (drawerName) => {
    set((state) => ({
      drawers: { ...state.drawers, [drawerName]: false },
      selectedItem: null,
    }));
  },

  // Set selected item
  setSelectedItem: (item) => {
    set({ selectedItem: item });
  },

  // Clear selected item
  clearSelectedItem: () => {
    set({ selectedItem: null });
  },

  // Show snackbar
  showSnackbar: (message, severity = 'info') => {
    set({
      snackbar: { open: true, message, severity },
    });
  },

  // Hide snackbar
  hideSnackbar: () => {
    set((state) => ({
      snackbar: { ...state.snackbar, open: false },
    }));
  },

  // Add notification
  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [
        { id, ...notification, read: false, createdAt: new Date() },
        ...state.notifications,
      ],
    }));
  },

  // Mark notification as read
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
    }));
  },

  // Clear all notifications
  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Set global loading
  setGlobalLoading: (loading) => {
    set({ globalLoading: loading });
  },
}));

export { useUIStore };

