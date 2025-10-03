import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserWithPassword, AuthContextType, UserRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_USERS: UserWithPassword[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Администратор' },
  { id: '2', username: 'user', password: 'user123', role: 'user', name: 'Пользователь' }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<UserWithPassword[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('allUsers');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedUsers) {
      setAllUsers(JSON.parse(savedUsers));
    } else {
      setAllUsers(INITIAL_USERS);
      localStorage.setItem('allUsers', JSON.stringify(INITIAL_USERS));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = allUsers.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name
      };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const addUser = (username: string, password: string, name: string, role: UserRole): boolean => {
    if (allUsers.some(u => u.username === username)) {
      return false;
    }

    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      username,
      password,
      name,
      role
    };

    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    return true;
  };

  const deleteUser = (userId: string): boolean => {
    if (userId === '1') {
      return false;
    }

    const updatedUsers = allUsers.filter(u => u.id !== userId);
    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    
    if (user?.id === userId) {
      logout();
    }
    
    return true;
  };

  const usersWithoutPasswords: User[] = allUsers.map(({ password, ...user }) => user);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        users: usersWithoutPasswords,
        addUser,
        deleteUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}