
if (typeof window !== 'undefined') {
  (window as any).process = { env: { API_KEY: (window as any).process?.env?.API_KEY || '' } };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-950 text-white p-10 text-center">
          <div>
            <h1 className="text-4xl font-black mb-4">STUDIO CRASHED</h1>
            <p className="text-slate-400 mb-8">আদিব ভাই স্টুডিও ঠিক করছেন। দয়া করে রিফ্রেশ দিন।</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-bold rounded-xl">Restart</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}