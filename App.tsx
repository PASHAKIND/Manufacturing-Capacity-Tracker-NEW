import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { ManufacturerDashboardPage } from './pages/ManufacturerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';
import { Spinner } from './components/ui';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { FacilityDetailPage } from './pages/FacilityDetailPage'; // Added
import { GuestInquiryPage } from './pages/GuestInquiryPage';
import { APP_NAME } from './constants';
import { TurnkeyProjectDetailPage } from './pages/TurnkeyProjectDetailPage';

const App: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  // const location = useLocation(); // Not used here directly

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" key={currentUser?.role ?? 'guest'}>
      <Navbar />
      <main className="flex-grow py-8 w-full lg:w-3/4 xl:w-1/2 mx-auto px-4 lg:px-0">
        <Routes>
          <Route
            path="/login"
            element={
              currentUser
                ? <Navigate to={
                    currentUser.role === UserRole.CLIENT ? "/client" :
                    currentUser.role === UserRole.MANUFACTURER ? "/manufacturer" :
                    currentUser.role === UserRole.ADMIN ? "/admin" : "/"
                  } replace />
                : <LoginPage />
            }
          />

          <Route path="/guest-inquiry" element={<GuestInquiryPage />} />

          <Route element={<ProtectedRoute allowedRoles={[UserRole.CLIENT, UserRole.MANUFACTURER, UserRole.ADMIN]} />}>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/facility/:facilityId" element={<FacilityDetailPage />} /> {/* Added */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[UserRole.CLIENT]} />}>
            <Route path="/client" element={<ClientDashboardPage />} />
            <Route path="/project/:projectId" element={<TurnkeyProjectDetailPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[UserRole.MANUFACTURER]} />}>
            <Route path="/manufacturer" element={<ManufacturerDashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

           <Route
            path="/"
            element={
              currentUser ? (
                currentUser.role === UserRole.CLIENT ? <Navigate to="/client" replace /> :
                currentUser.role === UserRole.MANUFACTURER ? <Navigate to="/manufacturer" replace /> :
                currentUser.role === UserRole.ADMIN ? <Navigate to="/admin" replace /> :
                <HomePage />
              ) : (
                <HomePage />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-black text-gray-300 text-center p-4 text-sm">
        &copy; {new Date().getFullYear()} {APP_NAME}. Все права защищены.
      </footer>
    </div>
  );
};

export default App;
