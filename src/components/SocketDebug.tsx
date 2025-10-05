'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export default function SocketDebug() {
  const { socket, isConnected, user, registerUser } = useSocket();
  const [testUserId, setTestUserId] = useState('user-123');
  const [testUsername, setTestUsername] = useState('test-user');

  const handleRegisterTest = () => {
    registerUser({
      id: testUserId,
      username: testUsername,
      email: 'test@example.com',
      role: 'admin'
    });
  };

  const handleFetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();
      console.log('Connected users:', data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Socket Debug Panel</h3>
      
      <div className="space-y-4">
        <div>
          <strong>Socket Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded ${isConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div>
          <strong>Socket ID:</strong> {socket?.id || 'N/A'}
        </div>

        <div>
          <strong>Registered User:</strong> {user ? `${user.username} (${user.id})` : 'None'}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Test User Registration</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="User ID"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              placeholder="Username"
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
            <button
              onClick={handleRegisterTest}
              disabled={!isConnected}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              Register Test User
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleFetchUsers}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Fetch Connected Users
          </button>
        </div>
      </div>
    </div>
  );
}
