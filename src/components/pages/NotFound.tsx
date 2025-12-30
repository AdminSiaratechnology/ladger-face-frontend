import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  LayoutDashboard, 
  LogIn, 
  HelpCircle 
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

// TypeScript Interface (Optional if store is already typed)
interface User {
  name?: string;
  // add other user properties
}

const NotFound: React.FC = () => {
  const { user } = useAuthStore() as { user: User | null };
  const navigate = useNavigate();

  const handleAction = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#0f766e] to-[#115e59]">
      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 md:p-10 text-center shadow-2xl overflow-hidden relative">
        
        {/* Subtle Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-400/20 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-400/20 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
              LedgerFace
            </h1>
            <p className="text-teal-100/70 text-xs uppercase tracking-[0.2em] font-medium">
              Smart Accounting & Business
            </p>
          </div>

          {/* Icon/Visual Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center rotate-12 group hover:rotate-0 transition-transform duration-500">
                <Search className="w-12 h-12 text-white/40 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                404
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-10">
            <h2 className="text-2xl font-bold text-white leading-tight">
              Page Not Found
            </h2>
            <p className="text-teal-50/80 text-sm leading-relaxed max-w-[280px] mx-auto">
              Oops! This ledger entry doesn't exist. The page you're looking for was moved or deleted.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleAction}
              className="w-full py-3.5 px-6 bg-white text-[#0f766e] rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:bg-teal-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {user ? (
                <>
                  <LayoutDashboard size={18} />
                  Return to Dashboard
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Login to Account
                </>
              )}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 text-white/70 hover:text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <button 
              onClick={() => navigate('/support')}
              className="flex items-center gap-2 text-xs text-teal-200/50 hover:text-teal-100 transition-colors"
            >
              <HelpCircle size={14} />
              Report this issue
            </button>
            <p className="text-[10px] text-teal-100/30 uppercase tracking-widest">
              © 2025 LedgerFace • Secure Systems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;