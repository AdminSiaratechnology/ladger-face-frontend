import React, { useState } from "react";
import { AlertCircle, Smartphone, LogOut, Shield } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
export default function DeviceLogoutModal() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const { newDeviceLogin, logout, setNewDeviceLogin } = useAuthStore();

  const handleLogout = async () => {
    setIsLoggingOut(true);
   await logout();
    console.log("User logged out from all devices");

    setIsLoggingOut(false);
    setNewDeviceLogin(false);
  };

  if (!newDeviceLogin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 animate-pulse"></div>
        <div className="relative p-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-orange-500 p-4 rounded-full">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Security Alert
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-3">
            Login Detected on Another Device
          </h2>

          <p className="text-center text-slate-300 mb-6 leading-relaxed">
            Your account is currently active on another device. For security
            reasons, you need to log out from this session.
          </p>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">
                  Security Notice
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Only one active session is allowed at a time. This helps
                  protect your account from unauthorized access.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoggingOut ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Logging Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>Logout & Continue</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-500 mt-4">
            You'll be redirected to the login page after logout
          </p>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>
    </div>
  );
}
