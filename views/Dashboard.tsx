
import React, { useMemo } from 'react';
import { StudyNote, View, User, StudyPlan } from '../types';

interface DashboardProps {
  user: User | null;
  notes: StudyNote[];
  studyPlan: StudyPlan | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onQuickAction: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, notes, studyPlan, onSelectNote, onDeleteNote, onQuickAction }) => {
  const totalPages = useMemo(() => notes.reduce((acc, n) => acc + (n.pages || 0), 0), [notes]);
  const firstName = user?.name.split(' ')[0] || 'Scholar';
  const isNewUser = notes.length === 0;

  // Dynamic Gamification
  const stats = useMemo(() => {
    const summaryCount = notes.filter(n => n.summary).length;
    const quizCount = notes.filter(n => n.quizzes && n.quizzes.length > 0).length;
    const tasksDone = studyPlan?.plan.filter(t => t.completed).length || 0;
    
    const points = (notes.length * 10) + (summaryCount * 20) + (quizCount * 30) + (tasksDone * 50);
    const level = Math.floor(points / 100) + 1;
    const nextLevelProgress = points % 100;
    
    // Intensity based on recent activity (mocked slightly based on note count and plan progress)
    const intensity = Math.min(100, (notes.length * 5) + (studyPlan ? (tasksDone / studyPlan.plan.length) * 100 : 0));

    return { level, points, nextLevelProgress, intensity, tasksDone };
  }, [notes, studyPlan]);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-white">
            {isNewUser ? `Welcome to StudyMate, ${firstName}!` : `Welcome back, ${firstName} 👋`}
          </h2>
          <p className="text-slate-500">
            {isNewUser 
              ? "Your AI-powered academic journey starts here. Upload a file to begin." 
              : "Ready to conquer your study goals today?"}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border border-primary/20 flex-1 sm:flex-none">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background-dark font-bold">
              {stats.level}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary leading-none">Level</p>
              <p className="text-sm font-bold text-white">Scholar</p>
            </div>
          </div>
          <button className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-primary/10 transition-all text-slate-400 flex-shrink-0">
            <span className="material-icons-round">notifications</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-xl relative overflow-hidden group cursor-pointer hover:bg-primary/5 transition-colors border border-white/5">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-icons-round text-8xl text-primary">description</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <span className="material-icons-round">description</span>
            </div>
            <span className="text-slate-400 font-medium">Knowledge Base</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-white">{notes.length}</h3>
            <span className="text-slate-500 text-sm">Documents</span>
          </div>
        </div>

        <div className="glass p-6 rounded-xl relative overflow-hidden group cursor-pointer hover:bg-primary/5 transition-colors border border-white/5">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-icons-round text-8xl text-primary">auto_stories</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <span className="material-icons-round">auto_stories</span>
            </div>
            <span className="text-slate-400 font-medium">Pages Mastered</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-white">{totalPages}</h3>
            <span className="text-primary text-sm">Processed</span>
          </div>
        </div>

        <div className="glass p-6 rounded-xl relative overflow-hidden group border border-white/5">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-icons-round text-8xl text-primary">bolt</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <span className="material-icons-round">bolt</span>
            </div>
            <span className="text-slate-400 font-medium">Study Intensity</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold text-white">{Math.round(stats.intensity)}%</span>
              <span className="text-slate-500">Efficiency</span>
            </div>
            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${stats.intensity}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isNewUser ? (
            <div
              onClick={() => onQuickAction('upload')}
              className="border-2 border-dashed border-primary/30 rounded-3xl bg-primary/5 p-8 sm:p-12 lg:p-16 text-center transition-all hover:border-primary/60 hover:bg-primary/10 group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(214,207,225,0.1)]">
                <span className="material-icons-round text-primary text-5xl">add_task</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Your dashboard is empty</h3>
              <p className="text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">
                Upload your first lecture notes or textbook chapters to see the AI in action. We'll summarize, quiz, and plan for you.
              </p>
              <button className="bg-primary text-background-dark px-6 sm:px-10 py-4 rounded-xl font-bold hover:shadow-[0_0_25px_rgba(215,208,226,0.3)] transition-all flex items-center gap-2 mx-auto">
                <span className="material-icons-round">cloud_upload</span>
                Upload Your First Note
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-center gap-3 flex-wrap mb-6">
                <h4 className="text-xl font-bold text-white">Recent Activity</h4>
                <button 
                  onClick={() => onQuickAction('upload')}
                  className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id} 
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl glass-hover transition-all cursor-pointer group border border-transparent hover:border-white/10"
                    onClick={() => onSelectNote(note.id)}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center sm:mr-4 ${
                      note.type === 'pdf' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      <span className="material-icons-round text-2xl">
                        {note.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-200 group-hover:text-primary transition-colors">{note.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-500 uppercase font-bold tracking-wider">{note.type}</span>
                        <p className="text-xs text-slate-500">{note.timestamp} • {note.pages} pages</p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectNote(note.id); }}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-colors"
                        title="View Summary"
                      >
                        <span className="material-icons-round text-sm">summarize</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <span className="material-icons-round text-sm">delete_outline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {studyPlan && (
            <div className="glass rounded-2xl p-6 border border-white/5 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-white">Active Study Plan</h4>
                <button 
                  onClick={() => onQuickAction('planner')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Manage Plan
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center text-primary font-bold">
                  {Math.round((stats.tasksDone / studyPlan.plan.length) * 100)}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-lg">{studyPlan.examName}</p>
                  <p className="text-sm text-slate-400">Targeting {studyPlan.examDate}</p>
                </div>
                <button 
                  onClick={() => onQuickAction('planner')}
                  className="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg text-sm w-full sm:w-auto"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="glass rounded-3xl p-6 overflow-hidden relative group cursor-pointer border border-white/5" onClick={() => onQuickAction('ask')}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <span className="material-icons-round text-background-dark text-xl">smart_toy</span>
                </div>
                <h4 className="font-bold text-white">AI Mentor</h4>
              </div>
              <p className="text-sm text-slate-400 mb-6 italic leading-relaxed">
                {isNewUser 
                  ? "I'm ready to explain complex concepts once you upload your notes. Try me!" 
                  : `"How can I help you study today? I can explain the core concepts of your recent notes."`}
              </p>
              <div className="relative">
                <div className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-4 text-sm text-slate-500">
                  Ask a question...
                </div>
                <button className="absolute right-2 top-2 p-2 bg-primary rounded-lg text-background-dark hover:scale-105 transition-transform">
                  <span className="material-icons-round text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h4 className="font-bold mb-6 text-white">Daily Engagement</h4>
            <div className="flex justify-between items-end mb-6 h-20 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                // Mocking visual activity for the streak
                const heights = [30, 45, 80, 20, 10, 5, 5];
                const h = heights[idx];
                const isActive = idx === 2; // Today is Wednesday in this mock
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-1000 ${isActive ? 'bg-primary shadow-[0_0_15px_rgba(214,207,225,0.4)]' : 'bg-primary/10'}`} 
                      style={{ height: `${h}%` }}
                    ></div>
                    <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-slate-600'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
              {isNewUser ? "Start a streak today" : "You're in the top 5% of learners"}
            </p>
          </div>
          
          <div className="glass rounded-3xl p-8 border-l-4 border-primary bg-primary/5">
            <h4 className="font-bold mb-3 text-white flex items-center gap-2">
              <span className="material-icons-round text-primary text-sm">tips_and_updates</span>
              Pro Tip
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "Research shows that testing yourself with <strong>AI-generated Quizzes</strong> right after summarizing increases long-term retention by 3x compared to re-reading."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
