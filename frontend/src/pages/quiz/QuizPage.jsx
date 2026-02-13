import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { PageHeader, StatusChip } from '@components/common';
import { quizApi } from '@api/quizApi';
import { employeeApi } from '@api/employeeApi';
import { useAuthStore } from '@store/authStore';

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const CATEGORIES = ['TECHNICAL', 'SOFT_SKILLS', 'COMPLIANCE', 'DOMAIN', 'GENERAL'];
const QUESTION_TYPES = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'];

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
}

function QuizPage() {
  const { user, hasAnyRole } = useAuthStore();
  const isManager = hasAnyRole(['ADMIN', 'HR', 'PM']);

  const [tabValue, setTabValue] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [takeQuizDialogOpen, setTakeQuizDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, assignmentsRes] = await Promise.all([
        isManager ? quizApi.getAll({ size: 100 }) : quizApi.getPublished({ size: 100 }),
        quizApi.getMyAssignments(),
      ]);
      setQuizzes(quizzesRes.data?.content || quizzesRes.data || []);
      setMyAssignments(assignmentsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch quiz data:', err);
      setError('Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setCreateDialogOpen(true);
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCreateDialogOpen(true);
  };

  const handleViewQuiz = async (quiz) => {
    try {
      const res = await quizApi.getById(quiz.id);
      setSelectedQuiz(res.data);
      setViewDialogOpen(true);
    } catch (err) {
      console.error('Failed to load quiz details:', err);
    }
  };

  const handleAssignQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setAssignDialogOpen(true);
  };

  const handlePublishQuiz = async (quiz) => {
    try {
      await quizApi.publish(quiz.id);
      fetchData();
    } catch (err) {
      console.error('Failed to publish quiz:', err);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await quizApi.delete(quiz.id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  const handleStartQuiz = (assignment) => {
    setSelectedAssignment(assignment);
    setTakeQuizDialogOpen(true);
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Quiz Management" subtitle="Create and manage quizzes" />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Quiz Management"
        subtitle="Create, assign, and take quizzes"
        onPrimaryAction={isManager ? handleCreateQuiz : undefined}
        primaryActionLabel={isManager ? "Create Quiz" : undefined}
      />

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        {isManager && <Tab label={`All Quizzes (${quizzes.length})`} icon={<QuizIcon />} iconPosition="start" />}
        <Tab label={`My Quizzes (${myAssignments.length})`} icon={<AssignmentIcon />} iconPosition="start" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* All Quizzes Tab (Managers only) */}
      {isManager && (
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {quizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <QuizIcon />
                      </Avatar>
                      <Box>
                        <Chip 
                          label={quiz.status} 
                          size="small" 
                          color={quiz.status === 'PUBLISHED' ? 'success' : 'default'}
                        />
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {quiz.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {quiz.description?.substring(0, 80)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={quiz.category} size="small" variant="outlined" />
                      <Chip label={quiz.difficulty} size="small" variant="outlined" />
                      <Chip label={`${quiz.totalQuestions || 0} Q`} size="small" />
                      <Chip label={`${quiz.durationMinutes} min`} size="small" icon={<TimerIcon />} />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button size="small" onClick={() => handleViewQuiz(quiz)}>View</Button>
                      {quiz.status === 'DRAFT' && (
                        <>
                          <Button size="small" onClick={() => handleEditQuiz(quiz)}>Edit</Button>
                          <Button 
                            size="small" 
                            color="secondary" 
                            startIcon={<AddIcon />}
                            onClick={() => handleViewQuiz(quiz)}
                          >
                            Add Questions
                          </Button>
                          <Button 
                            size="small" 
                            color="success" 
                            onClick={() => handlePublishQuiz(quiz)}
                            disabled={!quiz.totalQuestions || quiz.totalQuestions === 0}
                          >
                            Publish
                          </Button>
                        </>
                      )}
                      {quiz.status === 'PUBLISHED' && (
                        <Button size="small" color="primary" onClick={() => handleAssignQuiz(quiz)}>
                          Assign
                        </Button>
                      )}
                      <IconButton size="small" color="error" onClick={() => handleDeleteQuiz(quiz)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {quizzes.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <QuizIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No quizzes yet</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateQuiz} sx={{ mt: 2 }}>
                    Create First Quiz
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      )}

      {/* My Quizzes Tab */}
      <TabPanel value={tabValue} index={isManager ? 1 : 0}>
        <Grid container spacing={3}>
          {myAssignments.map((assignment) => (
            <Grid item xs={12} sm={6} md={4} key={assignment.id}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar sx={{ bgcolor: assignment.passed ? 'success.main' : 'primary.main' }}>
                      {assignment.passed ? <CheckIcon /> : <QuizIcon />}
                    </Avatar>
                    <Chip 
                      label={assignment.status} 
                      size="small" 
                      color={
                        assignment.status === 'COMPLETED' ? 'success' : 
                        assignment.status === 'FAILED' ? 'error' : 
                        assignment.status === 'IN_PROGRESS' ? 'warning' : 'default'
                      }
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {assignment.quizTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={assignment.quizCategory} size="small" variant="outlined" />
                    <Chip label={assignment.quizDifficulty} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Due: {assignment.dueDate}
                  </Typography>
                  {assignment.bestScore !== null && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Best Score: <strong>{assignment.bestScore}%</strong>
                        {assignment.passed && <CheckIcon sx={{ ml: 1, color: 'success.main', fontSize: 16 }} />}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={assignment.bestScore} 
                        color={assignment.passed ? 'success' : 'primary'}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Attempts: {assignment.attemptsUsed || 0} / {assignment.maxAttempts || '∞'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {assignment.status !== 'COMPLETED' && assignment.status !== 'FAILED' && (
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<StartIcon />}
                      onClick={() => handleStartQuiz(assignment)}
                    >
                      {assignment.status === 'IN_PROGRESS' ? 'Continue Quiz' : 'Start Quiz'}
                    </Button>
                  )}
                  {assignment.status === 'COMPLETED' && (
                    <Button variant="outlined" fullWidth disabled>
                      Completed ✓
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {myAssignments.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No quizzes assigned to you</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Create/Edit Quiz Dialog */}
      <CreateQuizDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        quiz={selectedQuiz}
        onSave={() => {
          setCreateDialogOpen(false);
          fetchData();
        }}
      />

      {/* View Quiz Dialog */}
      <ViewQuizDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        quiz={selectedQuiz}
        onQuestionAdded={() => handleViewQuiz(selectedQuiz)}
      />

      {/* Assign Quiz Dialog */}
      <AssignQuizDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        quiz={selectedQuiz}
        onAssign={() => {
          setAssignDialogOpen(false);
          fetchData();
        }}
      />

      {/* Take Quiz Dialog */}
      <TakeQuizDialog
        open={takeQuizDialogOpen}
        onClose={() => setTakeQuizDialogOpen(false)}
        assignment={selectedAssignment}
        onComplete={() => {
          setTakeQuizDialogOpen(false);
          fetchData();
        }}
      />
    </Box>
  );
}

// Create/Edit Quiz Dialog
function CreateQuizDialog({ open, onClose, quiz, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    passingScore: 70,
    durationMinutes: 30,
    maxAttempts: 3,
    shuffleQuestions: false,
    showCorrectAnswers: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        category: quiz.category || 'TECHNICAL',
        difficulty: quiz.difficulty || 'INTERMEDIATE',
        passingScore: quiz.passingScore || 70,
        durationMinutes: quiz.durationMinutes || 30,
        maxAttempts: quiz.maxAttempts || 3,
        shuffleQuestions: quiz.shuffleQuestions || false,
        showCorrectAnswers: quiz.showCorrectAnswers !== false,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'TECHNICAL',
        difficulty: 'INTERMEDIATE',
        passingScore: 70,
        durationMinutes: 30,
        maxAttempts: 3,
        shuffleQuestions: false,
        showCorrectAnswers: true,
      });
    }
  }, [quiz, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (quiz) {
        await quizApi.update(quiz.id, formData);
      } else {
        await quizApi.create(formData);
      }
      onSave();
    } catch (err) {
      console.error('Failed to save quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{quiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty}
                  label="Difficulty"
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  {DIFFICULTIES.map((diff) => (
                    <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Passing Score (%)"
                type="number"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                fullWidth
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Duration (minutes)"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max Attempts"
                type="number"
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !formData.title}>
          {loading ? <CircularProgress size={20} /> : quiz ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// View Quiz Dialog with Question Management
function ViewQuizDialog({ open, onClose, quiz, onQuestionAdded }) {
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);

  if (!quiz) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          {quiz.title}
          <Chip label={quiz.status} size="small" sx={{ ml: 2 }} />
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {quiz.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Chip label={`Category: ${quiz.category}`} />
          <Chip label={`Difficulty: ${quiz.difficulty}`} />
          <Chip label={`Pass: ${quiz.passingScore}%`} />
          <Chip label={`Duration: ${quiz.durationMinutes} min`} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Questions ({quiz.questions?.length || 0})</Typography>
          {quiz.status === 'DRAFT' && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => setAddQuestionOpen(true)}
            >
              Add Question
            </Button>
          )}
        </Box>

        {(!quiz.questions || quiz.questions.length === 0) ? (
          <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 2 }}>
            <QuizIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No questions yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add questions to this quiz before publishing
            </Typography>
            {quiz.status === 'DRAFT' && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setAddQuestionOpen(true)}
              >
                Add First Question
              </Button>
            )}
          </Box>
        ) : (
          <List>
            {quiz.questions.map((question, index) => (
              <Card key={question.id} sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {index + 1}. {question.questionText}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {question.type?.replace('_', ' ')} • {question.points} points
                </Typography>
                <Box sx={{ mt: 1, pl: 2 }}>
                  {question.options?.map((opt, i) => (
                    <Typography 
                      key={opt.id} 
                      variant="body2" 
                      sx={{ 
                        color: opt.isCorrect ? 'success.main' : 'text.secondary',
                        fontWeight: opt.isCorrect ? 600 : 400 
                      }}
                    >
                      {String.fromCharCode(65 + i)}. {opt.optionText} {opt.isCorrect && '✓'}
                    </Typography>
                  ))}
                </Box>
              </Card>
            ))}
          </List>
        )}
      </DialogContent>

      <AddQuestionDialog
        open={addQuestionOpen}
        onClose={() => setAddQuestionOpen(false)}
        quizId={quiz.id}
        onSave={() => {
          setAddQuestionOpen(false);
          onQuestionAdded();
        }}
      />
    </Dialog>
  );
}

// Add Question Dialog
function AddQuestionDialog({ open, onClose, quizId, onSave }) {
  const initialFormData = {
    questionText: '',
    type: 'SINGLE_CHOICE',
    points: 10,
    explanation: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setError('');
    }
  }, [open]);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // For single choice, uncheck other options
    if (field === 'isCorrect' && value && formData.type === 'SINGLE_CHOICE') {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }
    
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    const filledOptions = formData.options.filter(opt => opt.optionText.trim());
    if (filledOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    const hasCorrectAnswer = formData.options.some(opt => opt.isCorrect && opt.optionText.trim());
    if (!hasCorrectAnswer) {
      setError('Please mark at least one correct answer');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Only send non-empty options
      const payload = {
        ...formData,
        options: formData.options.filter(opt => opt.optionText.trim())
      };
      await quizApi.addQuestion(quizId, payload);
      onSave();
    } catch (err) {
      console.error('Failed to add question:', err);
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Question</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <TextField
            label="Question"
            value={formData.questionText}
            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
            multiline
            rows={2}
            required
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {QUESTION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Points"
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>Options (mark correct answer)</Typography>
          {formData.options.map((option, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {formData.type === 'SINGLE_CHOICE' ? (
                <Radio
                  checked={option.isCorrect}
                  onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                />
              ) : (
                <Checkbox
                  checked={option.isCorrect}
                  onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                />
              )}
              <TextField
                placeholder={`Option ${index + 1}`}
                value={option.optionText}
                onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
          ))}

          <TextField
            label="Explanation (shown after answering)"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            multiline
            rows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !formData.questionText}>
          {loading ? <CircularProgress size={20} /> : 'Add Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Assign Quiz Dialog
function AssignQuizDialog({ open, onClose, quiz, onAssign }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getAllWithAvailability();
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployees.length || !dueDate) return;
    setLoading(true);
    try {
      await quizApi.assignMultiple(quiz.id, selectedEmployees, dueDate, remarks);
      onAssign();
    } catch (err) {
      console.error('Failed to assign quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!quiz) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Quiz: {quiz.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Select Employees</InputLabel>
            <Select
              multiple
              value={selectedEmployees}
              onChange={(e) => setSelectedEmployees(e.target.value)}
              label="Select Employees"
              renderValue={(selected) => `${selected.length} selected`}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name} - {emp.department}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <TextField
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleAssign} 
          disabled={loading || !selectedEmployees.length || !dueDate}
        >
          {loading ? <CircularProgress size={20} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Take Quiz Dialog
function TakeQuizDialog({ open, onClose, assignment, onComplete }) {
  const [quizData, setQuizData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (open && assignment) {
      startQuiz();
    }
  }, [open, assignment]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await quizApi.startAttempt(assignment.id);
      setQuizData(res.data.quiz);
      setAttemptId(res.data.attemptId);
      setTimeLeft(res.data.quiz.durationMinutes * 60);
      setAnswers({});
      setCurrentQuestion(0);
      setResult(null);
    } catch (err) {
      console.error('Failed to start quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionIds) => {
    setAnswers({ ...answers, [questionId]: optionIds });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptions]) => ({
        questionId: parseInt(questionId),
        selectedOptions: Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions],
      }));
      const res = await quizApi.submitAttempt(attemptId, formattedAnswers);
      setResult(res.data);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!assignment) return null;

  const questions = quizData?.questions || [];
  const question = questions[currentQuestion];

  return (
    <Dialog open={open} onClose={result ? onComplete : undefined} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {result ? 'Quiz Results' : quizData?.title || 'Loading...'}
        {!result && timeLeft !== null && (
          <Chip 
            icon={<TimerIcon />} 
            label={formatTime(timeLeft)} 
            color={timeLeft < 60 ? 'error' : 'default'}
          />
        )}
      </DialogTitle>
      <DialogContent dividers>
        {loading && !quizData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : result ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 3,
              bgcolor: result.passed ? 'success.main' : 'error.main' 
            }}>
              {result.passed ? <CheckIcon sx={{ fontSize: 40 }} /> : <CancelIcon sx={{ fontSize: 40 }} />}
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {result.scorePercentage}%
            </Typography>
            <Typography variant="h6" color={result.passed ? 'success.main' : 'error.main'} sx={{ mb: 2 }}>
              {result.passed ? 'Congratulations! You Passed!' : 'Unfortunately, you did not pass.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Score: {result.score} / {result.totalPoints} points<br />
              Passing Score: {result.passingScore}%<br />
              Time: {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
            </Typography>
          </Box>
        ) : question ? (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <Chip label={`${question.points} points`} size="small" />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={((currentQuestion + 1) / questions.length) * 100} 
              sx={{ mb: 3, height: 6, borderRadius: 3 }}
            />
            <Typography variant="h6" sx={{ mb: 3 }}>
              {question.questionText}
            </Typography>
            
            {question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE' ? (
              <RadioGroup
                value={answers[question.id]?.[0] || ''}
                onChange={(e) => handleAnswerChange(question.id, [parseInt(e.target.value)])}
              >
                {question.options?.map((opt) => (
                  <FormControlLabel
                    key={opt.id}
                    value={opt.id}
                    control={<Radio />}
                    label={opt.optionText}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            ) : (
              <FormGroup>
                {question.options?.map((opt) => (
                  <FormControlLabel
                    key={opt.id}
                    control={
                      <Checkbox
                        checked={(answers[question.id] || []).includes(opt.id)}
                        onChange={(e) => {
                          const current = answers[question.id] || [];
                          const newValue = e.target.checked
                            ? [...current, opt.id]
                            : current.filter((id) => id !== opt.id);
                          handleAnswerChange(question.id, newValue);
                        }}
                      />
                    }
                    label={opt.optionText}
                    sx={{ mb: 1 }}
                  />
                ))}
              </FormGroup>
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {result ? (
          <Button variant="contained" onClick={onComplete}>Close</Button>
        ) : (
          <>
            <Button 
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              Previous
            </Button>
            <Box sx={{ flex: 1 }} />
            {currentQuestion < questions.length - 1 ? (
              <Button 
                variant="contained"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="success"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Submit Quiz'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default QuizPage;

