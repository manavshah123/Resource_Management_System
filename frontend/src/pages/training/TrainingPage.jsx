import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  School as TrainingIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as LinkIcon,
  VideoLibrary as VideoIcon,
  Description as DocIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  DragIndicator as DragIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  EmojiEvents as CertificateIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { PageHeader } from '@components/common';
import { useUIStore } from '@store/uiStore';
import { useAuthStore } from '@store/authStore';
import { trainingApi } from '@api/trainingApi';
import { employeeApi } from '@api/employeeApi';
import { certificateApi } from '@api/certificateApi';
import { quizApi } from '@api/quizApi';

// Helper function to extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Check if URL is a video URL (YouTube, Vimeo, etc.)
const isVideoUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

// Video Player Component
const VideoPlayer = ({ url, title }) => {
  const videoId = getYouTubeVideoId(url);
  
  if (!videoId) {
    // If not YouTube, try to show as direct video or link
    if (url?.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
          <video controls style={{ width: '100%', maxHeight: 400 }}>
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    }
    return null;
  }
  
  return (
    <Box sx={{ 
      width: '100%', 
      position: 'relative', 
      paddingBottom: '56.25%', // 16:9 aspect ratio
      borderRadius: 2, 
      overflow: 'hidden',
      bgcolor: 'black'
    }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={title || 'Training Video'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Box>
  );
};

const CATEGORIES = [
  { value: 'TECHNICAL', label: 'Technical', color: '#3b82f6' },
  { value: 'SOFT_SKILL', label: 'Soft Skills', color: '#10b981' },
  { value: 'DOMAIN', label: 'Domain', color: '#f59e0b' },
  { value: 'COMPLIANCE', label: 'Compliance', color: '#ef4444' },
  { value: 'LEADERSHIP', label: 'Leadership', color: '#8b5cf6' },
  { value: 'CERTIFICATION', label: 'Certification', color: '#ec4899' },
  { value: 'ONBOARDING', label: 'Onboarding', color: '#06b6d4' },
];

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Beginner', color: '#10b981' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: '#f59e0b' },
  { value: 'ADVANCED', label: 'Advanced', color: '#ef4444' },
  { value: 'EXPERT', label: 'Expert', color: '#8b5cf6' },
];

const MATERIAL_TYPES = [
  { value: 'VIDEO', label: 'Video', icon: VideoIcon },
  { value: 'DOCUMENT', label: 'Document', icon: DocIcon },
  { value: 'LINK', label: 'Link', icon: LinkIcon },
  { value: 'QUIZ', label: 'Quiz', icon: QuizIcon },
  { value: 'ASSIGNMENT', label: 'Assignment', icon: AssignmentIcon },
];

function TrainingPage() {
  const { showSnackbar } = useUIStore();
  const { user, hasPermission, hasRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [trainings, setTrainings] = useState([]);
  const [myTrainings, setMyTrainings] = useState([]);
  const [myCertificates, setMyCertificates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Dialogs
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [trainingWithModules, setTrainingWithModules] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [isEditingTraining, setIsEditingTraining] = useState(false);

  // Forms
  const [trainingForm, setTrainingForm] = useState({
    title: '', description: '', category: 'TECHNICAL', difficulty: 'BEGINNER',
    durationHours: 1, dueDate: '', attachmentUrl: '', videoUrl: '', externalLink: ''
  });
  const [moduleForm, setModuleForm] = useState({
    title: '', description: '', materialUrl: '', materialType: 'LINK', durationMinutes: 30, orderIndex: 0, isMandatory: true, quizId: null
  });
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [assignForm, setAssignForm] = useState({ employeeIds: [], dueDate: '', remarks: '' });
  
  // Quiz taking state for inline quiz in training
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [currentQuizModule, setCurrentQuizModule] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const canManage = hasPermission('TRAINING_MANAGE');
  const canAssign = hasPermission('TRAINING_ASSIGN');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainingsRes, myRes, certsRes] = await Promise.all([
        trainingApi.getAll(),
        trainingApi.getMyTrainings(),
        certificateApi.getMyCertificates(),
      ]);
      setTrainings(trainingsRes.data?.content || trainingsRes.data || []);
      setMyTrainings(myRes.data || []);
      setMyCertificates(certsRes.data || []);
      
      if (canAssign) {
        const empRes = await employeeApi.getAll({ size: 100 });
        setEmployees(empRes.data?.content || empRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      showSnackbar('Failed to load trainings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Training CRUD
  const handleCreateTraining = () => {
    setSelectedTraining(null);
    setTrainingForm({
      title: '', description: '', category: 'TECHNICAL', difficulty: 'BEGINNER',
      durationHours: 1, dueDate: '', attachmentUrl: '', videoUrl: '', externalLink: ''
    });
    setTrainingDialogOpen(true);
  };

  const handleEditTraining = async (training) => {
    setSelectedTraining(training);
    setTrainingForm({
      title: training.title,
      description: training.description || '',
      category: training.category,
      difficulty: training.difficulty,
      durationHours: training.durationHours || 1,
      dueDate: training.dueDate || '',
      attachmentUrl: training.attachmentUrl || '',
      videoUrl: training.videoUrl || '',
      externalLink: training.externalLink || ''
    });
    setTrainingDialogOpen(true);
  };

  const handleSubmitTraining = async () => {
    if (!trainingForm.title) {
      showSnackbar('Title is required', 'error');
      return;
    }
    try {
      if (selectedTraining) {
        await trainingApi.update(selectedTraining.id, trainingForm);
        showSnackbar('Training updated', 'success');
      } else {
        await trainingApi.create(trainingForm);
        showSnackbar('Training created', 'success');
      }
      fetchData();
      setTrainingDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to save training', 'error');
    }
  };

  // View Training with Modules
  const handleViewTrainingDetails = async (training) => {
    try {
      const res = await trainingApi.getWithModules(training.id);
      setTrainingWithModules(res.data);
      setTrainingForm({
        title: res.data.title,
        description: res.data.description || '',
        category: res.data.category,
        difficulty: res.data.difficulty,
        durationHours: res.data.durationHours || 1,
        dueDate: res.data.dueDate || '',
        attachmentUrl: res.data.attachmentUrl || '',
        videoUrl: res.data.videoUrl || '',
        externalLink: res.data.externalLink || ''
      });
      setIsEditingTraining(false);
      setViewDialogOpen(true);
    } catch (err) {
      showSnackbar('Failed to load training details', 'error');
    }
  };

  const handleSaveTrainingInView = async () => {
    if (!trainingForm.title) {
      showSnackbar('Title is required', 'error');
      return;
    }
    try {
      await trainingApi.update(trainingWithModules.id, trainingForm);
      showSnackbar('Training updated', 'success');
      // Refresh the training view
      const res = await trainingApi.getWithModules(trainingWithModules.id);
      setTrainingWithModules(res.data);
      setIsEditingTraining(false);
      fetchData();
    } catch (err) {
      showSnackbar('Failed to update training', 'error');
    }
  };

  // Modules
  const handleAddModule = async (training) => {
    setSelectedTraining(training || trainingWithModules);
    const nextOrder = trainingWithModules?.modules?.length || training?.totalModules || 0;
    setModuleForm({ title: '', description: '', materialUrl: '', materialType: 'LINK', durationMinutes: 30, orderIndex: nextOrder, isMandatory: true, quizId: null });
    setEditingModule(null);
    setModuleDialogOpen(true);
    
    // Fetch available quizzes for quiz module type
    try {
      const quizRes = await quizApi.getPublished({ size: 100 });
      setAvailableQuizzes(quizRes.data?.content || quizRes.data || []);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || '',
      materialUrl: module.materialUrl || '',
      materialType: module.materialType || 'LINK',
      durationMinutes: module.durationMinutes || 30,
      orderIndex: module.orderIndex,
      quizId: module.quizId || null,
      isMandatory: module.isMandatory !== false
    });
    setModuleDialogOpen(true);
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await trainingApi.deleteModule(moduleId);
      showSnackbar('Module deleted', 'success');
      // Refresh the training view
      if (trainingWithModules) {
        const res = await trainingApi.getWithModules(trainingWithModules.id);
        setTrainingWithModules(res.data);
      }
      fetchData();
    } catch (err) {
      showSnackbar('Failed to delete module', 'error');
    }
  };

  const handleMoveModule = async (module, direction) => {
    if (!trainingWithModules?.modules) return;
    const modules = [...trainingWithModules.modules];
    const currentIndex = modules.findIndex(m => m.id === module.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= modules.length) return;
    
    try {
      // Swap order indices
      const currentModule = modules[currentIndex];
      const swapModule = modules[newIndex];
      
      await trainingApi.updateModule(currentModule.id, { ...currentModule, orderIndex: swapModule.orderIndex });
      await trainingApi.updateModule(swapModule.id, { ...swapModule, orderIndex: currentModule.orderIndex });
      
      // Refresh
      const res = await trainingApi.getWithModules(trainingWithModules.id);
      setTrainingWithModules(res.data);
      showSnackbar('Module reordered', 'success');
    } catch (err) {
      showSnackbar('Failed to reorder module', 'error');
    }
  };

  const handleSubmitModule = async () => {
    if (!moduleForm.title) {
      showSnackbar('Module title is required', 'error');
      return;
    }
    if (moduleForm.materialType === 'QUIZ' && !moduleForm.quizId) {
      showSnackbar('Please select a quiz', 'error');
      return;
    }
    try {
      if (editingModule) {
        await trainingApi.updateModule(editingModule.id, moduleForm);
        showSnackbar('Module updated', 'success');
      } else {
        const trainingId = selectedTraining?.id || trainingWithModules?.id;
        await trainingApi.addModule(trainingId, moduleForm);
        showSnackbar('Module added', 'success');
      }
      
      // Refresh the training view if open
      if (trainingWithModules) {
        const res = await trainingApi.getWithModules(trainingWithModules.id);
        setTrainingWithModules(res.data);
      }
      
      fetchData();
      setModuleDialogOpen(false);
      setEditingModule(null);
    } catch (err) {
      showSnackbar('Failed to save module', 'error');
    }
  };

  // Assignment
  const handleAssign = (training) => {
    setSelectedTraining(training);
    setAssignForm({ employeeIds: [], dueDate: '', remarks: '' });
    setAssignDialogOpen(true);
  };

  const handleSubmitAssign = async () => {
    if (assignForm.employeeIds.length === 0) {
      showSnackbar('Select at least one employee', 'error');
      return;
    }
    try {
      await trainingApi.bulkAssign(selectedTraining.id, assignForm);
      showSnackbar('Training assigned', 'success');
      fetchData();
      setAssignDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to assign training', 'error');
    }
  };

  // View Training Details / Start Training
  const handleViewTraining = async (assignment) => {
    try {
      const res = await trainingApi.getAssignmentDetails(assignment.id);
      setSelectedAssignment(res.data);
      setDetailDialogOpen(true);
    } catch (err) {
      showSnackbar('Failed to load training details', 'error');
    }
  };

  const handleStartModule = async (moduleId) => {
    try {
      await trainingApi.startModule(selectedAssignment.id, moduleId);
      const res = await trainingApi.getAssignmentDetails(selectedAssignment.id);
      setSelectedAssignment(res.data);
      showSnackbar('Module started', 'success');
    } catch (err) {
      showSnackbar('Failed to start module', 'error');
    }
  };

  const handleCompleteModule = async (moduleId) => {
    try {
      await trainingApi.completeModule(selectedAssignment.id, moduleId, {});
      const res = await trainingApi.getAssignmentDetails(selectedAssignment.id);
      setSelectedAssignment(res.data);
      showSnackbar('Module completed! 🎉', 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Failed to complete module', 'error');
    }
  };

  // Quiz handling for inline quiz in training
  const handleStartQuiz = async (module) => {
    if (!module.quizId) {
      showSnackbar('No quiz linked to this module', 'error');
      return;
    }
    
    try {
      setQuizLoading(true);
      setCurrentQuizModule(module);
      setQuizAnswers({});
      setQuizResult(null);
      setCurrentQuestionIndex(0);
      
      // Fetch quiz data with questions
      const quizRes = await quizApi.getById(module.quizId);
      setQuizData(quizRes.data);
      setQuizDialogOpen(true);
      
      // Start the module if not already started
      if (module.progressStatus !== 'IN_PROGRESS' && module.progressStatus !== 'COMPLETED') {
        await handleStartModule(module.id);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
      showSnackbar('Failed to load quiz', 'error');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswerChange = (questionId, optionId, isMultiple) => {
    setQuizAnswers(prev => {
      if (isMultiple) {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(optionId)) {
          return { ...prev, [questionId]: currentAnswers.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, optionId] };
        }
      } else {
        return { ...prev, [questionId]: optionId };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quizData?.questions?.length) return;
    
    // Check if all questions are answered
    const unanswered = quizData.questions.filter(q => !quizAnswers[q.id] || (Array.isArray(quizAnswers[q.id]) && quizAnswers[q.id].length === 0));
    if (unanswered.length > 0) {
      showSnackbar(`Please answer all questions (${unanswered.length} remaining)`, 'warning');
      return;
    }

    try {
      setQuizSubmitting(true);
      
      // Calculate score locally
      let correctCount = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      
      quizData.questions.forEach(question => {
        totalPoints += question.points || 1;
        const userAnswer = quizAnswers[question.id];
        const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        
        let isCorrect = false;
        if (question.type === 'MULTIPLE_CHOICE') {
          const userAnswerArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          isCorrect = correctOptions.length === userAnswerArr.length && 
                     correctOptions.every(id => userAnswerArr.includes(id));
        } else {
          isCorrect = correctOptions.includes(userAnswer);
        }
        
        if (isCorrect) {
          correctCount++;
          earnedPoints += question.points || 1;
        }
      });

      const scorePercent = Math.round((earnedPoints / totalPoints) * 100);
      const passed = scorePercent >= (quizData.passingScore || 70);
      
      setQuizResult({
        score: scorePercent,
        passed,
        correctCount,
        totalQuestions: quizData.questions.length,
        earnedPoints,
        totalPoints,
      });

      // If passed, mark the module as complete
      if (passed && currentQuizModule) {
        await trainingApi.completeModule(selectedAssignment.id, currentQuizModule.id, {
          notes: `Quiz completed with ${scorePercent}% score`
        });
        const res = await trainingApi.getAssignmentDetails(selectedAssignment.id);
        setSelectedAssignment(res.data);
        fetchData();
      }
      
      showSnackbar(passed ? 'Quiz passed! 🎉' : 'Quiz not passed. Try again!', passed ? 'success' : 'warning');
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      showSnackbar('Failed to submit quiz', 'error');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleCloseQuiz = () => {
    setQuizDialogOpen(false);
    setQuizData(null);
    setQuizAnswers({});
    setQuizResult(null);
    setCurrentQuizModule(null);
    setCurrentQuestionIndex(0);
  };

  const handleDownloadCertificate = async (assignmentId) => {
    try {
      await certificateApi.downloadCertificate(assignmentId);
      showSnackbar('Certificate opened! You can print it now.', 'success');
      // Refresh certificates list after download (certificate is generated on first download)
      const certsRes = await certificateApi.getMyCertificates();
      setMyCertificates(certsRes.data || []);
    } catch (err) {
      showSnackbar('Failed to download certificate', 'error');
    }
  };

  const getCategoryConfig = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];
  const getDifficultyConfig = (diff) => DIFFICULTIES.find(d => d.value === diff) || DIFFICULTIES[0];

  const filteredTrainings = trainings.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase())
  );

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
        title="Training Management"
        subtitle="Manage trainings and track progress"
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`All Trainings (${trainings.length})`} icon={<TrainingIcon />} iconPosition="start" />
          <Tab label={`My Trainings (${myTrainings.length})`} icon={<PersonIcon />} iconPosition="start" />
          <Tab label={`My Certificates (${myCertificates.length})`} icon={<CertificateIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* All Trainings Tab */}
      {tabValue === 0 && (
        <>
          {/* Actions Bar */}
          <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search trainings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {canManage && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateTraining}>
                      Create Training
                    </Button>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Training Cards */}
          <Grid container spacing={3}>
            {filteredTrainings.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <TrainingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No trainings found</Typography>
                </Box>
              </Grid>
            ) : (
              filteredTrainings.map((training) => {
                const catConfig = getCategoryConfig(training.category);
                const diffConfig = getDifficultyConfig(training.difficulty);
                return (
                  <Grid item xs={12} md={6} lg={4} key={training.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        borderTop: `4px solid ${catConfig.color}`,
                        '&:hover': { boxShadow: 2 }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Chip label={catConfig.label} size="small" sx={{ bgcolor: `${catConfig.color}15`, color: catConfig.color }} />
                          <Chip label={diffConfig.label} size="small" variant="outlined" sx={{ borderColor: diffConfig.color, color: diffConfig.color }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{training.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                          {training.description?.substring(0, 100) || 'No description'}...
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={`${training.totalModules || 0} modules`} size="small" variant="outlined" />
                          {training.durationHours && <Chip label={`${training.durationHours}h`} size="small" variant="outlined" />}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {training.assignedCount || 0} assigned
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View & Manage">
                              <IconButton size="small" color="primary" onClick={() => handleViewTrainingDetails(training)}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {canAssign && (
                              <Tooltip title="Assign">
                                <IconButton size="small" onClick={() => handleAssign(training)}>
                                  <PersonIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </>
      )}

      {/* My Trainings Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {myTrainings.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <TrainingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No trainings assigned to you</Typography>
              </Box>
            </Grid>
          ) : (
            myTrainings.map((assignment) => {
              const progress = assignment.totalModules > 0 
                ? (assignment.completedModules / assignment.totalModules) * 100 
                : 0;
              const catConfig = getCategoryConfig(assignment.trainingCategory);
              return (
                <Grid item xs={12} md={6} key={assignment.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 2 }
                    }}
                    onClick={() => handleViewTraining(assignment)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Chip label={catConfig.label} size="small" sx={{ bgcolor: `${catConfig.color}15`, color: catConfig.color, mb: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>{assignment.trainingTitle}</Typography>
                        </Box>
                        <Chip
                          label={assignment.status}
                          size="small"
                          color={
                            assignment.status === 'COMPLETED' ? 'success' :
                            assignment.status === 'IN_PROGRESS' ? 'primary' : 'default'
                          }
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">Progress</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {assignment.completedModules}/{assignment.totalModules} modules
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Due: {assignment.dueDate || 'No deadline'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {assignment.status === 'COMPLETED' && (
                            <Button 
                              size="small" 
                              variant="contained"
                              color="success"
                              startIcon={<CertificateIcon />}
                              onClick={(e) => { e.stopPropagation(); handleDownloadCertificate(assignment.id); }}
                            >
                              Certificate
                            </Button>
                          )}
                          {assignment.status !== 'COMPLETED' && (
                            <Button size="small" endIcon={<StartIcon />}>
                              {assignment.status === 'NOT_STARTED' ? 'Start' : 'Continue'}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {/* My Certificates Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          {myCertificates.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CertificateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No certificates earned yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Complete your assigned trainings to earn certificates
                </Typography>
              </Box>
            </Grid>
          ) : (
            myCertificates.map((cert) => {
              const catConfig = getCategoryConfig(cert.trainingCategory);
              return (
                <Grid item xs={12} md={6} lg={4} key={cert.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': { boxShadow: 4 }
                    }}
                  >
                    {/* Certificate Header */}
                    <Box 
                      sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        p: 3,
                        color: 'white',
                        textAlign: 'center'
                      }}
                    >
                      <CertificateIcon sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Certificate of Completion
                      </Typography>
                    </Box>
                    <CardContent sx={{ pt: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                        {cert.trainingTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Chip 
                          label={catConfig.label} 
                          size="small" 
                          sx={{ bgcolor: `${catConfig.color}15`, color: catConfig.color }} 
                        />
                      </Box>
                      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 2 }}>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Certificate No.
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem' }}>
                              {cert.certificateNumber}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Issued Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {cert.issuedDate}
                            </Typography>
                          </Grid>
                        </Grid>
                        {cert.expiryDate && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Valid Until
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {cert.expiryDate}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadCertificate(cert.assignmentId)}
                          sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          Download
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {/* Create/Edit Training Dialog */}
      <Dialog open={trainingDialogOpen} onClose={() => setTrainingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTraining ? 'Edit Training' : 'Create Training'}
          <IconButton onClick={() => setTrainingDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" value={trainingForm.title} onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" value={trainingForm.description} onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })} multiline rows={3} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={trainingForm.category} label="Category" onChange={(e) => setTrainingForm({ ...trainingForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select value={trainingForm.difficulty} label="Difficulty" onChange={(e) => setTrainingForm({ ...trainingForm, difficulty: e.target.value })}>
                  {DIFFICULTIES.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Duration (hours)" type="number" value={trainingForm.durationHours} onChange={(e) => setTrainingForm({ ...trainingForm, durationHours: parseInt(e.target.value) })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Due Date" type="date" value={trainingForm.dueDate} onChange={(e) => setTrainingForm({ ...trainingForm, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setTrainingDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitTraining}>{selectedTraining ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Module Dialog */}
      <Dialog open={moduleDialogOpen} onClose={() => { setModuleDialogOpen(false); setEditingModule(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingModule ? 'Edit Module' : `Add Module to "${selectedTraining?.title || trainingWithModules?.title}"`}
          <IconButton onClick={() => { setModuleDialogOpen(false); setEditingModule(null); }} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField fullWidth label="Module Title" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} required />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Order" type="number" value={moduleForm.orderIndex} onChange={(e) => setModuleForm({ ...moduleForm, orderIndex: parseInt(e.target.value) || 0 })} helperText="Position in sequence" />
              </Grid>
            </Grid>
            <TextField fullWidth label="Description" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} multiline rows={2} />
            <TextField fullWidth label="Material URL" value={moduleForm.materialUrl} onChange={(e) => setModuleForm({ ...moduleForm, materialUrl: e.target.value })} placeholder="https://..." />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Material Type</InputLabel>
                  <Select value={moduleForm.materialType} label="Material Type" onChange={(e) => setModuleForm({ ...moduleForm, materialType: e.target.value, quizId: e.target.value !== 'QUIZ' ? null : moduleForm.quizId })}>
                    {MATERIAL_TYPES.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Duration (minutes)" type="number" value={moduleForm.durationMinutes} onChange={(e) => setModuleForm({ ...moduleForm, durationMinutes: parseInt(e.target.value) })} />
              </Grid>
            </Grid>
            
            {/* Quiz Selector - shown when material type is QUIZ */}
            {moduleForm.materialType === 'QUIZ' && (
              <FormControl fullWidth required>
                <InputLabel>Select Quiz</InputLabel>
                <Select
                  value={moduleForm.quizId || ''}
                  label="Select Quiz"
                  onChange={(e) => {
                    const selectedQuiz = availableQuizzes.find(q => q.id === e.target.value);
                    setModuleForm({ 
                      ...moduleForm, 
                      quizId: e.target.value,
                      title: moduleForm.title || `Quiz: ${selectedQuiz?.title || ''}`,
                      durationMinutes: selectedQuiz?.durationMinutes || moduleForm.durationMinutes
                    });
                  }}
                >
                  {availableQuizzes.length === 0 ? (
                    <MenuItem disabled value="">No published quizzes available</MenuItem>
                  ) : (
                    availableQuizzes.map((quiz) => (
                      <MenuItem key={quiz.id} value={quiz.id}>
                        <Box>
                          <Typography variant="body2">{quiz.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {quiz.category} • {quiz.difficulty} • {quiz.totalQuestions || 0} questions • {quiz.durationMinutes} min
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                {availableQuizzes.length === 0 && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    No published quizzes available. Create and publish a quiz first from the Quizzes page.
                  </Alert>
                )}
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setModuleDialogOpen(false); setEditingModule(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitModule}>{editingModule ? 'Update Module' : 'Add Module'}</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Training Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign "{selectedTraining?.title}"
          <IconButton onClick={() => setAssignDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Employees</InputLabel>
              <Select
                multiple
                value={assignForm.employeeIds}
                label="Employees"
                onChange={(e) => setAssignForm({ ...assignForm, employeeIds: e.target.value })}
                renderValue={(selected) => `${selected.length} employees selected`}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.name} ({emp.email})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="Due Date" type="date" value={assignForm.dueDate} onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth label="Remarks" value={assignForm.remarks} onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitAssign}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* View Training with Modules Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => { setViewDialogOpen(false); setIsEditingTraining(false); }} maxWidth="lg" fullWidth>
        {trainingWithModules && (
          <>
            <DialogTitle sx={{ bgcolor: getCategoryConfig(isEditingTraining ? trainingForm.category : trainingWithModules.category).color, color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pr: 4 }}>
                <Box sx={{ flex: 1 }}>
                  {!isEditingTraining ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>{trainingWithModules.title}</Typography>
                        <Chip 
                          label={getDifficultyConfig(trainingWithModules.difficulty).label} 
                          size="small" 
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                        />
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>{trainingWithModules.description}</Typography>
                    </>
                  ) : (
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Training Details</Typography>
                  )}
                </Box>
                {canManage && !isEditingTraining && (
                  <Tooltip title="Edit Training">
                    <IconButton onClick={() => setIsEditingTraining(true)} sx={{ color: 'white', mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <IconButton onClick={() => { setViewDialogOpen(false); setIsEditingTraining(false); }} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              {/* Edit Training Form */}
              {isEditingTraining && (
                <Card elevation={0} sx={{ mb: 4, p: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 3, bgcolor: 'primary.50' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Training Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth 
                        label="Title" 
                        value={trainingForm.title} 
                        onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })} 
                        required 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth 
                        label="Description" 
                        value={trainingForm.description} 
                        onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })} 
                        multiline 
                        rows={2}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select value={trainingForm.category} label="Category" onChange={(e) => setTrainingForm({ ...trainingForm, category: e.target.value })}>
                          {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Difficulty</InputLabel>
                        <Select value={trainingForm.difficulty} label="Difficulty" onChange={(e) => setTrainingForm({ ...trainingForm, difficulty: e.target.value })}>
                          {DIFFICULTIES.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField 
                        fullWidth 
                        label="Duration (hours)" 
                        type="number" 
                        value={trainingForm.durationHours} 
                        onChange={(e) => setTrainingForm({ ...trainingForm, durationHours: parseInt(e.target.value) })} 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField 
                        fullWidth 
                        label="Due Date" 
                        type="date" 
                        value={trainingForm.dueDate} 
                        onChange={(e) => setTrainingForm({ ...trainingForm, dueDate: e.target.value })} 
                        InputLabelProps={{ shrink: true }} 
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => setIsEditingTraining(false)}>Cancel</Button>
                    <Button size="small" variant="contained" onClick={handleSaveTrainingInView}>Save Changes</Button>
                  </Box>
                </Card>
              )}

              {/* Training Info */}
              {!isEditingTraining && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={6} sm={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{trainingWithModules.totalModules || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Modules</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{trainingWithModules.durationHours || 0}h</Typography>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{trainingWithModules.assignedCount || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Assigned</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>{trainingWithModules.completedCount || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Completed</Typography>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Modules Section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Training Modules ({trainingWithModules.modules?.length || 0})
                </Typography>
                {canManage && (
                  <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleAddModule(null)}>
                    Add Module
                  </Button>
                )}
              </Box>

              {/* Modules List */}
              {trainingWithModules.modules?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <TrainingIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No modules added yet</Typography>
                  {canManage && (
                    <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => handleAddModule(null)}>
                      Add First Module
                    </Button>
                  )}
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell width={60}>#</TableCell>
                        <TableCell>Module</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Material</TableCell>
                        {canManage && <TableCell align="center" width={150}>Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trainingWithModules.modules?.map((module, index) => {
                        const MaterialIcon = MATERIAL_TYPES.find(m => m.value === module.materialType)?.icon || LinkIcon;
                        return (
                          <TableRow key={module.id} hover>
                            <TableCell>
                              <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
                                {module.orderIndex + 1}
                              </Avatar>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{module.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{module.description?.substring(0, 80)}...</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                icon={<MaterialIcon sx={{ fontSize: 16 }} />} 
                                label={MATERIAL_TYPES.find(m => m.value === module.materialType)?.label || module.materialType} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{module.durationMinutes} min</Typography>
                            </TableCell>
                            <TableCell>
                              {module.materialType === 'QUIZ' && module.quizId ? (
                                <Box>
                                  <Chip 
                                    icon={<QuizIcon />} 
                                    label={module.quizTitle || 'Quiz'} 
                                    size="small" 
                                    color="secondary"
                                    variant="outlined"
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {module.quizTotalQuestions || 0} questions • Pass: {module.quizPassingScore}%
                                  </Typography>
                                </Box>
                              ) : module.materialUrl ? (
                                isVideoUrl(module.materialUrl) ? (
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button 
                                      size="small" 
                                      variant="contained"
                                      color="error"
                                      startIcon={<VideoIcon />} 
                                      href={module.materialUrl} 
                                      target="_blank"
                                    >
                                      Watch
                                    </Button>
                                  </Box>
                                ) : (
                                  <Button size="small" startIcon={<LinkIcon />} href={module.materialUrl} target="_blank">
                                    Open
                                  </Button>
                                )
                              ) : (
                                <Typography variant="caption" color="text.secondary">No link</Typography>
                              )}
                            </TableCell>
                            {canManage && (
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <Tooltip title="Move Up">
                                    <IconButton 
                                      size="small" 
                                      disabled={index === 0}
                                      onClick={() => handleMoveModule(module, 'up')}
                                    >
                                      <ArrowUpIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Move Down">
                                    <IconButton 
                                      size="small" 
                                      disabled={index === trainingWithModules.modules.length - 1}
                                      onClick={() => handleMoveModule(module, 'down')}
                                    >
                                      <ArrowDownIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => handleEditModule(module)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error" onClick={() => handleDeleteModule(module.id)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Related Skills */}
              {trainingWithModules.relatedSkills?.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Skills earned after completion:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {trainingWithModules.relatedSkills.map((skill, i) => (
                      <Chip key={i} label={skill.name || skill} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              {canAssign && (
                <Button variant="contained" onClick={() => { setViewDialogOpen(false); handleAssign(trainingWithModules); }}>
                  Assign to Employees
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Training Detail / Roadmap Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box>
            <Typography variant="h6">{selectedAssignment?.trainingTitle}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>{selectedAssignment?.trainingDescription}</Typography>
          </Box>
          <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedAssignment && (
            <>
              {/* Progress Overview */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Your Progress</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAssignment.completedModules}/{selectedAssignment.totalModules} modules completed
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={selectedAssignment.totalModules > 0 ? (selectedAssignment.completedModules / selectedAssignment.totalModules) * 100 : 0}
                  sx={{ height: 12, borderRadius: 6 }}
                />
              </Box>

              {/* Roadmap / Modules */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Training Roadmap</Typography>
              <Stepper orientation="vertical" activeStep={selectedAssignment.completedModules}>
                {selectedAssignment.modules?.map((module, index) => {
                  const isCompleted = module.progressStatus === 'COMPLETED';
                  const isInProgress = module.progressStatus === 'IN_PROGRESS';
                  const MaterialIcon = MATERIAL_TYPES.find(m => m.value === module.materialType)?.icon || LinkIcon;
                  
                  return (
                    <Step key={module.id} completed={isCompleted}>
                      <StepLabel
                        icon={
                          isCompleted ? <CompleteIcon color="success" /> :
                          isInProgress ? <PendingIcon color="primary" /> :
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'grey.300' }}>{index + 1}</Avatar>
                        }
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: isCompleted ? 400 : 600 }}>
                            {module.title}
                          </Typography>
                          {module.isMandatory && <Chip label="Required" size="small" sx={{ fontSize: '0.65rem' }} />}
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {module.description}
                          </Typography>
                          
                          {/* Quiz Module */}
                          {module.materialType === 'QUIZ' && module.quizId ? (
                            <Box sx={{ mb: 2 }}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  p: 2, 
                                  bgcolor: isCompleted ? 'success.50' : 'secondary.50',
                                  borderColor: isCompleted ? 'success.main' : 'secondary.main'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <QuizIcon color={isCompleted ? 'success' : 'secondary'} sx={{ fontSize: 32 }} />
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {module.quizTitle || 'Quiz'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {module.quizTotalQuestions || 0} questions • Pass: {module.quizPassingScore || 70}% • {module.durationMinutes || 10} min
                                    </Typography>
                                  </Box>
                                  {isCompleted ? (
                                    <Chip 
                                      icon={<CompleteIcon />} 
                                      label="Passed" 
                                      color="success" 
                                      size="small"
                                    />
                                  ) : (
                                    <Button 
                                      variant="contained" 
                                      color="secondary"
                                      startIcon={<QuizIcon />}
                                      onClick={() => handleStartQuiz(module)}
                                      disabled={quizLoading}
                                    >
                                      {quizLoading ? 'Loading...' : 'Take Quiz'}
                                    </Button>
                                  )}
                                </Box>
                              </Card>
                            </Box>
                          ) : module.materialUrl && (
                            <Box sx={{ mb: 2 }}>
                              {/* Show embedded video for video URLs */}
                              {isVideoUrl(module.materialUrl) ? (
                                <Box sx={{ mb: 2 }}>
                                  <VideoPlayer url={module.materialUrl} title={module.title} />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <MaterialIcon sx={{ fontSize: 18 }} />
                                    <a href={module.materialUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                                      Open in YouTube
                                    </a>
                                    {module.durationMinutes && (
                                      <Chip label={`${module.durationMinutes} min`} size="small" variant="outlined" sx={{ ml: 1 }} />
                                    )}
                                  </Box>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <MaterialIcon sx={{ fontSize: 18 }} />
                                  <a href={module.materialUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                                    Open Material
                                  </a>
                                  {module.durationMinutes && (
                                    <Chip label={`${module.durationMinutes} min`} size="small" variant="outlined" sx={{ ml: 1 }} />
                                  )}
                                </Box>
                              )}
                            </Box>
                          )}
                          
                          {/* Action buttons for non-quiz modules */}
                          {module.materialType !== 'QUIZ' && !isCompleted && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {!isInProgress && (
                                <Button size="small" variant="outlined" startIcon={<StartIcon />} onClick={() => handleStartModule(module.id)}>
                                  Start
                                </Button>
                              )}
                              {isInProgress && (
                                <Button size="small" variant="contained" color="success" startIcon={<CompleteIcon />} onClick={() => handleCompleteModule(module.id)}>
                                  Mark as Complete
                                </Button>
                              )}
                            </Box>
                          )}
                        </Box>
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>

              {/* Skills to be earned */}
              {selectedAssignment.relatedSkills?.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Skills you'll earn:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedAssignment.relatedSkills.map((skill, i) => (
                      <Chip key={i} label={skill} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Certificate Section - Shows when training is complete */}
              {selectedAssignment.status === 'COMPLETED' && (
                <Card 
                  elevation={0} 
                  sx={{ 
                    mt: 4, 
                    p: 3, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 3,
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <CertificateIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    🎉 Congratulations!
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    You have successfully completed this training. Download your certificate below.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadCertificate(selectedAssignment.id)}
                    sx={{ 
                      bgcolor: 'white', 
                      color: '#764ba2',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                    }}
                  >
                    Download Certificate
                  </Button>
                </Card>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Inline Quiz Dialog */}
      <Dialog 
        open={quizDialogOpen} 
        onClose={handleCloseQuiz} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <QuizIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{quizData?.title || 'Quiz'}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {quizData?.questions?.length || 0} questions • Pass: {quizData?.passingScore || 70}%
                </Typography>
              </Box>
            </Box>
            {!quizResult && quizData?.questions?.length > 0 && (
              <Chip 
                label={`Question ${currentQuestionIndex + 1} of ${quizData.questions.length}`} 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            )}
          </Box>
          <IconButton onClick={handleCloseQuiz} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {quizResult ? (
            // Show Results
            <Box sx={{ textAlign: 'center', py: 6, px: 4 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3,
                  bgcolor: quizResult.passed ? 'success.main' : 'error.main',
                  fontSize: 32
                }}
              >
                {quizResult.passed ? '🎉' : '📝'}
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {quizResult.passed ? 'Congratulations!' : 'Keep Trying!'}
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, color: quizResult.passed ? 'success.main' : 'error.main', mb: 2 }}>
                {quizResult.score}%
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                You got {quizResult.correctCount} out of {quizResult.totalQuestions} questions correct
                ({quizResult.earnedPoints}/{quizResult.totalPoints} points)
              </Typography>
              <Chip 
                icon={quizResult.passed ? <CompleteIcon /> : <PendingIcon />}
                label={quizResult.passed ? 'Module Completed' : `Need ${quizData?.passingScore || 70}% to pass`}
                color={quizResult.passed ? 'success' : 'warning'}
                sx={{ fontSize: '1rem', py: 2, px: 1 }}
              />
              <Box sx={{ mt: 4 }}>
                {quizResult.passed ? (
                  <Button variant="contained" onClick={handleCloseQuiz}>
                    Continue Training
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="outlined" onClick={handleCloseQuiz}>
                      Close
                    </Button>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => {
                        setQuizResult(null);
                        setQuizAnswers({});
                        setCurrentQuestionIndex(0);
                      }}
                    >
                      Try Again
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          ) : quizData?.questions?.length > 0 ? (
            // Show Questions
            <Box sx={{ p: 3 }}>
              {/* Progress */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Progress</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Object.keys(quizAnswers).length}/{quizData.questions.length} answered
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(Object.keys(quizAnswers).length / quizData.questions.length) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Question Navigation Pills */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {quizData.questions.map((q, idx) => (
                  <Chip
                    key={q.id}
                    label={idx + 1}
                    size="small"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    color={quizAnswers[q.id] ? 'primary' : 'default'}
                    variant={currentQuestionIndex === idx ? 'filled' : 'outlined'}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: currentQuestionIndex === idx ? 700 : 400
                    }}
                  />
                ))}
              </Box>

              {/* Current Question */}
              {quizData.questions[currentQuestionIndex] && (
                <Card variant="outlined" sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Question {currentQuestionIndex + 1}
                    </Typography>
                    <Chip 
                      label={`${quizData.questions[currentQuestionIndex].points || 1} points`} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    {quizData.questions[currentQuestionIndex].questionText}
                  </Typography>

                  {/* Options */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {quizData.questions[currentQuestionIndex].options?.map((option, optIdx) => {
                      const question = quizData.questions[currentQuestionIndex];
                      const isMultiple = question.type === 'MULTIPLE_CHOICE';
                      const isSelected = isMultiple 
                        ? (quizAnswers[question.id] || []).includes(option.id)
                        : quizAnswers[question.id] === option.id;

                      return (
                        <Card
                          key={option.id}
                          variant="outlined"
                          onClick={() => handleQuizAnswerChange(question.id, option.id, isMultiple)}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'primary.50' : 'transparent',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            borderWidth: isSelected ? 2 : 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: isSelected ? 'primary.100' : 'grey.50',
                              borderColor: 'primary.main',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                fontSize: 12,
                                bgcolor: isSelected ? 'primary.main' : 'grey.300',
                                color: isSelected ? 'white' : 'text.secondary'
                              }}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </Avatar>
                            <Typography variant="body1">{option.optionText}</Typography>
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>

                  {quizData.questions[currentQuestionIndex].type === 'MULTIPLE_CHOICE' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      * Select all that apply
                    </Typography>
                  )}
                </Card>
              )}

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                >
                  Previous
                </Button>
                {currentQuestionIndex < quizData.questions.length - 1 ? (
                  <Button 
                    variant="contained"
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    variant="contained"
                    color="success"
                    onClick={handleSubmitQuiz}
                    disabled={quizSubmitting}
                  >
                    {quizSubmitting ? 'Submitting...' : 'Submit Quiz'}
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading quiz...</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TrainingPage;
