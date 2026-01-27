
// CRITICAL: Robust polyfill for process.env
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
  (window as any).process.env = (window as any).process.env || {};
}

import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical Error: Root element not found");
}

interface Props { children?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

// Using React.Component explicitly ensures TypeScript correctly identifies this.props and this.state
class GlobalErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Adibul Studio Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950 text-white">
          <div className="max-w-md glass p-10 rounded-[40px] border border-red-500/20 text-center">
            <h1 className="text-2xl font-black mb-4 text-red-500 uppercase italic">System Fault</h1>
            <p className="text-slate-400 mb-8 italic">আদিব ভাইয়ের স্টুডিওতে লোডিং সমস্যা হয়েছে। দয়া করে পেজটি রিফ্রেশ করুন।</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase">Restart Studio</button>
          </div>
        </div>
      );
    }
    // Fixed: this.props is now correctly recognized through React.Component<Props, State>
    return this.props.children;
  }
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);