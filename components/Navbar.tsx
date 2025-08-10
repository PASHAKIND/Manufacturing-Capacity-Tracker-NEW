
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { APP_NAME, USER_ROLES_OPTIONS } from '../constants';
import { Button } from './ui';
import { notificationService } from '../services/notificationService';

// Basic Bell Icon SVG
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);


export const Navbar: React.FC = () => {
  const { currentUser, logout, isLoading, switchRole } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      if (currentUser) {
        const count = notificationService.getUnreadNotifications(currentUser.id).length;
        setUnreadCount(count);
      } else {
        setUnreadCount(0);
      }
    };

    updateUnreadCount(); // Initial check

    // Listen for custom event that signals notification changes
    window.addEventListener('notificationsUpdated', updateUnreadCount);

    return () => {
      window.removeEventListener('notificationsUpdated', updateUnreadCount);
    };
  }, [currentUser]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSwitchRole = async (newRole: UserRole) => {
    if (currentUser && currentUser.role !== newRole) {
      await switchRole(newRole);
      // Navigate to the appropriate dashboard
      if (newRole === UserRole.CLIENT) navigate('/client');
      else if (newRole === UserRole.MANUFACTURER) navigate('/manufacturer');
      else if (newRole === UserRole.ADMIN) navigate('/admin');
      else navigate('/');
    }
  };

  const roleSwitchButtons = USER_ROLES_OPTIONS.map(roleOpt => ({
    label: roleOpt.label.substring(0,1), // "К", "П", "А"
    fullLabel: roleOpt.label,
    role: roleOpt.value as UserRole,
  }));

  return (
    <nav className="bg-black shadow-md">
      <div className="w-full lg:w-3/4 xl:w-1/2 mx-auto px-4 lg:px-0">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              {APP_NAME}
            </Link>
            {/* Role switch buttons moved here */}
            {currentUser && !isLoading && (
              <div className="hidden md:flex items-center space-x-1 ml-4"> {/* Added ml-4 for spacing */}
                <span className="text-xs text-gray-400">Роль:</span>
                {roleSwitchButtons.map(rsb => (
                  <Button
                    key={rsb.role}
                    onClick={() => handleSwitchRole(rsb.role)}
                    variant={currentUser.role === rsb.role ? "secondary" : "outline"}
                    size="sm"
                    className={`text-xs px-1.5 py-0.5 ${currentUser.role === rsb.role ? 'bg-gray-500 text-white cursor-default' : 'text-gray-300 border-gray-500 hover:bg-gray-700'}`}
                    disabled={currentUser.role === rsb.role}
                    title={`Сменить роль на ${rsb.fullLabel}`}
                  >
                    {rsb.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            {isLoading ? (
              <span className="text-white">Загрузка...</span>
            ) : currentUser ? (
              <>
                {/* Role switch buttons were here, now moved to the left */}
                <Link to="/notifications" className="relative text-gray-300 hover:text-white px-1 py-1 rounded-md" title="Уведомления">
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-gray-200 text-black text-xs flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <span className="text-gray-300 text-sm hidden lg:inline">Добро пожаловать, {currentUser.name}</span>
                {currentUser.role === UserRole.CLIENT && (
                  <Link to="/client" className="text-gray-300 hover:text-white px-2 py-1 rounded-md text-sm font-medium hidden sm:inline">Клиент</Link>
                )}
                {currentUser.role === UserRole.MANUFACTURER && (
                  <Link to="/manufacturer" className="text-gray-300 hover:text-white px-2 py-1 rounded-md text-sm font-medium hidden sm:inline">Производство</Link>
                )}
                {currentUser.role === UserRole.ADMIN && (
                  <Link to="/admin" className="text-gray-300 hover:text-white px-2 py-1 rounded-md text-sm font-medium hidden sm:inline">Админ</Link>
                )}
                <Button onClick={handleLogout} variant="outline" size="sm" className="text-white border-gray-400 hover:bg-gray-700">Выйти</Button>
              </>
            ) : (
              <Button onClick={handleLoginClick} variant="secondary" size="sm" className="bg-gray-700 text-white hover:bg-gray-600 border-gray-700">
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};