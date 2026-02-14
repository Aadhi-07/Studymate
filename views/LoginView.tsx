
import React, { useState } from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin({
        name: isLogin ? 'Alex Rivera' : name,
        email: email,
        isLoggedIn: true
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background-dark flex items-center justify-center p-6 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(214,207,225,0.3)]">
            <span className="material-icons-round text-background-dark text-3xl">auto_stories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">AI StudyMate</h1>
          <p className="text-slate-500 mt-2">Your intelligent companion for academic success</p>
        </div>

        <div className="glass p-5 sm:p-8 rounded-[2rem] border-white/10 relative">
          <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-xl">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">person</span>
                  <input 
                    type="text" 
                    required 
                    placeholder="Alex Rivera"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">alternate_email</span>
                <input 
                  type="email" 
                  required 
                  placeholder="alex@university.edu"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">lock</span>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl mt-4 hover:shadow-[0_0_20px_rgba(214,207,225,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="material-icons-round text-lg">{isLogin ? 'login' : 'person_add'}</span>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              By continuing, you agree to AI StudyMate's <br />
              <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
