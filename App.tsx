
import React, { useState, useRef } from 'react';
import { 
  Upload, Sparkles, Trash2, Download, 
  History as HistoryIcon, Loader2, AlertCircle, 
  Palette, RefreshCcw, Image as ImageIcon,
  CheckCircle2, Camera
} from 'lucide-react';
import { GeminiImageService } from './services/geminiService';
import { ImageHistoryItem, AppState } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const service = GeminiImageService.getInstance();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        setOriginalImage(res);
        setCurrentImage(res);
        setHistory([{
          id: 'root',
          url: res,
          prompt: 'Original',
          timestamp: Date.now()
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!currentImage || !finalPrompt.trim()) return;

    setStatus(AppState.EDITING);
    setError(null);

    try {
      const result = await service.editImage(currentImage, finalPrompt);
      const newItem: ImageHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        url: result,
        prompt: finalPrompt,
        timestamp: Date.now()
      };
      setCurrentImage(result);
      setHistory(prev => [newItem, ...prev]);
      if (!customPrompt) setPrompt('');
      setStatus(AppState.IDLE);
    } catch (err: any) {
      setError(err.message);
      setStatus(AppState.ERROR);
    }
  };

  const partChips = [
    { label: 'ব্যাকগ্রাউন্ড', cmd: 'Change the background to ' },
    { label: 'জামা/পোশাক', cmd: 'Change the color of the clothes to ' },
    { label: 'চুল', cmd: 'Change the hair color to ' },
    { label: 'আকাশ', cmd: 'Make the sky look like ' },
    { label: 'চেহারা', cmd: 'Improve the lighting on the face' }
  ];

  return (
    <div className="min-h-screen flex flex-col text-slate-200">
      {/* Navbar */}
      <header className="glass sticky top-0 z-50 px-8 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="pro-logo w-10 h-10 flex items-center justify-center font-black text-white rounded-lg">A</div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">ADIB</h1>
            <p className="text-[9px] font-bold tracking-[0.3em] text-cyan-400">AI PHOTO ARCHITECT</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {originalImage && (
            <button onClick={() => {setOriginalImage(null); setHistory([]);}} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              New Project
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase text-green-500">Live</span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {!originalImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer aspect-video glass rounded-[40px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-500"
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
              <div className="w-20 h-20 bg-white text-black rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-2xl">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Upload Your Vision</h2>
                <p className="text-slate-500 text-sm mt-2">আদিব ভাইয়ের স্টুডিওতে আপনার ছবি নিয়ে আসুন</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative glass rounded-[40px] overflow-hidden border border-white/10 shadow-3xl bg-black/40 min-h-[400px] flex items-center justify-center">
                {status === AppState.EDITING && (
                  <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                    <p className="text-xl font-bold italic tracking-tight">আদিব ভাই এডিট করছেন...</p>
                    <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Processing Pixels</p>
                  </div>
                )}
                <img src={currentImage || ''} className="max-w-full max-h-[70vh] object-contain p-4 transition-transform duration-500" alt="Output" />
                
                <div className="absolute bottom-6 right-6 flex gap-3">
                  <button onClick={() => {const link = document.createElement('a'); link.href = currentImage!; link.download='adib-edit.png'; link.click();}} className="p-4 bg-white text-black rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl">
                    <Download size={20} />
                  </button>
                </div>
              </div>

              {/* Editing Controls */}
              <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {partChips.map((chip) => (
                    <button 
                      key={chip.label}
                      onClick={() => setPrompt(chip.cmd)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/30 transition-all"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="ছবির কোন অংশটি এডিট করবেন? লিখুন..."
                    className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 pt-6 pb-20 text-lg outline-none focus:border-cyan-500/50 transition-all resize-none h-40"
                  />
                  <div className="absolute bottom-4 right-4">
                    <button 
                      onClick={() => handleEdit()}
                      disabled={status === AppState.EDITING || !prompt.trim()}
                      className="px-8 py-4 bg-cyan-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-2 hover:bg-cyan-400 disabled:opacity-30 transition-all shadow-lg"
                    >
                      {status === AppState.EDITING ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      Magic Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-[32px] border border-white/5 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <HistoryIcon size={18} className="text-purple-400" />
              <h3 className="font-bold text-sm uppercase tracking-widest">History</h3>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {history.length === 0 ? (
                <div className="text-center py-10 opacity-20">
                  <ImageIcon size={40} className="mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase">No history yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setCurrentImage(item.url)}
                    className={`w-full group p-2 rounded-2xl border transition-all flex items-center gap-3 ${currentImage === item.url ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                  >
                    <img src={item.url} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="text-left overflow-hidden">
                      <p className="text-[10px] font-bold text-white uppercase truncate">{item.prompt}</p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="glass p-8 rounded-[32px] border border-white/5 text-center">
            <div className="w-14 h-14 pro-logo mx-auto flex items-center justify-center font-black text-xl mb-4">A</div>
            <h4 className="font-black italic uppercase text-lg">Md. Adibul Islam</h4>
            <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mt-1">Sylhet Cantonment Public School & College</p>
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-medium leading-relaxed italic text-slate-400">
              "এই স্টুডিওর প্রতিটি পিক্সেল আদিব ভাইয়ের ডিজিটাল সৃজনশীলতার প্রতীক।"
            </div>
          </div>
        </div>
      </main>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/20">
            <AlertCircle size={18} />
            <span className="text-sm font-bold uppercase tracking-tight">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:opacity-50">✕</button>
          </div>
        </div>
      )}

      <footer className="py-10 px-8 border-t border-white/5 text-center">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">
          Engineered by Md. Adibul Islam &bull; Powered by Gemini 2.5 Flash
        </p>
      </footer>
    </div>
  );
};

export default App;