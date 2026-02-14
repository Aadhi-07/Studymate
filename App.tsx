
import React, { useState, useEffect } from 'react';
import { View, StudyNote, StudyPlan, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import UploadView from './views/UploadView';
import SummarizeView from './views/SummarizeView';
import QuizView from './views/QuizView';
import AskAIView from './views/AskAIView';
import PlannerView from './views/PlannerView';
import LoginView from './views/LoginView';
import OfflineBanner from './components/OfflineBanner';
import OnboardingTour from './components/OnboardingTour';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('studymate_user');
    const savedNotes = localStorage.getItem('studymate_notes');
    const savedPlan = localStorage.getItem('studymate_plan');
    const hasSeenTour = localStorage.getItem('studymate_seen_tour');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // Show tour only for logged in users who haven't seen it
      if (!hasSeenTour) {
        setShowTour(true);
      }
    }

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else if (savedUser) {
      // Demo Data only if the user is returning for the first time without notes
      const demoNotes: StudyNote[] = [
        {
          id: '1',
          name: 'Organic_Chemistry_Lec3.pdf',
          content: 'Organic chemistry is the study of carbon compounds. Carbon is unique because it can form four covalent bonds...',
          timestamp: '2 hours ago',
          pages: 14,
          type: 'pdf'
        }
      ];
      setNotes(demoNotes);
    }
    
    if (savedPlan) {
      setStudyPlan(JSON.parse(savedPlan));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (user) localStorage.setItem('studymate_user', JSON.stringify(user));
    else localStorage.removeItem('studymate_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('studymate_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('studymate_plan', JSON.stringify(studyPlan));
  }, [studyPlan]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    const hasSeenTour = localStorage.getItem('studymate_seen_tour');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setShowTour(false);
    setMobileNavOpen(false);
  };

  const handleCompleteTour = () => {
    setShowTour(false);
    localStorage.setItem('studymate_seen_tour', 'true');
  };

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleUpdateNote = (updatedNote: StudyNote) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                  user={user}
                  notes={notes} 
                  studyPlan={studyPlan}
                  onSelectNote={(id) => { setActiveNoteId(id); setCurrentView('summarize'); }} 
                  onDeleteNote={handleDeleteNote}
                  onQuickAction={(view) => setCurrentView(view)}
                />;
      case 'upload':
        return <UploadView onUpload={(note) => { setNotes([note, ...notes]); setActiveNoteId(note.id); setCurrentView('summarize'); }} />;
      case 'summarize':
        return <SummarizeView note={activeNote} onUpdate={handleUpdateNote} />;
      case 'quiz':
        return <QuizView note={activeNote} onUpdate={handleUpdateNote} />;
      case 'ask':
        return <AskAIView activeNote={activeNote} notes={notes} onSelectNote={setActiveNoteId} />;
      case 'planner':
        return <PlannerView plan={studyPlan} onUpdatePlan={setStudyPlan} />;
      default:
        return <Dashboard 
                  user={user}
                  notes={notes} 
                  studyPlan={studyPlan}
                  onSelectNote={(id) => { setActiveNoteId(id); setCurrentView('summarize'); }} 
                  onDeleteNote={handleDeleteNote}
                  onQuickAction={(view) => setCurrentView(view)} 
                />;
    }
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#18171b]">
      <OfflineBanner />
      {showTour && <OnboardingTour onComplete={handleCompleteTour} />}

      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#18171b]/95 backdrop-blur-md border-b border-primary/10">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
            aria-label="Open navigation"
          >
            <span className="material-icons-round">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-icons-round text-background-dark text-base">auto_stories</span>
            </div>
            <span className="text-white font-semibold">StudyMate</span>
          </div>
        </div>
      </header>

      <Sidebar
        user={user}
        activeView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setMobileNavOpen(false);
        }}
        onLogout={handleLogout}
        isMobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main className="min-h-screen lg:ml-72 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8 pb-8 overflow-x-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
