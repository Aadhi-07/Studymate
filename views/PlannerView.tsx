
import React, { useState, useMemo } from 'react';
import { StudyPlan, StudyTask } from '../types';
import { generateStudyPlan } from '../services/geminiService';

interface PlannerViewProps {
  plan: StudyPlan | null;
  onUpdatePlan: (plan: StudyPlan) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({ plan, onUpdatePlan }) => {
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!examName || !examDate || !syllabus) return;
    
    // Calculate days remaining
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(examDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      setError("Please select a future date for your exam.");
      return;
    }
    
    if (diffDays > 60) {
      setError("We can only generate plans for exams within the next 60 days.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const newPlan = await generateStudyPlan(examName, examDate, syllabus, diffDays);
      // Ensure each task starts as not completed
      const initializedPlan = {
        ...newPlan,
        plan: newPlan.plan.map(task => ({ ...task, completed: false }))
      };
      onUpdatePlan(initializedPlan);
    } catch (e) {
      console.error(e);
      setError("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (index: number) => {
    if (!plan) return;
    const newPlanList = [...plan.plan];
    newPlanList[index] = { ...newPlanList[index], completed: !newPlanList[index].completed };
    onUpdatePlan({ ...plan, plan: newPlanList });
  };

  const stats = useMemo(() => {
    if (!plan) return { completed: 0, total: 0, percent: 0 };
    const total = plan.plan.length;
    const completed = plan.plan.filter(t => t.completed).length;
    return {
      completed,
      total,
      percent: Math.round((completed / total) * 100) || 0
    };
  }, [plan]);

  // Calculate dates for the calendar based on the exam date
  const calendarData = useMemo(() => {
    if (!plan || !plan.examDate) return null;
    const exam = new Date(plan.examDate);
    const tasksWithDates = plan.plan.map((task, idx) => {
      const daysToSubtract = plan.plan.length - idx;
      const taskDate = new Date(exam);
      taskDate.setDate(exam.getDate() - daysToSubtract);
      return { ...task, date: taskDate, originalIndex: idx };
    });

    const referenceDate = tasksWithDates[0].date;
    const month = referenceDate.getMonth();
    const year = referenceDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return {
      tasksWithDates,
      monthName: referenceDate.toLocaleString('default', { month: 'long' }),
      year,
      startDayOfWeek,
      daysInMonth,
      month,
    };
  }, [plan]);

  if (!plan && !loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Smart Study Planner</h2>
          <p className="text-slate-400">Enter your exam details to build a plan for the exact time remaining.</p>
        </div>

        <div className="glass p-4 sm:p-8 rounded-2xl space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in">
              <span className="material-icons-round text-lg">error_outline</span>
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Exam Name</label>
              <input 
                type="text" 
                placeholder="e.g. Finals - Biology" 
                className="w-full bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-white focus:ring-primary/50 outline-none transition-all"
                value={examName}
                onChange={e => setExamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Exam Date</label>
              <input 
                type="date" 
                className="w-full bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-white focus:ring-primary/50 outline-none transition-all"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Brief Syllabus / Topics</label>
            <textarea 
              placeholder="List the key topics or paste your syllabus content..." 
              className="w-full bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-white h-40 focus:ring-primary/50 resize-none outline-none transition-all"
              value={syllabus}
              onChange={e => setSyllabus(e.target.value)}
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={!examName || !examDate || !syllabus}
            className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            Generate My Plan
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary font-medium animate-pulse text-lg">Curating your personalized study roadmap...</p>
        <p className="text-slate-500 text-sm">Our AI is scaling the plan to fit your specific timeline.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="sticky top-16 lg:top-0 py-4 bg-[#18171b]/95 backdrop-blur-md z-10 border-b border-primary/5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{plan?.examName} Preparation</h2>
            <p className="text-slate-500 font-medium">Target Exam: {plan?.examDate}</p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <div className="glass p-1 rounded-xl flex">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-background-dark' : 'text-slate-400 hover:text-white'}`}
              >
                <span className="material-icons-round text-sm">format_list_bulleted</span>
                List
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-primary text-background-dark' : 'text-slate-400 hover:text-white'}`}
              >
                <span className="material-icons-round text-sm">calendar_view_month</span>
                Calendar
              </button>
            </div>
            <button 
              onClick={() => { setExamName(''); setExamDate(''); onUpdatePlan(null as any); }}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-primary text-sm font-bold hover:bg-primary/10 transition-all"
            >
              <span className="material-icons-round text-sm">refresh</span>
              New
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1 px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Your Progress</span>
            <span className="text-sm font-mono text-white">{stats.percent}% Complete ({stats.completed}/{stats.total} days)</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(214,207,225,0.4)]" 
              style={{ width: `${stats.percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300">
          {plan?.plan.map((item, idx) => (
            <div 
              key={idx} 
              className={`glass rounded-3xl overflow-hidden group transition-all duration-500 border border-primary/5 ${
                item.completed ? 'opacity-60 bg-white/[0.01] scale-[0.98]' : 'hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                <div className={`md:w-32 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-primary/10 transition-colors ${
                  item.completed ? 'bg-emerald-500/10' : 'bg-primary/10'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${
                    item.completed ? 'text-emerald-500/60' : 'text-primary/60'
                  }`}>Day</span>
                  <span className={`text-4xl font-black leading-none ${
                    item.completed ? 'text-emerald-500' : 'text-primary'
                  }`}>{idx + 1}</span>
                  {item.completed && (
                    <span className="material-icons-round text-emerald-500 mt-2 text-xl">verified</span>
                  )}
                </div>
                
                <div className="flex-1 p-5 sm:p-8 space-y-6">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="space-y-1">
                      <h4 className={`text-2xl font-bold transition-all ${
                        item.completed ? 'text-slate-500 line-through' : 'text-white group-hover:text-primary'
                      }`}>{item.topic}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.completed ? 'bg-slate-600' : 'bg-emerald-500 animate-pulse'}`}></span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          item.completed ? 'text-slate-600' : 'text-emerald-400'
                        }`}>
                          {item.completed ? 'Completed' : 'Current Objective'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleTask(idx)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                        item.completed 
                          ? 'bg-emerald-500 text-white' 
                          : 'glass text-slate-400 hover:bg-primary hover:text-background-dark'
                      }`}
                    >
                      <span className="material-icons-round">{item.completed ? 'done_all' : 'check'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`space-y-3 p-5 rounded-2xl transition-colors ${
                      item.completed ? 'bg-slate-800/20 border-slate-700/20' : 'bg-white/5 border-white/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`material-icons-round text-xl ${item.completed ? 'text-slate-600' : 'text-amber-400'}`}>track_changes</span>
                        <span className={`text-sm font-bold uppercase tracking-widest ${item.completed ? 'text-slate-600' : 'text-amber-400'}`}>Key Focus</span>
                      </div>
                      <p className={`text-sm leading-relaxed font-medium ${item.completed ? 'text-slate-600' : 'text-slate-300'}`}>
                        {item.focus}
                      </p>
                    </div>

                    <div className={`space-y-3 p-5 rounded-2xl border transition-colors ${
                      item.completed ? 'bg-slate-800/20 border-slate-700/20' : 'bg-primary/5 border-primary/10'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`material-icons-round text-xl ${item.completed ? 'text-slate-600' : 'text-primary'}`}>lightbulb</span>
                        <span className={`text-sm font-bold uppercase tracking-widest ${item.completed ? 'text-slate-600' : 'text-primary'}`}>Study Strategy</span>
                      </div>
                      <p className={`text-sm leading-relaxed italic ${item.completed ? 'text-slate-600' : 'text-slate-300'}`}>
                        {item.strategy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-3xl p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {calendarData?.monthName} {calendarData?.year}
            </h3>
            <div className="flex items-center gap-4 flex-wrap">
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30"></div>
                  <span>Study Day</span>
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>Completed</span>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10 min-w-[700px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-background-dark/80 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                {day}
              </div>
            ))}
            
            {Array.from({ length: calendarData?.startDayOfWeek || 0 }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-background-dark/20 h-32"></div>
            ))}
            
            {Array.from({ length: calendarData?.daysInMonth || 30 }).map((_, i) => {
              const day = i + 1;
              const taskOnDay = calendarData?.tasksWithDates.find(t => t.date.getDate() === day && t.date.getMonth() === calendarData.month);
              
              return (
                <div key={day} className={`bg-background-dark/40 h-36 p-3 relative group transition-all hover:bg-white/5 ${taskOnDay ? 'z-10' : ''}`}>
                  <span className={`text-sm font-bold ${taskOnDay ? 'text-primary' : 'text-slate-600'}`}>
                    {day}
                  </span>
                  
                  {taskOnDay && (
                    <div 
                      onClick={() => toggleTask(taskOnDay.originalIndex)}
                      className={`mt-2 p-2 rounded-xl text-[10px] leading-tight cursor-pointer transition-all ${
                        taskOnDay.completed 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-primary/10 text-primary border border-primary/20 hover:scale-105 hover:bg-primary/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold uppercase tracking-tighter">Day {taskOnDay.originalIndex + 1}</span>
                        {taskOnDay.completed && <span className="material-icons-round text-[10px]">check_circle</span>}
                      </div>
                      <p className="line-clamp-2 font-medium">{taskOnDay.topic}</p>
                      
                      <div className="absolute left-full ml-2 top-0 w-64 glass p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all invisible group-hover:visible shadow-2xl z-50">
                        <p className="text-primary font-bold text-xs mb-1 uppercase">Objective</p>
                        <p className="text-white text-xs mb-3">{taskOnDay.focus}</p>
                        <p className="text-primary font-bold text-xs mb-1 uppercase">Strategy</p>
                        <p className="text-slate-300 text-xs italic">{taskOnDay.strategy}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      <div className="text-center p-8 glass rounded-3xl border-dashed border-2 border-primary/20">
        <p className="text-slate-400 italic">"Consistency is the key to mastery. Follow the plan and success will follow you."</p>
      </div>
    </div>
  );
};

export default PlannerView;
