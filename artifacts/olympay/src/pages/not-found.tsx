import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-6 border border-rose-500/20">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">404 - Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex justify-center items-center px-6 py-3 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all w-full"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
