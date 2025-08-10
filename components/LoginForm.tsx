

import React, { useState, useEffect } 
from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { USER_ROLES_OPTIONS } from '../constants';
import { Button, Select, Input, Card } from './ui';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 65.6l-58.3 58.3C338.5 105.3 294.8 88 248 88c-88.3 0-160 71.7-160 160s71.7 160 160 160c92.6 0 151.8-63.4 157.9-122.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
);

export const LoginForm: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CLIENT);
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 

  const infoMessage = (location.state as any)?.infoMessage;

  useEffect(() => {
    const previousState = location.state as any;
    if (previousState?.intendedRole) {
      setSelectedRole(previousState.intendedRole as UserRole);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Имя обязательно для заполнения.');
      return;
    }
    try {
      await login(selectedRole, name.trim());
      
      const previousState = location.state as any; 
      let redirectPath = '/';
      let redirectState: any = {};

      if (previousState?.intendedAction === 'search' || previousState?.intendedAction === 'delegate_search') {
        redirectState = {
          intendedAction: previousState.intendedAction,
          query: previousState.query,
          productCategory: previousState.productCategory,
          latitude: previousState.latitude,
          longitude: previousState.longitude,
          minLoad: previousState.minLoad,
          maxLoad: previousState.maxLoad,
          certifications: previousState.certifications,
        };
      }
      
      // Determine redirect path based on role AFTER successful login
      if (selectedRole === UserRole.CLIENT) {
        redirectPath = '/client';
      } else if (selectedRole === UserRole.MANUFACTURER) {
        redirectPath = '/manufacturer';
      } else if (selectedRole === UserRole.ADMIN) {
        redirectPath = '/admin';
      }
      
      navigate(redirectPath, { state: redirectState, replace: true });

    } catch (err) {
      setError('Ошибка входа. Пожалуйста, попробуйте еще раз.');
      console.error(err);
    }
  };

  // Translate role for button text
  const roleTranslations: Record<UserRole, string> = {
    [UserRole.CLIENT]: "Клиент",
    [UserRole.MANUFACTURER]: "Производитель",
    [UserRole.ADMIN]: "Администратор"
  };

  return (
    <Card className="max-w-md w-full" title="Вход / Выбор роли">
        <div className="space-y-6">
            {infoMessage && <p className="text-center text-sm text-gray-600 bg-gray-100 p-3 rounded-md">{infoMessage}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Ваше имя"
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите ваше имя"
                  required
                />
                <Select
                  label="Выберите роль"
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  options={USER_ROLES_OPTIONS}
                />
                {error && <p className="text-sm text-gray-700">{error}</p>}
                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  {isLoading ? 'Вход...' : `Войти как ${roleTranslations[selectedRole]}`}
                </Button>
            </form>
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">или</span>
                </div>
            </div>
             <div>
                <Button variant="outline" className="w-full flex justify-center items-center" onClick={() => alert('Вход через Google в разработке.')}>
                   <GoogleIcon/>
                    Войти через Google
                </Button>
            </div>
        </div>
    </Card>
  );
};