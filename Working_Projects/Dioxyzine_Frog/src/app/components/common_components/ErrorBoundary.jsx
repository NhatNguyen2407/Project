import { Component } from 'react';
import * as Sentry from '@sentry/react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Error boundaries must be class components — React does not yet support
// getDerivedStateFromError / componentDidCatch via hooks.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Next render will show the fallback UI instead of the crashed tree.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Send to Sentry (no-op if VITE_SENTRY_DSN isn't configured — see main.jsx)
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo?.componentStack,
        path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      },
    });

    // Keep a console trace too, for local dev without Sentry configured.
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    // Full reload rather than resetting local state — safest way to recover
    // from an unknown crash without risking a loop on the same bad state.
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
          <div className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-[var(--silver-gray)] mb-8">
              We've been notified and are looking into it. Reloading the page usually fixes this.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--primary)] text-white font-bold shadow-[0_0_20px_rgba(139,114,190,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" /> Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}