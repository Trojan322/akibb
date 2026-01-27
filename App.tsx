import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Trash2, 
  Download, 
  History as HistoryIcon, 
  Loader2,
  AlertCircle,
  Share2,
  Heart,
  Palette,
  Award,
  Settings,
  Terminal,
  ExternalLink,
  Info,
  Maximize2
} from 'lucide-react';
import { GeminiImageService } from './services/geminiService';
import { ImageHistoryItem, AppState } from './types';

const translations = {
  en: {
    title: "ADIBUL",
    subtitle: "AI CREATIVE ARCHITECT",
    uploadBtn: "Upload Vision",
    placeholder: "Which part should Adibul edit? (e.g., 'Make my hair blue' or 'Change the background to a beach')",
    applyBtn: "Execute Magic",
    processing: "Reconstructing Pixels...",
    history: "Gallery",
    noHistory: "No works yet",
    newProject: "Reset Canvas",
    compare: "Compare",
    creator: "Lead AI Architect",
    school: "Sylhet Cantonment Public School and College",
    status: "System Online",
    share: "Share Artifact",
    footer: "Engineered by Md. Adibul Islam.",
    keyMissing: "API Key Required",
    keyDesc: "To activate Adibul's AI features, you need a Google Gemini API Key."
  },
  bn: {
    title: "আদিবুল",
    subtitle: "ডিজিটাল জাদুর কারিগর",
    uploadBtn: "ছবি আপলোড করুন",
    placeholder: "আদিব ভাইকে বলুন কোন অংশটি এডিট করবেন? (যেমন: 'চশমাটা নীল করো' বা 'পেছনের মানুষটি সরিয়ে দাও')",
    applyBtn: "ম্যাজিক শুরু হোক",
    processing: "আদিব ভাই কাজ করছেন...",
    history: "সৃষ্টির গ্যালারি",
    noHistory: "এখনো কিছু তৈরি হয়নি",
    newProject: "নতুন প্রজেক্ট",
    compare: "আসল ছবি",
    creator: "লিড ডিজিটাল রূপকার",
    school: "সিলেট ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ",
    status: "অনলাইন সিস্টেম",
    share: "সবার সাথে শেয়ার",
    footer: "এমডি. আদিবুল ইসলাম এটি তৈরি করেছেন।"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'bn'>('bn');
  const t = translations[lang];

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageService = GeminiImageService.getInstance();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setOriginalImage(base64);
        setCurrentImage(base64);
        setHistory([{
          id: Math.random().toString(36).substr(2, 9),
          url: base64,
          prompt: lang === 'en' ? 'Original' : 'মূল ছবি',
          timestamp: Date.now()
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!currentImage || !prompt.trim()) return;
    setStatus(AppState.EDITING);
    setErrorMessage(null);

    try {
      const editedBase64 = await imageService.editImagePart(currentImage, prompt);
      const newItem: ImageHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        url: editedBase64,
        prompt: prompt,
        timestamp: Date.now()
      };
      setCurrentImage(editedBase64);
      setHistory(prev => [newItem, ...prev]);
      setPrompt('');
      setStatus(AppState.IDLE);
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus(AppState.ERROR);
    }
  };

  const resetAll = () => {
    setOriginalImage(null);
    setCurrentImage(null);
    setHistory([]);
    setPrompt('');
    setStatus(AppState.IDLE);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">
      <nav className="glass sticky top-0 z-[60] border-b border-white/5 px-8 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={resetAll}>
            <div className="pro-logo w-10 h-10 flex items-center justify-center text-white font-black text-lg">A</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">{t.title}</h1>
              <p className="text-[8px] text-slate-500 font-bold tracking-[0.3em] uppercase">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </nav>

      <main className="max-w-screen-2xl mx-auto px-6 py-10 flex-grow w-full">
        {errorMessage && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4">
            <AlertCircle className="text-red-500 shrink-0" />
            <p className="text-red-200 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {!originalImage ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="group relative w-full max-w-lg py-20 bg-slate-900/40 rounded-[56px] border border-white/5 flex flex-col items-center gap-6 overflow-hidden transition-all hover:scale-[1.02] shadow-2xl">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-950 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                <Upload size={36} />
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-black uppercase italic tracking-tighter text-white">{t.uploadBtn}</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">ADIBUL AI STUDIO 2025</p>
              </div>
            </button>
            
            <div className="mt-20 flex flex-col items-center">
               <div className="flex items-center gap-3 mb-6 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                 <Award size={14} className="text-cyan-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.creator}</span>
               </div>
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Md. Adibul Islam</h3>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic mt-2">{t.school}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <div className="relative glass rounded-[56px] overflow-hidden border border-white/10 shadow-3xl bg-slate-900/20 flex items-center justify-center min-h-[500px]">
                {status === AppState.EDITING && (
                  <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
                    <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mb-6" />
                    <h3 className="text-3xl font-black text-white uppercase italic">{t.processing}</h3>
                    <p className="text-slate-400 mt-4 italic font-medium">আদিব ভাই আপনার ছবির নির্দিষ্ট অংশগুলো সাজাচ্ছেন...</p>
                  </div>
                )}
                
                <img 
                  src={showOriginal ? originalImage : (currentImage || '')} 
                  alt="Workspace" 
                  className="max-w-full max-h-[70vh] object-contain p-6 rounded-[48px] transition-all duration-500" 
                />

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <button 
                    onMouseDown={() => setShowOriginal(true)} 
                    onMouseUp={() => setShowOriginal(false)} 
                    onMouseLeave={() => setShowOriginal(false)}
                    className="px-8 py-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                  >
                    {t.compare}
                  </button>
                  <button onClick={() => { const link = document.createElement('a'); link.href = currentImage || ''; link.download = `ADIBUL-${Date.now()}.png`; link.click(); }} className="p-4 bg-white text-slate-950 rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-xl">
                    <Download size={24} />
                  </button>
                </div>
              </div>

              <div className="glass p-10 rounded-[48px] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20"><Palette size={24} className="text-cyan-400" /></div>
                  <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter">{lang === 'en' ? "EDIT SPECIFIC PARTS" : "অংশ অনুযায়ী এডিট"}</h3>
                </div>
                <textarea 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder={t.placeholder} 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-3xl p-8 text-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/40 outline-none transition-all h-32 text-xl font-medium resize-none placeholder:text-slate-700" 
                />
                <div className="flex items-center justify-between mt-8">
                  <button onClick={resetAll} className="p-5 text-slate-600 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"><Trash2 size={28} /></button>
                  <button onClick={handleEdit} disabled={!prompt.trim() || status === AppState.EDITING} className="px-12 py-5 bg-white text-slate-950 disabled:opacity-30 rounded-2xl font-black uppercase tracking-widest text-lg flex items-center gap-3 transition-all active:scale-95 shadow-2xl">
                    {status === AppState.EDITING ? <Loader2 className="animate-spin" /> : <Sparkles />} {t.applyBtn}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="glass rounded-[40px] p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-8"><HistoryIcon className="text-purple-400" /><h3 className="font-black text-xl text-white uppercase italic tracking-tighter">{t.history}</h3></div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="py-16 text-center opacity-20"><HistoryIcon className="mx-auto mb-4" size={32} /><p className="text-[10px] font-black uppercase tracking-widest">{t.noHistory}</p></div>
                  ) : (
                    history.map((item) => (
                      <button key={item.id} onClick={() => setCurrentImage(item.url)} className={`w-full p-3 rounded-2xl border flex gap-4 items-center transition-all ${currentImage === item.url ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                        <img src={item.url} alt="H" className="w-14 h-14 rounded-lg object-cover" />
                        <div className="text-left overflow-hidden">
                          <p className="text-[10px] font-black text-white uppercase truncate tracking-tight">{item.prompt}</p>
                          <p className="text-[8px] text-slate-500 font-bold mt-1">{new Date(item.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="glass rounded-[40px] p-8 border border-white/10 flex flex-col items-center text-center">
                 <div className="w-16 h-16 pro-logo flex items-center justify-center text-white font-black text-2xl shadow-xl mb-6">A</div>
                 <h4 className="text-white font-black text-lg uppercase italic tracking-tighter">Md. Adibul Islam</h4>
                 <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest italic mt-2 leading-relaxed">{t.school}</p>
                 <div className="mt-8 flex gap-4">
                   <div className="p-3 bg-white/5 rounded-xl text-slate-400 cursor-pointer hover:text-white transition-colors"><Share2 size={18} /></div>
                   <div className="p-3 bg-white/5 rounded-xl text-slate-400 cursor-pointer hover:text-pink-500 transition-colors"><Heart size={18} /></div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-12 border-t border-white/5 bg-black/40">
        <div className="max-w-screen-2xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <div className="pro-logo w-10 h-10 flex items-center justify-center text-white font-black text-lg">A</div>
              <div><p className="text-white font-black uppercase italic leading-none">{t.title}</p><p className="text-slate-600 text-[8px] font-bold uppercase tracking-[0.3em]">{t.footer}</p></div>
           </div>
           <div className="text-[9px] text-slate-700 font-black uppercase tracking-[0.4em] text-center md:text-right">
              SYLHET CANTONMENT PUBLIC SCHOOL & COLLEGE<br/>POWERED BY GEMINI 2.5 FLASH IMAGE
           </div>
        </div>
      </footer>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default App;