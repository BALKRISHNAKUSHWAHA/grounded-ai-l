import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectWorkspace from './pages/ProjectWorkspace';
import SourcesManager from './pages/SourcesManager';
import ResearchChat from './pages/ResearchChat';
import LiteratureSynthesis from './pages/LiteratureSynthesis';
import ReportExport from './pages/ReportExport';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/sources"
              element={
                <ProtectedRoute>
                  <SourcesManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/chat"
              element={
                <ProtectedRoute>
                  <ResearchChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/synthesize"
              element={
                <ProtectedRoute>
                  <LiteratureSynthesis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/export"
              element={
                <ProtectedRoute>
                  <ReportExport />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
