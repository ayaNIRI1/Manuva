'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { apiRequest } from './api';

const ChatContext = createContext({});

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const socketRef = useRef(null);

  // Connect socket when a token exists (user logged in)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('💬 Chat socket connected');
    });

    newSocket.on('new_message', (message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // Update last_message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversation_id
            ? { ...c, last_message: message.content, last_message_at: message.created_at }
            : c
        )
      );

      // Increase unread if it's not the active conversation
      if (!activeConversation || activeConversation.id !== message.conversation_id) {
        setUnreadCount((n) => n + 1);
      }
    });

    newSocket.on('messages_read', () => {
      fetchUnreadCount();
    });

    newSocket.on('disconnect', () => {
      console.log('💬 Chat socket disconnected');
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiRequest('/chat/conversations');
      setConversations(data);
    } catch {
      // not logged in — ignore
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await apiRequest('/chat/unread-count');
      setUnreadCount(data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  // Load conversations whenever chat opens
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [fetchConversations, fetchUnreadCount]);

  const openConversation = useCallback(
    async (conversation) => {
      setActiveConversation(conversation);

      // Join socket room
      if (socketRef.current) {
        if (activeConversation) {
          socketRef.current.emit('leave_conversation', activeConversation.id);
        }
        socketRef.current.emit('join_conversation', conversation.id);
        socketRef.current.emit('mark_read', { conversationId: conversation.id });
      }

      // Fetch history
      try {
        const data = await apiRequest(`/chat/conversations/${conversation.id}/messages`);
        setMessages(data);
        // Refresh unread count
        fetchUnreadCount();
        setConversations((prev) =>
          prev.map((c) => (c.id === conversation.id ? { ...c, unread_count: 0 } : c))
        );
      } catch {
        setMessages([]);
      }
    },
    [activeConversation, fetchUnreadCount]
  );

  const startConversation = useCallback(async (sellerId) => {
    try {
      const conv = await apiRequest('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ seller_id: sellerId }),
      });
      await fetchConversations();
      return conv;
    } catch (err) {
      console.error('startConversation error:', err);
      return null;
    }
  }, [fetchConversations]);

  const sendMessage = useCallback(
    (content) => {
      if (!socketRef.current || !activeConversation || !content.trim()) return;

      socketRef.current.emit(
        'send_message',
        { conversationId: activeConversation.id, content },
        () => {}
      );
    },
    [activeConversation]
  );

  const closeConversation = useCallback(() => {
    if (socketRef.current && activeConversation) {
      socketRef.current.emit('leave_conversation', activeConversation.id);
    }
    setActiveConversation(null);
    setMessages([]);
  }, [activeConversation]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        conversations,
        activeConversation,
        messages,
        unreadCount,
        isChatOpen,
        setIsChatOpen,
        openConversation,
        closeConversation,
        startConversation,
        sendMessage,
        fetchConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
