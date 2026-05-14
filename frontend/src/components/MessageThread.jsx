import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MessageThread({ messages, onSend }) {
  const { user } = useAuth();
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-xs py-8">No messages yet. Say hello!</p>
        )}
        {messages.map(msg => {
          const isMine = msg.from._id?.toString() === user?.id?.toString();
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMine ? 'bg-green-700 text-white' : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                }`}
              >
                {!isMine && (
                  <div className="text-xs font-semibold text-gray-500 mb-1">{msg.from.name}</div>
                )}
                <p>{msg.content}</p>
                <div className={`text-xs mt-1.5 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button
          onClick={handleSend}
          className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors duration-150"
        >
          Send
        </button>
      </div>
    </div>
  );
}
