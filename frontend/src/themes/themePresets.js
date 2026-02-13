// Predefined theme presets for the application
export const themePresets = [
  {
    id: 'default',
    name: 'Default Blue',
    description: 'Clean and professional blue theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      background: '#f8fafc',
      sidebar: '#0f172a',
      sidebarText: '#ffffff',
      accent: '#06b6d4',
    },
    preview: ['#3b82f6', '#10b981', '#0f172a'],
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Calm and refreshing ocean tones',
    colors: {
      primary: '#0ea5e9',
      secondary: '#14b8a6',
      background: '#f0f9ff',
      sidebar: '#0c4a6e',
      sidebarText: '#ffffff',
      accent: '#22d3ee',
    },
    preview: ['#0ea5e9', '#14b8a6', '#0c4a6e'],
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Elegant purple with modern touch',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      background: '#faf5ff',
      sidebar: '#2e1065',
      sidebarText: '#ffffff',
      accent: '#a855f7',
    },
    preview: ['#8b5cf6', '#ec4899', '#2e1065'],
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    description: 'Natural and calming green theme',
    colors: {
      primary: '#10b981',
      secondary: '#06b6d4',
      background: '#ecfdf5',
      sidebar: '#064e3b',
      sidebarText: '#ffffff',
      accent: '#34d399',
    },
    preview: ['#10b981', '#06b6d4', '#064e3b'],
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm and energetic sunset colors',
    colors: {
      primary: '#f97316',
      secondary: '#eab308',
      background: '#fff7ed',
      sidebar: '#7c2d12',
      sidebarText: '#ffffff',
      accent: '#fb923c',
    },
    preview: ['#f97316', '#eab308', '#7c2d12'],
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Soft and elegant rose theme',
    colors: {
      primary: '#e11d48',
      secondary: '#f472b6',
      background: '#fff1f2',
      sidebar: '#881337',
      sidebarText: '#ffffff',
      accent: '#fb7185',
    },
    preview: ['#e11d48', '#f472b6', '#881337'],
  },
  {
    id: 'slate',
    name: 'Slate Professional',
    description: 'Minimal and professional dark theme',
    colors: {
      primary: '#6366f1',
      secondary: '#a5b4fc',
      background: '#f1f5f9',
      sidebar: '#1e293b',
      sidebarText: '#ffffff',
      accent: '#818cf8',
    },
    preview: ['#6366f1', '#a5b4fc', '#1e293b'],
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    description: 'Dark mode with blue accents',
    colors: {
      primary: '#60a5fa',
      secondary: '#34d399',
      background: '#0f172a',
      sidebar: '#020617',
      sidebarText: '#e2e8f0',
      accent: '#38bdf8',
    },
    preview: ['#60a5fa', '#34d399', '#020617'],
  },
  {
    id: 'corporate',
    name: 'Corporate Classic',
    description: 'Traditional corporate blue-gray',
    colors: {
      primary: '#1e40af',
      secondary: '#475569',
      background: '#f8fafc',
      sidebar: '#1e3a5f',
      sidebarText: '#ffffff',
      accent: '#3b82f6',
    },
    preview: ['#1e40af', '#475569', '#1e3a5f'],
  },
  {
    id: 'teal',
    name: 'Teal Modern',
    description: 'Modern teal with purple accents',
    colors: {
      primary: '#0d9488',
      secondary: '#7c3aed',
      background: '#f0fdfa',
      sidebar: '#134e4a',
      sidebarText: '#ffffff',
      accent: '#2dd4bf',
    },
    preview: ['#0d9488', '#7c3aed', '#134e4a'],
  },
];

export const getThemeById = (id) => {
  return themePresets.find(theme => theme.id === id) || themePresets[0];
};

export default themePresets;

