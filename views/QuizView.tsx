
import React, { useState } from 'react';
import { StudyNote, QuizItem } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizViewProps {
  note: StudyNote;
  onUpdate: (note: StudyNote) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ note, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    try {
      const quizzes = await generateQuiz(note.content);
      onUpdate({ ...note, quizzes });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === note.quizzes![currentIndex].answer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < (note.quizzes?.length || 0) - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizComplete(false);
  };

  if (!note.quizzes && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="material-icons-round text-primary text-5xl">quiz</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Challenge Yourself</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Test your knowledge of "{note.name}" with an AI-generated quiz focused on the most critical parts of the content.
          </p>
        </div>
        <button
          onClick={handleGenerateQuiz}
          className="bg-primary text-background-dark px-10 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all"
        >
          Generate Quiz
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary font-medium">Drafting tricky questions...</p>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = (score / note.quizzes!.length) * 100;
    return (
      <div className="max-w-xl mx-auto glass p-6 sm:p-10 rounded-3xl text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="relative inline-block">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/10" />
            <circle
              cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * percentage) / 100}
              className="text-primary transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{score}/{note.quizzes!.length}</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest">Score</span>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Quiz Complete!</h2>
          <p className="text-slate-400 mt-2">
            {percentage >= 80 ? "Excellent work! You've mastered this topic." : "Good effort. Review the summaries and try again to improve."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button onClick={resetQuiz} className="bg-primary text-background-dark px-8 py-3 rounded-xl font-bold">Retake Quiz</button>
          <button onClick={handleGenerateQuiz} className="glass px-8 py-3 rounded-xl font-bold text-white">Generate New</button>
        </div>
      </div>
    );
  }

  const currentQuiz = note.quizzes![currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold">Question {currentIndex + 1} of {note.quizzes!.length}</h2>
        <div className="h-2 w-full sm:flex-1 sm:mx-8 bg-primary/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / note.quizzes!.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-sm font-medium text-slate-400 sm:self-auto self-end">Score: {score}</div>
      </div>

      <div className="glass p-5 sm:p-8 rounded-3xl space-y-8 border-t-2 border-t-primary/20">
        <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">{currentQuiz.question}</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {currentQuiz.options.map((option, idx) => {
            let styles = "glass p-4 rounded-xl text-left transition-all border border-primary/10 hover:border-primary/40";
            if (selectedAnswer !== null) {
              if (idx === currentQuiz.answer) styles = "bg-emerald-500/20 border-emerald-500 text-emerald-300 p-4 rounded-xl text-left transition-all";
              else if (idx === selectedAnswer) styles = "bg-rose-500/20 border-rose-500 text-rose-300 p-4 rounded-xl text-left transition-all";
              else styles = "opacity-50 glass p-4 rounded-xl text-left transition-all";
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleAnswer(idx)}
                className={styles}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    selectedAnswer !== null && idx === currentQuiz.answer ? 'bg-emerald-500 text-white' : 'bg-primary/20 text-primary'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedAnswer !== null && (
          <div className="animate-in slide-in-from-top-4 duration-300 space-y-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">AI Explanation</p>
              <p className="text-slate-300 text-sm leading-relaxed">{currentQuiz.explanation}</p>
            </div>
            <button
              onClick={nextQuestion}
              className="w-full py-4 bg-primary text-background-dark font-bold rounded-xl hover:shadow-lg transition-all"
            >
              {currentIndex < note.quizzes!.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
