import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MessageThread from '../../components/MessageThread';

function roleLabel(role) {
  return role === 'user' ? 'Match Organizer' : 'Stadium Owner';
}

export default function OwnerMessages() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  useEffect(() => {
    const fetchInbox = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/inbox`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setConversations(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, [token]);

  useEffect(() => {
    if (!activePartner) return;
    const fetchMessages = async () => {
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversation/${activePartner._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setMessages(json);
      } catch (err) {
        setMessagesError(err.message);
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [activePartner, token]);

  async function handleSend(content) {
    setMessagesError(null);
    try {
      const sendRes = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: activePartner._id, content }),
      });
      if (!sendRes.ok) throw new Error(`Error ${sendRes.status}`);
      setMessagesLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversation/${activePartner._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setMessages(json);
    } catch (err) {
      setMessagesError(err.message);
    } finally {
      setMessagesLoading(false);
    }
  }

  if (loading) return <p className="text-center mt-20 text-gray-400 text-sm">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-500 text-sm">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        <div className="flex gap-4" style={{ height: '560px' }}>
          {/* Inbox */}
          <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversations</p>
            </div>
            {conversations.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-10">No conversations yet</p>
            )}
            {conversations.map(c => (
              <button
                key={c.partner._id}
                onClick={() => setActivePartner(c.partner)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-100 ${
                  activePartner?._id === c.partner._id ? 'bg-green-50 border-l-2 border-l-green-600' : ''
                }`}
              >
                <div className="font-medium text-sm text-gray-800">{c.partner.name}</div>
                <div className="text-xs text-gray-400">{roleLabel(c.partner.role)}</div>
                <div className="text-xs text-gray-500 truncate mt-1">{c.lastMessage.content}</div>
              </button>
            ))}
          </div>

          {/* Thread */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col overflow-hidden">
            {!activePartner ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select a conversation to start
              </div>
            ) : (
              <>
                <div className="pb-3 mb-3 border-b border-gray-100 flex-shrink-0">
                  <p className="font-semibold text-gray-900 text-sm">{activePartner.name}</p>
                  <p className="text-xs text-gray-400">{roleLabel(activePartner.role)}</p>
                </div>
                <div className="flex-1 overflow-hidden">
                  {messagesLoading && <p className="text-center text-gray-400 text-sm">Loading...</p>}
                  {messagesError && <p className="text-center text-red-500 text-sm">Error: {messagesError}</p>}
                  {!messagesLoading && !messagesError && (
                    <MessageThread messages={messages} onSend={handleSend} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
