import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Collapse,
  Avatar,
  Button,
  Badge,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  School as TrainingIcon,
  Psychology as SkillIcon,
  Groups as TeamIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  TrendingDown as GapIcon,
  Lightbulb as RecommendIcon,
  GridOn as HeatmapIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { PageHeader } from '@components/common';
import { skillGapApi } from '@api/skillGapApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#10b981',
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: '24px' }}>
      {value === index && children}
    </div>
  );
}

function SkillGapPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [summary, setSummary] = useState(null);
  const [projectGaps, setProjectGaps] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [summaryRes, gapsRes, heatmapRes, recsRes] = await Promise.all([
        skillGapApi.getSummary(),
        skillGapApi.getAllProjectGaps(),
        skillGapApi.getHeatmap(),
        skillGapApi.getRecommendations(),
      ]);
      
      setSummary(summaryRes.data);
      setProjectGaps(gapsRes.data);
      setHeatmapData(heatmapRes.data);
      setRecommendations(recsRes.data);
    } catch (err) {
      console.error('Failed to fetch skill gap data:', err);
      setError('Failed to load skill gap analysis');
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const getSeverityColor = (severity) => SEVERITY_COLORS[severity] || '#6b7280';

  if (loading) {
    return (
      <Box>
        <PageHeader title="Skill Gap Analysis" subtitle="AI-powered skill gap detection and training recommendations" />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Skill Gap Analysis" />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="AI-powered skill gap detection and training recommendations"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Skill Gap Analysis' },
        ]}
      />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {summary?.totalProjects || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Total Projects</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {summary?.projectsWithGaps || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Projects with Gaps</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {summary?.criticalGaps || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Critical Gaps</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {summary?.highGaps || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>High Gaps</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {summary?.averageGapScore?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Avg Gap Score</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {recommendations?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Recommendations</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab icon={<GapIcon />} iconPosition="start" label="Project Gaps" />
          <Tab icon={<HeatmapIcon />} iconPosition="start" label="Skill Heatmap" />
          <Tab icon={<RecommendIcon />} iconPosition="start" label="Training Recommendations" />
        </Tabs>
      </Box>

      {/* Tab 1: Project Gaps */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Gap Distribution Chart */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Gap Severity Distribution
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical', value: summary?.criticalGaps || 0, color: '#ef4444' },
                          { name: 'High', value: summary?.highGaps || 0, color: '#f59e0b' },
                          { name: 'Medium', value: summary?.mediumGaps || 0, color: '#3b82f6' },
                          { name: 'Low', value: summary?.lowGaps || 0, color: '#10b981' },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'Critical', value: summary?.criticalGaps || 0, color: '#ef4444' },
                          { name: 'High', value: summary?.highGaps || 0, color: '#f59e0b' },
                          { name: 'Medium', value: summary?.mediumGaps || 0, color: '#3b82f6' },
                          { name: 'Low', value: summary?.lowGaps || 0, color: '#10b981' },
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Skill Gaps */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  <AssessmentIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                  Top Skill Demand vs Supply
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary?.topSkillGaps || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" />
                      <YAxis dataKey="skillName" type="category" width={100} tick={{ fontSize: 11 }} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="demand" name="Demand" fill="#ef4444" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="supply" name="Supply" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Gap List */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  <TeamIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'info.main' }} />
                  Project Skill Gap Analysis
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell width={50}></TableCell>
                        <TableCell>Project</TableCell>
                        <TableCell align="center">Team Size</TableCell>
                        <TableCell align="center">Required Skills</TableCell>
                        <TableCell align="center">Covered</TableCell>
                        <TableCell align="center">Missing</TableCell>
                        <TableCell align="center">Gap Score</TableCell>
                        <TableCell align="center">Severity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projectGaps.map((project) => (
                        <>
                          <TableRow key={project.projectId} hover sx={{ cursor: 'pointer' }} onClick={() => toggleProjectExpand(project.projectId)}>
                            <TableCell>
                              <IconButton size="small">
                                {expandedProjects[project.projectId] ? <CollapseIcon /> : <ExpandIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{project.projectName}</Typography>
                              <Typography variant="caption" color="text.secondary">{project.clientName}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={project.teamSize} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="center">{project.requiredSkillsCount}</TableCell>
                            <TableCell align="center">
                              <Typography color="success.main" fontWeight={600}>{project.coveredSkillsCount}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography color="error.main" fontWeight={600}>{project.missingSkillsCount}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={100 - project.gapScore}
                                  sx={{ 
                                    width: 60, 
                                    height: 8, 
                                    borderRadius: 1,
                                    bgcolor: 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: getSeverityColor(project.gapSeverity),
                                    }
                                  }}
                                />
                                <Typography variant="caption">{project.gapScore}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={project.gapSeverity}
                                size="small"
                                sx={{ 
                                  bgcolor: `${getSeverityColor(project.gapSeverity)}20`,
                                  color: getSeverityColor(project.gapSeverity),
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={8} sx={{ p: 0, borderBottom: expandedProjects[project.projectId] ? 1 : 0 }}>
                              <Collapse in={expandedProjects[project.projectId]}>
                                <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Typography variant="subtitle2" gutterBottom>Skill Gap Details:</Typography>
                                  <Grid container spacing={1}>
                                    {project.skillGaps?.map((gap, idx) => (
                                      <Grid item xs={12} sm={6} md={4} key={idx}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 1, 
                                          p: 1, 
                                          bgcolor: 'white',
                                          borderRadius: 1,
                                          border: '1px solid',
                                          borderColor: 'divider',
                                        }}>
                                          {gap.gapStatus === 'COVERED' ? (
                                            <CheckIcon sx={{ color: 'success.main', fontSize: 18 }} />
                                          ) : gap.gapStatus === 'PARTIAL' ? (
                                            <WarningIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                                          ) : (
                                            <CancelIcon sx={{ color: 'error.main', fontSize: 18 }} />
                                          )}
                                          <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight={500}>{gap.skillName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{gap.category}</Typography>
                                          </Box>
                                          <Chip 
                                            label={gap.gapStatus} 
                                            size="small" 
                                            color={gap.gapStatus === 'COVERED' ? 'success' : gap.gapStatus === 'PARTIAL' ? 'warning' : 'error'}
                                            variant="outlined"
                                          />
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                  {project.teamMembers?.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom>Team Members:</Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {project.teamMembers.map((member, idx) => (
                                          <Chip key={idx} label={member} size="small" variant="outlined" />
                                        ))}
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Skill Heatmap */}
      <TabPanel value={activeTab} index={1}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              <HeatmapIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
              Skill Distribution Heatmap (Departments x Skills)
            </Typography>
            {heatmapData && heatmapData.departments?.length > 0 ? (
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100', minWidth: 120 }}>Department</TableCell>
                      {heatmapData.skills?.map((skill, idx) => (
                        <TableCell 
                          key={idx} 
                          align="center" 
                          sx={{ 
                            fontWeight: 500, 
                            bgcolor: 'grey.100',
                            minWidth: 80,
                            fontSize: '0.7rem',
                            p: 1,
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            height: 100,
                          }}
                        >
                          {skill}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {heatmapData.departments?.map((dept, deptIdx) => (
                      <TableRow key={deptIdx} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{dept}</TableCell>
                        {heatmapData.matrix?.[deptIdx]?.map((count, skillIdx) => {
                          const intensity = Math.min(count / 5, 1);
                          const bgColor = count > 0 
                            ? `rgba(59, 130, 246, ${0.1 + intensity * 0.7})`
                            : 'transparent';
                          return (
                            <TableCell 
                              key={skillIdx} 
                              align="center"
                              sx={{ 
                                bgcolor: bgColor,
                                fontWeight: count > 0 ? 600 : 400,
                                color: intensity > 0.5 ? 'white' : 'text.primary',
                              }}
                            >
                              {count > 0 ? count : '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No heatmap data available</Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Training Recommendations */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {recommendations.length > 0 ? (
            recommendations.slice(0, 20).map((rec, idx) => (
              <Grid item xs={12} md={6} lg={4} key={idx}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                        {rec.employeeName?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>{rec.employeeName}</Typography>
                        <Typography variant="caption" color="text.secondary">{rec.department}</Typography>
                      </Box>
                      <Chip 
                        label={`P${rec.priority}`}
                        size="small"
                        color={rec.priority >= 4 ? 'error' : rec.priority >= 3 ? 'warning' : 'default'}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'warning.lighter', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <SkillIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="body2" fontWeight={600} color="warning.dark">
                          Missing Skill: {rec.skillName}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {rec.reason}
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      <TrainingIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      Suggested Trainings:
                    </Typography>
                    {rec.suggestedTrainings?.map((training, tIdx) => (
                      <Box 
                        key={tIdx}
                        sx={{ 
                          p: 1, 
                          mb: 1, 
                          bgcolor: 'grey.50', 
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'grey.100' }
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>{training.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={training.difficulty} size="small" variant="outlined" />
                          <Chip label={`${training.durationHours}h`} size="small" variant="outlined" />
                          <Chip 
                            label={`${training.relevanceScore?.toFixed(0)}% match`} 
                            size="small" 
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info" icon={<CheckIcon />}>
                No training recommendations at this time. All project skill requirements are covered!
              </Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>
    </Box>
  );
}

export default SkillGapPage;



