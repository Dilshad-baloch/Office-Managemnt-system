import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Layout from './components/Layout';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveManagement from './pages/LeaveManagement';
import SalaryManagement from './pages/SalaryManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import DocumentManagement from './pages/DocumentManagement';
import TaskManagement from './pages/TaskManagement';
import Profile from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="dashboard" 
          element={
            user?.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />
          } 
        />
        <Route path="profile" element={<Profile />} />
        
        {/* Admin only routes */}
        <Route 
          path="employees" 
          element={
            <ProtectedRoute adminOnly>
              <EmployeeManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="departments" 
          element={
            <ProtectedRoute adminOnly>
              <DepartmentManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="salary" 
          element={
            <ProtectedRoute adminOnly>
              <SalaryManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Common routes */}
        <Route path="attendance" element={<AttendanceManagement />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="tasks" element={<TaskManagement />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen gradient-bg transition-colors duration-300">
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              toastClassName="dark:bg-gray-800 dark:text-white"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;