
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/apiService';
import { cacheService } from '../services/cacheService';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (role: UserRole, name?: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Attempt to load user from localStorage or session storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole, name: string = 'Anonymous') => {
    setIsLoading(true);
    // In a real app, this would call an API endpoint.
    // For this mock, we'll create a user object based on role.
    const mockId = `user-${Date.now()}`;
    let userName = name;
    if (role === UserRole.MANUFACTURER) userName = `${name} Manufacturing`;
    if (role === UserRole.ADMIN) userName = `Admin ${name}`;

    const user: User = { id: mockId, name: userName, role };
    
    // If manufacturer, ensure a facility exists or create one
    if (role === UserRole.MANUFACTURER) {
      await apiService.ensureManufacturerFacility(user.id, user.name);
    }
    
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    cacheService.clearAll(); // Clear cache on logout
    // Potentially redirect to login page via useNavigate hook if used in a component
  };

  const switchRole = async (newRole: UserRole) => {
    if (!currentUser) {
      console.error("Cannot switch role: no current user.");
      return;
    }
    // Prevent switching to the same role
    if (currentUser.role === newRole) {
        return;
    }
      
    setIsLoading(true);
    
    // Clear the cache to ensure the new dashboard fetches fresh data
    cacheService.clearAll();

    const updatedUser: User = { ...currentUser, role: newRole };

    if (newRole === UserRole.MANUFACTURER) {
      // Ensure facility exists for the new role if it's Manufacturer
      // This uses the existing user's ID and name, which might need adjustment
      // if the name format is strictly tied to role (e.g., "X Manufacturing")
      // For simplicity, we'll keep the original name but ensure facility.
      await apiService.ensureManufacturerFacility(updatedUser.id, updatedUser.name.replace(/^Admin | Manufacturing$/, ''));
    }
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setIsLoading(false);
  };

  const value = { currentUser, isLoading, login, logout, switchRole };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
