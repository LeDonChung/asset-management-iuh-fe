'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io from 'socket.io-client';

interface User {
  id: string;
  username?: string;
  email?: string;
  role?: string;
}

interface SocketContextType {
  socket: ReturnType<typeof io> | null;
  isConnected: boolean;
  user: User | null;
  registerUser: (userData: User) => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

// Helper function để lấy user từ localStorage
const getUserFromLocalStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      return {
        id: parsedUser.id,
        username: parsedUser.username,
        email: parsedUser.email,
        role: parsedUser.roles?.[0] || parsedUser.role || ''
      };
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }
  return null;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children, 
  serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001' 
}) => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('Initializing socket connection to:', serverUrl);
    
    // Khởi tạo socket connection cho v2.x
    const socketInstance = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    // Event listeners cho v2.x
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Lấy user từ localStorage khi kết nối thành công
      const userFromStorage = getUserFromLocalStorage();
      if (userFromStorage) {
        console.log('Auto-registering user from localStorage:', userFromStorage);
        setUser(userFromStorage);
        socketInstance.emit('register_user', {
          userId: userFromStorage.id,
          username: userFromStorage.username,
          email: userFromStorage.email,
          role: userFromStorage.role
        });
      } else {
        console.log('No user found in localStorage');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    // Listen for user registration acknowledgment
    socketInstance.on('user_registered', (response) => {
      console.log('User registration response:', response);
      if (response.success) {
        console.log('✅ User registration confirmed by server');
      } else {
        console.error('❌ User registration failed:', response.message);
      }
    });

    setSocket(socketInstance);

    // Cleanup function
    return () => {
      socketInstance.disconnect();
    };
  }, [serverUrl]);

  // Effect để lắng nghe thay đổi localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const userFromStorage = getUserFromLocalStorage();
      console.log('Storage changed, user:', userFromStorage);
      
      if (userFromStorage && socket && isConnected) {
        setUser(userFromStorage);
        socket.emit('register_user', {
          userId: userFromStorage.id,
          username: userFromStorage.username,
          email: userFromStorage.email,
          role: userFromStorage.role
        });
      } else if (!userFromStorage) {
        setUser(null);
      }
    };

    // Lắng nghe custom event từ auth slice
    window.addEventListener('auth-storage-change', handleStorageChange);
    
    // Lắng nghe storage event từ localStorage
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('auth-storage-change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [socket, isConnected]);

  // Đăng ký user
  const registerUser = (userData: User) => {
    console.log('Registering user:', userData);
    setUser(userData);
    
    if (socket && isConnected) {
      console.log('Emitting register_user event:', {
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      });
      
      socket.emit('register_user', {
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      });
      
      console.log('User registered successfully:', userData);
    } else {
      console.log('Socket not connected, user will be registered when connected. Connected:', isConnected, 'Socket:', !!socket);
    }
  };

  // Ngắt kết nối
  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setUser(null);
    }
  };

  // Emit event
  const emit = (event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  // Listen to events
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Remove event listeners
  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    user,
    registerUser,
    disconnect,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook để sử dụng Socket Context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
