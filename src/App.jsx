import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import TimerPage from './pages/TimerPage';
import TasksPage from './pages/TasksPage';
import VillagePage from './pages/VillagePage';
import AIPage from './pages/AIPage';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';

import { useAuth } from './context/AuthContext';

import LoginRequiredOverlay from './components/LoginRequiredOverlay';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  // We render children anyway to show the "background" UI (empty state)
  // and overlay the login prompt on top.

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      {children}
      {!user && <LoginRequiredOverlay />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<TimerPage />} />
          <Route path="tasks" element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          } />
          <Route path="village" element={
            <ProtectedRoute>
              <VillagePage />
            </ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="ai" element={
            <ProtectedRoute>
              <AIPage />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
