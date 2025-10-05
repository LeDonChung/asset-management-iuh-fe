'use client';

import { useEffect, useState } from 'react';
import { useSocketWithAuth, useSocketListener, useSocketEmit } from '@/hooks/useSocketWithAuth';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectedDevice {
  deviceId: string;
  socketId: string;
  type: string;
  connectedAt: string;
  userId?: string;
  online: boolean;
}

interface ConnectedUser {
  userId: string;
  socketId: string;
  connectedAt: string;
  deviceId: string;
  userInfo?: {
    username?: string;
    email?: string;
    role?: string;
  };
  online: boolean;
}

export default function SocketMonitor() {
  const { isAuthenticated, user: authUser } = useAuth();
  const socket = useSocketWithAuth();
  const { emit, isConnected } = useSocketEmit();
  
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [users, setUsers] = useState<ConnectedUser[]>([]);
  const [testMessage, setTestMessage] = useState('');

  // Lắng nghe test messages
  useSocketListener('test_message', (data) => {
    console.log('Received test message:', data);
    alert(`Test message received: ${data.message}`);
  });

  // Fetch connected devices và users
  const fetchConnections = async () => {
    try {
      const [devicesRes, usersRes] = await Promise.all([
        fetch('/api/devices').then(res => res.json()),
        fetch('/api/users').then(res => res.json())
      ]);

      if (devicesRes.success) {
        setDevices(devicesRes.devices);
      }
      if (usersRes.success) {
        setUsers(usersRes.users);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  // Gửi test message
  const sendTestMessage = () => {
    if (testMessage.trim()) {
      emit('test_broadcast', {
        message: testMessage,
        from: authUser?.username || 'Unknown',
        timestamp: new Date()
      });
      setTestMessage('');
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchConnections();
      // Refresh mỗi 5 giây
      const interval = setInterval(fetchConnections, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Vui lòng đăng nhập để sử dụng Socket Monitor</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Socket Status */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Socket Connection Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Status: </span>
            <span className={`px-2 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div>
            <span className="font-medium">Socket ID: </span>
            <span className="text-sm text-gray-600">{socket.socket?.id || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium">User ID: </span>
            <span className="text-sm text-gray-600">{socket.user?.id || 'Not registered'}</span>
          </div>
          <div>
            <span className="font-medium">Username: </span>
            <span className="text-sm text-gray-600">{socket.user?.username || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Test Message */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Send Test Message</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          />
          <button
            onClick={sendTestMessage}
            disabled={!isConnected || !testMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>

      {/* Connected Users */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Connected Users ({users.length})</h3>
        {users.length === 0 ? (
          <p className="text-gray-500">No users connected</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connected At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.userId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.userInfo?.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.socketId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.connectedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connected IoT Devices */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Connected IoT Devices ({devices.length})</h3>
        {devices.length === 0 ? (
          <p className="text-gray-500">No IoT devices connected</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connected At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.deviceId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {device.deviceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        device.type === 'camera' ? 'bg-blue-100 text-blue-800' :
                        device.type === 'rfid' ? 'bg-green-100 text-green-800' :
                        device.type === 'arduino' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {device.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.socketId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(device.connectedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={fetchConnections}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Refresh
          </button>
          <button
            onClick={() => socket.disconnect()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
