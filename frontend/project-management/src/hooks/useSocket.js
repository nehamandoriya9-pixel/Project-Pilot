// hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (teamId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!teamId) return;

    const newSocket = io('http://localhost:5000', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      newSocket.emit('join_team', teamId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('user_typing', (data) => {
      setTypingUsers(prev => {
        const existing = prev.find(user => user.userId === data.userId);
        if (existing) return prev;
        return [...prev, { userId: data.userId, userName: data.userName }];
      });
    });

    newSocket.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [teamId]);

  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    }
  };

  const startTyping = (typingData) => {
    if (socket && isConnected) {
      socket.emit('typing_start', typingData);
    }
  };

  const stopTyping = (typingData) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', typingData);
    }
  };

  return {
    socket,
    isConnected,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  };
};