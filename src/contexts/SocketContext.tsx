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
  isReconnecting: boolean;
  connectionAttempts: number;
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
  serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://socket.codeshare.id.vn'
}) => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Production-specific configurations
  const isProduction = process.env.NODE_ENV === 'production';
  const socketConfig = {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: isProduction ? 3000 : 2000, // Longer delay in production
    reconnectionDelayMax: isProduction ? 15000 : 10000,
    reconnectionAttempts: isProduction ? 3 : 5, // Fewer attempts in production
    timeout: isProduction ? 30000 : 20000, // Longer timeout in production
    transports: ['websocket', 'polling'],
    forceNew: false,
    upgrade: true,
    rememberUpgrade: true,
  };

  useEffect(() => {
    // Tránh tạo multiple connections
    if (socket) {
      console.log('Socket already exists, skipping connection');
      return;
    }

    console.log('Initializing socket connection to:', serverUrl);
    console.log('Environment:', isProduction ? 'production' : 'development');
    
    // Khởi tạo socket connection với config phù hợp
    const socketInstance = io(serverUrl, socketConfig);

    // Event listeners cho v2.x
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionAttempts(0);
      
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

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setIsConnected(false);
      
      // Chỉ set reconnecting nếu disconnect không phải do client
      if (reason !== 'io client disconnect') {
        setIsReconnecting(true);
      }
    });

    socketInstance.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
      
      // Nếu quá nhiều lần thử, ngừng reconnect
      if (connectionAttempts >= 3) {
        console.log('Too many connection attempts, stopping reconnection');
        socketInstance.disconnect();
        setIsReconnecting(false);
      }
    });

    socketInstance.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionAttempts(0);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('Reconnection attempt:', attemptNumber);
      setIsReconnecting(true);
    });

    socketInstance.on('reconnect_failed', () => {
      console.log('Reconnection failed');
      setIsReconnecting(false);
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
      console.log('Cleaning up socket connection');
      if (socketInstance) {
        // Remove specific listeners
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        socketInstance.off('reconnect');
        socketInstance.off('reconnect_attempt');
        socketInstance.off('reconnect_failed');
        socketInstance.off('user_registered');
        socketInstance.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
      setIsReconnecting(false);
    };
  }, []); // Chỉ chạy một lần khi component mount

  // Effect để lắng nghe thay đổi localStorage với debounce
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const handleStorageChange = () => {
      // Debounce để tránh gọi quá nhiều lần
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const userFromStorage = getUserFromLocalStorage();
        console.log('Storage changed, user:', userFromStorage);
        
        if (userFromStorage && socket && isConnected) {
          // Chỉ emit nếu user thực sự thay đổi
          if (!user || user.id !== userFromStorage.id) {
            setUser(userFromStorage);
            socket.emit('register_user', {
              userId: userFromStorage.id,
              username: userFromStorage.username,
              email: userFromStorage.email,
              role: userFromStorage.role
            });
          }
        } else if (!userFromStorage && user) {
          setUser(null);
        }
      }, 500); // Debounce 500ms
    };

    // Lắng nghe custom event từ auth slice
    window.addEventListener('auth-storage-change', handleStorageChange);
    
    // Lắng nghe storage event từ localStorage
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('auth-storage-change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [socket, isConnected, user]); // Thêm user vào dependencies

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
    isReconnecting,
    connectionAttempts,
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
