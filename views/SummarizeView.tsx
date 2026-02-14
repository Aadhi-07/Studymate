
import React, { useState, useEffect } from 'react';
import { StudyNote, Flashcard } from '../types';
import { summarizeText, generateQuestions, generateFlashcards } from '../services/geminiService';

interface SummarizeViewProps {
  note: StudyNote;
  onUpdate: (note: StudyNote) => void;
}

const SummarizeView: React.FC<SummarizeViewProps> = ({ note, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'questions' | 'flashcards'>('summary');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSummarize = async () => {
    if (isOffline) return;
    setLoading(true);
    try {
      const summary = await summarizeText(note.content);
      const questions = await generateQuestions(note.content);
      const flashcards = await generateFlashcards(note.content);
      onUpdate({ ...note, summary, questions, flashcards });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!note.summary && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="material-icons-round text-primary text-5xl">auto_fix_high</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Needs Analysis</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            {isOffline 
              ? "You are currently offline. Please connect to the internet to analyze this document with AI." 
              : "This document hasn't been analyzed yet. Let StudyMate AI extract the key concepts and generate questions for you."}
          </p>
        </div>
        <button
          onClick={handleSummarize}
          disabled={isOffline}
          className={`px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            isOffline 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50' 
              : 'bg-primary text-background-dark hover:shadow-2xl'
          }`}
        >
          {isOffline && <span className="material-icons-round text-lg">cloud_off</span>}
          {isOffline ? 'Connect to Analyze' : 'Analyze Note'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <span className="material-icons-round">summarize</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{note.name}</h2>
            <p className="text-sm text-slate-500">Summarized by StudyMate AI</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 glass rounded-xl text-sm font-medium hover:bg-white/5 transition-all text-slate-300"
          >
            <span className="material-icons-round text-sm">print</span>
            Export / Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-primary font-medium animate-pulse">Deconstructing knowledge base...</p>
        </div>
      ) : (
        <>
          <div className="flex gap-4 border-b border-primary/10 no-print overflow-x-auto">
            <button
              onClick={() => setActiveTab('summary')}
              className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-slate-500'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'flashcards' ? 'border-primary text-primary' : 'border-transparent text-slate-500'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-slate-500'
              }`}
            >
              Practice Questions
            </button>
          </div>

          {activeTab === 'summary' && (
            <div className="glass p-5 sm:p-8 rounded-2xl leading-relaxed whitespace-pre-wrap text-slate-200">
              {note.summary}
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="flex flex-col items-center space-y-6 sm:space-y-8 py-8 sm:py-10 no-print">
              {note.flashcards && note.flashcards.length > 0 ? (
                <>
                  <div 
                    className="w-full max-w-lg aspect-[5/3] cursor-pointer perspective-1000 group"
                    onClick={() => setFlipped(!flipped)}
                  >
                    <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
                      <div className="absolute inset-0 backface-hidden glass rounded-3xl p-6 sm:p-10 flex items-center justify-center text-center border-2 border-primary/30 shadow-2xl">
                        <p className="text-xl sm:text-2xl font-bold text-white">{note.flashcards[cardIndex].front}</p>
                        <span className="absolute bottom-6 text-[10px] uppercase tracking-widest text-primary font-bold">Click to reveal answer</span>
                      </div>
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary/10 glass rounded-3xl p-6 sm:p-10 flex items-center justify-center text-center border-2 border-primary shadow-2xl">
                        <p className="text-base sm:text-xl text-slate-100 italic leading-relaxed">{note.flashcards[cardIndex].back}</p>
                        <span className="absolute bottom-6 text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Answer Learned</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8">
                    <button 
                      onClick={() => { setCardIndex((cardIndex - 1 + note.flashcards!.length) % note.flashcards!.length); setFlipped(false); }}
                      className="w-12 h-12 glass rounded-full flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                    >
                      <span className="material-icons-round">chevron_left</span>
                    </button>
                    <span className="text-slate-500 font-mono">{cardIndex + 1} / {note.flashcards.length}</span>
                    <button 
                      onClick={() => { setCardIndex((cardIndex + 1) % note.flashcards!.length); setFlipped(false); }}
                      className="w-12 h-12 glass rounded-full flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                    >
                      <span className="material-icons-round">chevron_right</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-500">No flashcards generated for this note yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-6">
              {note.questions && (
                <>
                  <QuestionSection title="2-Mark Questions (Concept Basics)" questions={note.questions.marks2} color="text-emerald-400" />
                  <QuestionSection title="5-Mark Questions (Standard Explanations)" questions={note.questions.marks5} color="text-amber-400" />
                  <QuestionSection title="10-Mark Questions (Critical Analysis)" questions={note.questions.marks10} color="text-rose-400" />
                </>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .glass { border: 1px solid #ddd !important; background: transparent !important; color: black !important; }
          main { margin-left: 0 !important; padding: 0 !important; }
        }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

const QuestionSection: React.FC<{ title: string; questions: string[]; color: string }> = ({ title, questions, color }) => (
  <div className="glass p-6 rounded-2xl space-y-4 border-l-4 border-l-primary/30">
    <h3 className={`text-lg font-bold ${color}`}>{title}</h3>
    <ul className="space-y-4 list-decimal pl-5 text-slate-300">
      {questions.map((q, idx) => (
        <li key={idx} className="hover:text-white transition-colors cursor-default">
          {q}
        </li>
      ))}
    </ul>
  </div>
);

export default SummarizeView;
