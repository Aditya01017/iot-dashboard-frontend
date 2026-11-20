import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SocketContext from './socket-context';
import { useAuth } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    const client = io(SOCKET_URL, { auth: { token } });
    const handleConnect = () => setSocket(client);
    const handleDisconnect = () => {
      setSocket((current) => (current === client ? null : current));
    };
    const handleConnectError = (error) => {
      console.error('Realtime connection failed:', error.message);
    };

    client.on('connect', handleConnect);
    client.on('disconnect', handleDisconnect);
    client.on('connect_error', handleConnectError);

    return () => {
      client.off('connect', handleConnect);
      client.off('disconnect', handleDisconnect);
      client.off('connect_error', handleConnectError);
      client.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={isAuthenticated ? socket : null}>
      {children}
    </SocketContext.Provider>
  );
};
