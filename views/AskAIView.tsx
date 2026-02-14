
import React, { useState, useRef, useEffect } from 'react';
import { StudyNote } from '../types';
import { askAI } from '../services/geminiService';

interface AskAIViewProps {
  activeNote: StudyNote;
  notes: StudyNote[];
  onSelectNote: (id: string) => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AskAIView: React.FC<AskAIViewProps> = ({ activeNote, notes, onSelectNote }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Hi! I've analyzed your notes on "${activeNote.name}". What would you like to know about it?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const answer = await askAI(activeNote.content, userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error answering that." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Ask StudyMate AI</h2>
          <p className="text-sm text-slate-500">Retrieval-Augmented Generation based on your notes</p>
        </div>
        <div className="flex items-center gap-3 glass px-3 sm:px-4 py-2 rounded-xl w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-bold uppercase">Active Note:</span>
          <select 
            className="bg-transparent border-none text-primary text-sm font-bold focus:ring-0 cursor-pointer w-full sm:w-auto min-w-0"
            value={activeNote.id}
            onChange={(e) => onSelectNote(e.target.value)}
          >
            {notes.map(n => <option key={n.id} value={n.id} className="bg-background-dark">{n.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 glass rounded-3xl p-4 sm:p-6 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl break-words ${
                m.role === 'user' 
                  ? 'bg-primary text-background-dark font-medium rounded-tr-none shadow-xl' 
                  : 'bg-background-dark/50 border border-primary/10 text-slate-200 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-background-dark/50 border border-primary/10 p-4 rounded-2xl rounded-tl-none flex gap-2">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-.15s]"></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-.3s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            className="w-full bg-background-dark/50 border border-primary/20 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-14 sm:pr-16"
            placeholder={`Ask a question about ${activeNote.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-3 top-3 bottom-3 px-4 bg-primary text-background-dark rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
          >
            <span className="material-icons-round">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskAIView;
