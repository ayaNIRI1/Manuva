'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ChevronLeft, Send, Loader2 } from 'lucide-react';
import { useChat } from '@/lib/chat-context';

// ── Helpers ────────────────────────────────────────────────────────────────
const getOtherUser = (conv, currentUserId) => {
  if (!conv || !currentUserId) return null;
  if (conv.buyer_id === currentUserId)
    return { name: conv.seller_name, avatar: conv.seller_avatar };
  return { name: conv.buyer_name, avatar: conv.buyer_avatar };
};

const Avatar = ({ name = '?', avatar, size = 8 }) => (
  <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden flex-shrink-0`}>
    {avatar
      ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
      : <span className="text-white font-bold text-xs">{name[0]?.toUpperCase()}</span>
    }
  </div>
);

// ── Sub-views ──────────────────────────────────────────────────────────────
const ConversationList = ({ currentUserId }) => {
  const { conversations, openConversation, setIsChatOpen } = useChat();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <h3 className="font-bold text-sm">المحادثات</h3>
        <button onClick={() => setIsChatOpen(false)} className="hover:opacity-80 transition-opacity">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-6 text-center">
            <MessageCircle size={32} className="opacity-40" />
            <p className="text-sm">لا توجد محادثات بعد</p>
            <p className="text-xs opacity-70">يمكنك بدء محادثة من صفحة البائع</p>
          </div>
        )}
        {conversations.map((conv) => {
          const other = getOtherUser(conv, currentUserId);
          return (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b border-slate-100 text-right"
            >
              <Avatar name={other?.name || '?'} avatar={other?.avatar} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-slate-800 truncate">{other?.name}</span>
                  {conv.unread_count > 0 && (
                    <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold flex-shrink-0 ml-1">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{conv.last_message || 'ابدأ المحادثة'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MessageThread = ({ currentUserId }) => {
  const { activeConversation, messages, sendMessage, closeConversation } = useChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const other = getOtherUser(activeConversation, currentUserId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    sendMessage(input.trim());
    setInput('');
    setTimeout(() => setSending(false), 300);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <button onClick={closeConversation} className="hover:opacity-80 transition-opacity">
          <ChevronLeft size={20} />
        </button>
        <Avatar name={other?.name || '?'} avatar={other?.avatar} size={7} />
        <span className="font-bold text-sm truncate">{other?.name}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-50">
        {messages.map((m) => {
          const isMe = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-2 bg-white border-t border-slate-100">
        <input
          className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition text-right"
          placeholder="اكتب رسالة..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          dir="rtl"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white disabled:opacity-50 hover:shadow-md transition-all"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  );
};

// ── Main Widget ─────────────────────────────────────────────────────────────
const ChatWindow = () => {
  const { isChatOpen, setIsChatOpen, unreadCount, activeConversation, fetchConversations } = useChat();

  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (user) {
      try { setCurrentUserId(JSON.parse(user).id); } catch {}
    }
  }, []);

  const handleOpen = () => {
    fetchConversations();
    setIsChatOpen(true);
  };

  if (!currentUserId) return null; // not logged in

  return (
    <>
      {/* Floating button */}
      {!isChatOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl flex items-center justify-center hover:scale-110 hover:shadow-2xl transition-all"
          aria-label="فتح المحادثات"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {isChatOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-80 h-[460px] rounded-2xl shadow-2xl bg-white overflow-hidden flex flex-col border border-slate-200 animate-in slide-in-from-bottom-4 duration-200">
          {activeConversation
            ? <MessageThread currentUserId={currentUserId} />
            : <ConversationList currentUserId={currentUserId} />
          }
        </div>
      )}
    </>
  );
};

export default ChatWindow;
