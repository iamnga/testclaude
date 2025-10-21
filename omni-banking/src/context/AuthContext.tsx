import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; requirePasswordChange?: boolean; error?: string }>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Kiểm tra localStorage xem có user đã đăng nhập chưa
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (username: string, password: string) => {
    // Tìm user trong mock data
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (!foundUser) {
      return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    }

    // Kiểm tra xem có phải lần đăng nhập đầu tiên không
    if (foundUser.isFirstLogin) {
      // Lưu tạm user vào state nhưng chưa lưu vào localStorage
      setUser(foundUser);
      return { success: true, requirePasswordChange: true };
    }

    // Đăng nhập thành công
    setUser(foundUser);
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    return { success: true, requirePasswordChange: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const changePassword = async (newPassword: string) => {
    if (!user) return false;

    // Cập nhật mật khẩu và đánh dấu không còn là lần đăng nhập đầu
    const updatedUser = {
      ...user,
      password: newPassword,
      isFirstLogin: false
    };

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Cập nhật trong mockUsers (chỉ trong session hiện tại)
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser;
    }

    return true;
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, updateUser }}>
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
