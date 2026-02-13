import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import MainLayout from '@layouts/MainLayout';
import AuthLayout from '@layouts/AuthLayout';
import ProtectedRoute from '@components/auth/ProtectedRoute';

// Pages
import LoginPage from '@pages/auth/LoginPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import EmployeesPage from '@pages/employees/EmployeesPage';
import EmployeeDetailPage from '@pages/employees/EmployeeDetailPage';
import ProjectsPage from '@pages/projects/ProjectsPage';
import ProjectDetailPage from '@pages/projects/ProjectDetailPage';
import SkillsPage from '@pages/skills/SkillsPage';
import AllocationsPage from '@pages/allocations/AllocationsPage';
import ReportsPage from '@pages/reports/ReportsPage';
import SettingsPage from '@pages/settings/SettingsPage';
import ProfilePage from '@pages/profile/ProfilePage';
import NotFoundPage from '@pages/NotFoundPage';
import { TrainingPage } from '@pages/training';
import { ForecastingPage } from '@pages/forecasting';
import { UserManagementPage } from '@pages/users';
import { QuizPage } from '@pages/quiz';
import SkillGapPage from '@pages/skill-gap';
import { ZohoIntegrationPage } from '@pages/integrations';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/allocations" element={<AllocationsPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/quizzes" element={<QuizPage />} />
          <Route path="/forecasting" element={<ForecastingPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/integrations/zoho" element={<ZohoIntegrationPage />} />
          <Route path="/integrations/zoho/callback" element={<ZohoIntegrationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

