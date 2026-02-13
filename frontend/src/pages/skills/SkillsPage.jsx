import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Tabs,
  Tab,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  ColorLens as ColorIcon,
} from '@mui/icons-material';
import { PageHeader } from '@components/common';
import { skillApi } from '@api/skillApi';
import { skillCategoryApi } from '@api/skillCategoryApi';

function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0 = Skills, 1 = Categories

  // Dialogs
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedCategoryItem, setSelectedCategoryItem] = useState(null);
  
  // Forms
  const [skillForm, setSkillForm] = useState({ name: '', category: '', description: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', code: '', color: '#3b82f6', description: '' });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [skillsRes, categoriesRes] = await Promise.all([
        skillApi.getAll(),
        skillCategoryApi.getAll(),
      ]);
      setSkills(skillsRes.data?.content || skillsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Skill CRUD
  const handleAddSkill = () => {
    setSelectedSkill(null);
    setSkillForm({ name: '', category: categories[0]?.code || '', description: '' });
    setSkillDialogOpen(true);
  };

  const handleEditSkill = (skill) => {
    setSelectedSkill(skill);
    setSkillForm({
      name: skill.name,
      category: skill.category,
      description: skill.description || '',
    });
    setSkillDialogOpen(true);
  };

  const handleDeleteSkill = async () => {
    if (!selectedSkill) return;
    try {
      await skillApi.delete(selectedSkill.id);
      showSnackbar('Skill deleted successfully', 'success');
      fetchData();
      setDeleteDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to delete skill', 'error');
    }
  };

  const handleSubmitSkill = async () => {
    if (!skillForm.name || !skillForm.category) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    try {
      if (selectedSkill) {
        await skillApi.update(selectedSkill.id, skillForm);
        showSnackbar('Skill updated successfully', 'success');
      } else {
        await skillApi.create(skillForm);
        showSnackbar('Skill created successfully', 'success');
      }
      fetchData();
      setSkillDialogOpen(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save skill', 'error');
    }
  };

  // Category CRUD
  const handleAddCategory = () => {
    setSelectedCategoryItem(null);
    setCategoryForm({ name: '', code: '', color: '#3b82f6', description: '' });
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategoryItem(category);
    setCategoryForm({
      name: category.name,
      code: category.code,
      color: category.color || '#3b82f6',
      description: category.description || '',
    });
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (category) => {
    if (category.skillCount > 0) {
      showSnackbar(`Cannot delete category with ${category.skillCount} skills`, 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    
    try {
      await skillCategoryApi.delete(category.id);
      showSnackbar('Category deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  const handleSubmitCategory = async () => {
    if (!categoryForm.name) {
      showSnackbar('Please enter category name', 'error');
      return;
    }

    try {
      const code = categoryForm.code || categoryForm.name.toUpperCase().replace(/\s+/g, '_');
      const data = { ...categoryForm, code };
      
      if (selectedCategoryItem) {
        await skillCategoryApi.update(selectedCategoryItem.id, data);
        showSnackbar('Category updated successfully', 'success');
      } else {
        await skillCategoryApi.create(data);
        showSnackbar('Category created successfully', 'success');
      }
      fetchData();
      setCategoryDialogOpen(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = !search || skill.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group skills by category
  const groupedSkills = categories.reduce((acc, category) => {
    acc[category.code] = filteredSkills.filter((s) => s.category === category.code);
    return acc;
  }, {});

  const getCategoryInfo = (code) => categories.find(c => c.code === code) || { name: code, color: '#64748b' };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Skills & Categories"
        subtitle={`${skills.length} skills in ${categories.length} categories`}
      />

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Skills (${skills.length})`} />
          <Tab label={`Categories (${categories.length})`} />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Skills Tab */}
      {tabValue === 0 && (
        <>
          {/* Search and Filters */}
          <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search skills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label="All"
                      onClick={() => setSelectedCategory(null)}
                      variant={!selectedCategory ? 'filled' : 'outlined'}
                      color={!selectedCategory ? 'primary' : 'default'}
                    />
                    {categories.map((cat) => (
                      <Chip
                        key={cat.id}
                        label={cat.name}
                        onClick={() => setSelectedCategory(cat.code)}
                        variant={selectedCategory === cat.code ? 'filled' : 'outlined'}
                        sx={{
                          bgcolor: selectedCategory === cat.code ? `${cat.color}20` : 'transparent',
                          color: selectedCategory === cat.code ? cat.color : 'text.primary',
                          borderColor: cat.color,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddSkill}
                  >
                    Add Skill
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Skills by Category */}
          <Grid container spacing={3}>
            {categories
              .filter((cat) => groupedSkills[cat.code]?.length > 0)
              .map((category) => (
                <Grid item xs={12} key={category.id}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: category.color,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                        <Chip
                          label={groupedSkills[category.code]?.length || 0}
                          size="small"
                          sx={{ bgcolor: `${category.color}20`, color: category.color }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {groupedSkills[category.code]?.map((skill) => (
                          <Box
                            key={skill.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              bgcolor: 'background.default',
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                '& .skill-actions': { opacity: 1 },
                              },
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {skill.name}
                            </Typography>
                            <Chip
                              label={`${skill.employeeCount || 0} employees`}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Box
                              className="skill-actions"
                              sx={{
                                display: 'flex',
                                gap: 0.5,
                                opacity: 0,
                                transition: 'opacity 0.2s',
                              }}
                            >
                              <IconButton size="small" onClick={() => handleEditSkill(skill)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedSkill(skill);
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            {filteredSkills.length === 0 && (
              <Grid item xs={12}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      No skills found
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddSkill}>
                      Add First Skill
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </>
      )}

      {/* Categories Tab */}
      {tabValue === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCategory}>
              Add Category
            </Button>
          </Box>

          <Grid container spacing={3}>
            {categories.length === 0 ? (
              <Grid item xs={12}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent sx={{ textAlign: 'center', py: 8 }}>
                    <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      No categories found
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCategory}>
                      Create First Category
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      borderTop: `4px solid ${category.color}`,
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: category.color, width: 48, height: 48 }}>
                          <CategoryIcon />
                        </Avatar>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleEditCategory(category)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={category.skillCount > 0}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Code: {category.code}
                      </Typography>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {category.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${category.skillCount || 0} skills`}
                          size="small"
                          sx={{ bgcolor: `${category.color}15`, color: category.color }}
                        />
                        <Chip
                          label={`Order: ${category.displayOrder}`}
                          size="small"
                          variant="outlined"
                        />
                        {category.isActive ? (
                          <Chip label="Active" size="small" color="success" />
                        ) : (
                          <Chip label="Inactive" size="small" color="default" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </>
      )}

      {/* Skill Dialog */}
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedSkill ? 'Edit Skill' : 'Add New Skill'}
          <IconButton onClick={() => setSkillDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Skill Name"
              value={skillForm.name}
              onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
              required
              placeholder="e.g., React, Python, AWS"
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={skillForm.category}
                label="Category"
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color }} />
                      {cat.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={skillForm.description}
              onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
              placeholder="Brief description of this skill..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSkillDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitSkill} disabled={!skillForm.name || !skillForm.category}>
            {selectedSkill ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedCategoryItem ? 'Edit Category' : 'Add New Category'}
          <IconButton onClick={() => setCategoryDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
              placeholder="e.g., Cloud, AI/ML, Security"
            />
            <TextField
              fullWidth
              label="Category Code"
              value={categoryForm.code}
              onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })}
              placeholder="Leave blank to auto-generate"
              helperText="Used internally to identify the category"
              disabled={!!selectedCategoryItem}
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Color</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#64748b'].map((color) => (
                  <Box
                    key={color}
                    onClick={() => setCategoryForm({ ...categoryForm, color })}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: color,
                      cursor: 'pointer',
                      border: categoryForm.color === color ? '3px solid' : '2px solid transparent',
                      borderColor: categoryForm.color === color ? 'primary.main' : 'transparent',
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Box>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Brief description..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitCategory} disabled={!categoryForm.name}>
            {selectedCategoryItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Skill</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{selectedSkill?.name}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteSkill}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SkillsPage;
