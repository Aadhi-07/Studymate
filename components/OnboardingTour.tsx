
import React, { useState, useEffect } from 'react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: 'right' | 'bottom' | 'center';
}

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const steps: TourStep[] = [
    {
      targetId: 'root',
      title: 'Welcome to StudyMate! 👋',
      description: 'Let\'s take a quick 30-second tour to show you how to master your courses using AI.',
      position: 'center'
    },
    {
      targetId: 'nav-upload',
      title: 'Upload Materials',
      description: 'Start by uploading your PDFs, Word docs, or pasting lecture notes. Our AI will analyze them instantly.',
      position: 'right'
    },
    {
      targetId: 'nav-ask',
      title: 'Chat with your Notes',
      description: 'Have a specific question? Use the AI Chat to get answers directly from your uploaded materials.',
      position: 'right'
    },
    {
      targetId: 'nav-planner',
      title: 'Smart Study Planner',
      description: 'Input your exam date and syllabus to generate a personalized day-by-day study roadmap.',
      position: 'right'
    },
    {
      targetId: 'root',
      title: 'You\'re All Set!',
      description: 'Ready to start? Upload your first document or check out the organic chemistry demo on your dashboard.',
      position: 'center'
    }
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateTargetRect = () => {
      const step = steps[currentStep];
      if (step.targetId === 'root' || step.position === 'center' || isMobile) {
        setTargetRect(null);
        return;
      }
      const element = document.getElementById(step.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [currentStep, isMobile]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden">
      {/* Dimmed Backdrop with Spotlight Hole */}
      <div 
        className="absolute inset-0 bg-background-dark/80 transition-all duration-500"
        style={{
          clipPath: targetRect 
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left - 8}px 100%, ${targetRect.left - 8}px ${targetRect.top - 8}px, ${targetRect.right + 8}px ${targetRect.top - 8}px, ${targetRect.right + 8}px ${targetRect.bottom + 8}px, ${targetRect.left - 8}px ${targetRect.bottom + 8}px, ${targetRect.left - 8}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      ></div>

      {/* Spotlight highlight border */}
      {targetRect && (
        <div 
          className="absolute border-2 border-primary rounded-xl transition-all duration-500 animate-pulse pointer-events-none"
          style={{
            top: targetRect.top - 12,
            left: targetRect.left - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
            boxShadow: '0 0 20px rgba(214, 207, 225, 0.4)'
          }}
        ></div>
      )}

      {/* Tour Card */}
      <div
        className={`absolute glass p-5 sm:p-8 rounded-3xl w-full max-w-sm border-primary/20 shadow-2xl transition-all duration-500 ${
          step.position === 'center' ? 'relative' : ''
        } max-w-[calc(100%-2rem)]`}
        style={targetRect && step.position === 'right' ? {
          left: Math.min(targetRect.right + 24, window.innerWidth - 384),
          top: Math.max(16, targetRect.top + (targetRect.height / 2) - 100)
        } : {}}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <span className="material-icons-round text-sm">explore</span>
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Step {currentStep + 1} of {steps.length}</span>
          </div>
          <button 
            onClick={handleSkip}
            className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase"
          >
            Skip
          </button>
        </div>

        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {step.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-primary/20'
                }`}
              ></div>
            ))}
          </div>
          <button 
            onClick={handleNext}
            className="bg-primary text-background-dark px-6 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}
            <span className="material-icons-round text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
