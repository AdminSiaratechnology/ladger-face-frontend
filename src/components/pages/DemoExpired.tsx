import { useAuthStore } from "../../../store/authStore"

export default function DemoExpired() {
  const logout = useAuthStore((state) => state.logout);

  const handleGoToLogin = () => {
    logout();               // 🧨 Clears user from Zustand
    window.location.href = "/login";  // Now login will not redirect back
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600">Trial Period Ended</h1>
        <p className="text-slate-600 mt-3 text-sm">
          Your demo access has expired. Please contact support or upgrade to a premium plan to continue using the platform.
        </p>
        <button
          onClick={handleGoToLogin}
          className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
