'use client';

import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

/**
 * Hook tự động đăng ký user với socket từ localStorage
 * Sử dụng trong các component cần kết nối socket
 */
export const useSocketWithAuth = () => {
  const socket = useSocket();

  // Socket context đã tự động xử lý việc lấy user từ localStorage
  // và đăng ký khi kết nối, nên không cần làm gì thêm ở đây

  return socket;
};

/**
 * Hook để lắng nghe các sự kiện socket cụ thể
 */
export const useSocketListener = (
  event: string, 
  callback: (...args: any[]) => void,
  dependencies: any[] = []
) => {
  const { socket, on, off } = useSocket();

  useEffect(() => {
    if (socket) {
      on(event, callback);
      
      // Cleanup listener khi component unmount hoặc dependencies thay đổi
      return () => {
        off(event, callback);
      };
    }
  }, [socket, event, callback, on, off, ...dependencies]);
};

/**
 * Hook để emit socket events một cách an toàn
 */
export const useSocketEmit = () => {
  const { emit, isConnected } = useSocket();

  const safeEmit = (event: string, data?: any) => {
    if (isConnected) {
      emit(event, data);
      return true;
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
      return false;
    }
  };

  return { emit: safeEmit, isConnected };
};
