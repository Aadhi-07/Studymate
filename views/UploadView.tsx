
import React, { useState, useRef } from 'react';
import { StudyNote } from '../types';

interface UploadViewProps {
  onUpload: (note: StudyNote) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onUpload }) => {
  const [fileText, setFileText] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    
    // For TXT files, we can actually read the content
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileText(e.target?.result as string || '');
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, in a real app we'd send to a backend parser.
      // Here we simulate successful extraction of a placeholder.
      setFileText(`Simulated content extracted from ${file.name}. In a production environment, this text would be parsed using libraries like PDF.js or Mammoth.js on the client or specialized extractors on the server.`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSimulatedUpload = async () => {
    if (!fileText || !fileName) return;
    setUploading(true);
    setProgress(0);

    const stages = [
      { p: 20, s: 'Reading file data...' },
      { p: 50, s: 'Analyzing content structure...' },
      { p: 80, s: 'Generating AI context embeddings...' },
      { p: 100, s: 'Finalizing document...' }
    ];

    for (const stage of stages) {
      setStatus(stage.s);
      let currentP = progress;
      while (currentP < stage.p) {
        currentP += Math.random() * 5;
        if (currentP > stage.p) currentP = stage.p;
        setProgress(currentP);
        await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
      }
    }
    
    const newNote: StudyNote = {
      id: Date.now().toString(),
      name: fileName,
      content: fileText,
      timestamp: 'Just now',
      pages: Math.ceil(fileText.length / 500) || 1,
      type: fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : (fileName.toLowerCase().endsWith('.docx') ? 'docx' : 'txt')
    };
    
    onUpload(newNote);
    setUploading(false);
    setProgress(0);
    setStatus('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Add Study Materials</h2>
        <p className="text-slate-400">Upload your notes, textbooks, or research papers to start learning smarter.</p>
      </div>

      <div className="glass p-4 sm:p-8 rounded-2xl space-y-6 relative overflow-hidden">
        {uploading && (
          <div className="absolute inset-0 z-20 bg-background-dark/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 transition-all animate-in fade-in duration-300">
            <div className="w-full max-w-md space-y-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-primary font-bold text-sm uppercase tracking-widest animate-pulse">
                  {status}
                </span>
                <span className="text-white font-mono text-lg">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-primary shadow-[0_0_15px_rgba(214,207,225,0.5)] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-slate-500 text-xs mt-4">
                Please don't close this tab while the AI processes your materials.
              </p>
            </div>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 transition-all text-center cursor-pointer group ${
            dragActive ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-primary/20 hover:border-primary/50 bg-primary/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            multiple={false} 
            accept=".pdf,.docx,.txt"
            onChange={handleChange}
          />
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="material-icons-round text-primary text-3xl">upload_file</span>
          </div>
          {fileName ? (
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold text-white break-all">{fileName}</p>
              <p className="text-sm text-primary">File ready for processing</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold text-white">Drag and drop your file here</p>
              <p className="text-sm text-slate-500">or click to browse from your device</p>
            </div>
          )}
          <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest">Supports PDF, DOCX, TXT (Max 50MB)</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Document Name</label>
          <input
            type="text"
            className="w-full bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="e.g. Computer Science Lecture 1"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Extracted / Pasted Content</label>
          <textarea
            className="w-full bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-white h-48 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            placeholder="The content from your file will appear here, or you can paste text directly..."
            value={fileText}
            onChange={(e) => setFileText(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-primary/10">
          <button
            onClick={handleSimulatedUpload}
            disabled={!fileText || !fileName || uploading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-10 py-3 rounded-xl font-bold transition-all ${
              !fileText || !fileName || uploading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-primary text-background-dark hover:shadow-[0_0_20px_rgba(215,208,226,0.4)]'
            }`}
          >
            <span className={`material-icons-round ${uploading ? 'animate-spin' : ''}`}>
              {uploading ? 'sync' : 'publish'}
            </span>
            {uploading ? 'Processing...' : 'Process Document'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl text-center space-y-2">
          <span className="material-icons-round text-primary text-3xl">summarize</span>
          <h4 className="font-bold">Auto-Summaries</h4>
          <p className="text-xs text-slate-500">Condense hours of reading into minutes.</p>
        </div>
        <div className="glass p-6 rounded-xl text-center space-y-2">
          <span className="material-icons-round text-primary text-3xl">psychology</span>
          <h4 className="font-bold">Deep RAG Q&A</h4>
          <p className="text-xs text-slate-500">Ask anything from your documents.</p>
        </div>
        <div className="glass p-6 rounded-xl text-center space-y-2">
          <span className="material-icons-round text-primary text-3xl">quiz</span>
          <h4 className="font-bold">Smart Quizzes</h4>
          <p className="text-xs text-slate-500">Master the material with MCQs.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadView;
