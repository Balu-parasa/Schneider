import { useEffect, useState } from 'react';
import { echo } from '@/lib/echo';

export const useEcho = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Listen to connection state changes
    echo.connector.pusher.connection.bind('connected', () => {
      setIsConnected(true);
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
      setIsConnected(false);
    });

    echo.connector.pusher.connection.bind('error', () => {
      setIsConnected(false);
    });

    return () => {
      echo.connector.pusher.connection.unbind_all();
    };
  }, []);

  return { echo, isConnected };
};
