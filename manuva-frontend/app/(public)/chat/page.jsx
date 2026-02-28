'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Send, ChevronLeft, Loader2, ArrowRight } from 'lucide-react';
import { useChat } from '@/lib/chat-context';
import { useRouter } from 'next/navigation';

const getOtherUser = (conv, currentUserId) => {
  if (!conv || !currentUserId) return null;
  if (conv.buyer_id === currentUserId)
    return { name: conv.seller_name, avatar: conv.seller_avatar };
  return { name: conv.buyer_name, avatar: conv.buyer_avatar };
};

const Avatar = ({ name = '?', avatar, size = 10 }) => (
  <div
    className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden flex-shrink-0`}
  >
    {avatar ? (
      <img src={avatar} alt={name} className="w-full h-full object-cover" />
    ) : (
      <span className="text-white font-bold">{name[0]?.toUpperCase()}</span>
    )}
  </div>
);

export default function ChatPage() {
  const router = useRouter();
  const { conversations, activeConversation, messages, sendMessage, openConversation, closeConversation, fetchConversations } = useChat();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    try { setCurrentUserId(JSON.parse(user).id); } catch {}
    fetchConversations().finally(() => setLoading(false));
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MessageCircle className="text-orange-500" size={26} />
          المحادثات
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex" style={{ height: '70vh' }}>
          {/* Sidebar */}
          <div className={`w-full md:w-80 border-l border-slate-100 flex-shrink-0 ${activeConversation ? 'hidden md:flex' : 'flex'} flex-col`}>
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-600 text-sm">جميع المحادثات</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-6 text-center">
                  <MessageCircle size={36} className="opacity-40" />
                  <p className="text-sm">لا توجد محادثات بعد</p>
                  <p className="text-xs opacity-70">ابدأ محادثة من صفحة أي بائع</p>
                </div>
              )}
              {conversations.map((conv) => {
                const other = getOtherUser(conv, currentUserId);
                const isActive = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-4 transition-colors border-b border-slate-50 text-right ${
                      isActive ? 'bg-orange-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Avatar name={other?.name || '?'} avatar={other?.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm truncate ${isActive ? 'text-orange-600' : 'text-slate-800'}`}>
                          {other?.name}
                        </span>
                        {conv.unread_count > 0 && (
                          <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold ml-1">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {conv.last_message || 'ابدأ المحادثة'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thread area */}
          <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
            {!activeConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <MessageCircle size={48} className="opacity-30" />
                <p className="text-sm">اختر محادثة للبدء</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
                  <button
                    onClick={closeConversation}
                    className="md:hidden text-slate-500 hover:text-orange-500 transition-colors"
                  >
                    <ArrowRight size={20} />
                  </button>
                  <Avatar
                    name={getOtherUser(activeConversation, currentUserId)?.name || '?'}
                    avatar={getOtherUser(activeConversation, currentUserId)?.avatar}
                    size={9}
                  />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {getOtherUser(activeConversation, currentUserId)?.name}
                    </p>
                    <p className="text-xs text-green-500">متصل</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
                  {messages.map((m) => {
                    const isMe = m.sender_id === currentUserId;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-br-sm'
                              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 px-4 py-3 bg-white border-t border-slate-100"
                >
                  <input
                    className="flex-1 bg-slate-100 rounded-full px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition text-right"
                    placeholder="اكتب رسالة..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    dir="rtl"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white disabled:opacity-50 hover:shadow-md transition-all"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
