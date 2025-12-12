import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent } from "../ui/tabs";

import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  User,
  Building,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Activity,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import CompanySelectorModal from "../customComponents/CompanySelectorModal";
import { useCompanyStore } from "../../../store/companyStore";
// Add this import at the top_
import ForgotPasswordModal from "../Modals/ForgotPasswordModal"; // adjust path if needed_

export default function Login() {
  const deviceId = navigator.userAgent ;

localStorage.setItem("deviceId",deviceId)


  const { login, isLoading: loading, user } = useAuthStore();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    fetchCompanies,
    companies,
    defaultSelected,
    loading: companyLoading,
  } = useCompanyStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const navigate = useNavigate();
  const [loadCompany, setLoadCompany] = useState(false);

  useEffect(() => {
    const fetchCompaniesAsync = async () => {
      await fetchCompanies("", 1, 10);
      setLoadCompany(true);
    };
    if (user) {
      fetchCompaniesAsync();
    }
  }, [user, navigate, fetchCompanies]);

  const fetchOtherAsync = async () => {
    const { defaultSelected } = useCompanyStore.getState(); // Use getState() to get the latest store value immediately_
    const companyId = defaultSelected?._id;
    if (!companyId) return;

    setShowCompanyPopup(false);
  };

  useEffect(() => {
    if (loadCompany && !companyLoading && user) {
      if (companies.length === 1) {
        const singleCompany = companies[0];
        setDefaultCompany(singleCompany);
        navigate("/");
      } else if (companies.length > 1) {
        setShowCompanyPopup(true);
      } else {
        navigate("/company");
      }
    }
  }, [companyLoading, user, loadCompany, companies]);

  const setDefaultCompany = useCompanyStore((state) => state.setDefaultCompany);
  const handleSelect = (company) => {
    setDefaultCompany(company);
    setShowCompanyPopup(false);
    navigate("/");
  };
  const handleEmailLogin = async (e: any) => {
    e.preventDefault();
    setError("");
    if (loginAttempts >= 3) {
      setError("Too many failed attempts. Please try again later.");
      return;
    }
    const success = await login({ email, password, deviceId });
    
    if (success) {
       const { user } = useAuthStore.getState(); // latest user data

    // 🔥 DEMO EXPIRY CHECK HERE
    console.log(user)
    if (user?.isDemo === true && user?.demoExpiry) {
      const today = new Date();
      const expiryDate = new Date(user.demoExpiry);

      if (expiryDate < today) {
        navigate("/demo-expired");
        return; //  stop flow
      }
    }
      toast.success("Login successful!");
      if (!companyLoading && companies.length === 0) {
        // navigate("/company");_
      }
      // setShowCompanyPopup(true);_
    } else {
      setLoginAttempts((prev) => prev + 1);
      setError("Invalid credentials. Please try again.");
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Left Panel - Dashboard Preview & Branding */}
            <div className="hidden sm:block bg-gradient-to-br from-teal-600 via-indigo-600 to-indigo-700 p-3 md:p-4 relative overflow-hidden">
              {/* Decorative Elements */}
              {/* <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 z-10"></div>
<div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-12 translate-y-12 z-10"></div>
<div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse z-10"></div>
<div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-1000 z-10"></div>
<div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-500 z-10"></div> */}

              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="w-5 md:w-10 h-5 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 border border-white/30">
                    <Building className="w-3 md:w-5 h-3 md:h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-white">
                      Ledger Face
                    </h1>
                    <p className="text-white/80 text-xs">Business Management</p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-white mb-3 leading-tight">
                    Welcome to Your Business Dashboard
                  </h2>
                  <p className="text-white/90 mb-3 md:mb-6 text-xs">
                    Monitor your business performance with real-time analytics
                    and comprehensive management tools.
                  </p>

                  {/* Dashboard Preview Cards */}
                  <div className="hidden md:grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-1">
                        <Users className="w-3 h-3 text-white/90" />
                        <span className="text-[9px] text-emerald-200 bg-emerald-400/20 px-1 py-0.5 rounded-full">
                          +12%
                        </span>
                      </div>
                      <p className="text-white text-base font-bold">12,430</p>
                      <p className="text-white/80 text-xs">Total Users</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-1">
                        <DollarSign className="w-3 h-3 text-white/90" />
                        <span className="text-xs text-amber-200 bg-amber-400/20 px-1 py-0.5 rounded-full">
                          +8%
                        </span>
                      </div>
                      <p className="text-white text-base font-bold">$54,300</p>
                      <p className="text-white/80 text-xs">Revenue</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-1">
                        <Activity className="w-4 h-4 text-white/90" />
                        <span className="text-xs text-green-200 bg-green-400/20 px-1 py-0.5 rounded-full">
                          Online
                        </span>
                      </div>
                      <p className="text-white text-base font-bold">1,210</p>
                      <p className="text-white/80 text-xs">Active Sessions</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-1">
                        <Globe className="w-4 h-4 text-white/90" />
                        <span className="text-xs text-blue-200 bg-blue-400/20 px-1 py-0.5 rounded-full">
                          -2%
                        </span>
                      </div>
                      <p className="text-white text-base font-bold">28%</p>
                      <p className="text-white/80 text-xs">Bounce Rate</p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="hidden md:block space-y-1 md:space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/30">
                        <BarChart3 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-xs">
                        Real-time Analytics Dashboard
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/30">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-xs">
                        Multi-role Access Control
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/30">
                        <TrendingUp className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-xs">
                        Advanced Business Intelligence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="hidden md:block mt-6">
                  <div className="flex items-center space-x-1 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span className="text-white/90 text-xs font-medium">
                      Enterprise Grade Security
                    </span>
                  </div>
                  <p className="text-white/70 text-xs">
                    Trusted by businesses worldwide for secure, scalable
                    management solutions
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="p-3 md:p-8 flex flex-col justify-center bg-white">
              <div className="mb-3 md:mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">
                  Welcome Back
                </h1>
                <p className="text-slate-600 text-xs">
                  Access your business management dashboard
                </p>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="email" className="space-y-3 md:space-y-4">
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-slate-700 mb-1 md:mb-2 block font-medium text-xs"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-10 md:h-12 bg-slate-50 border-slate-200 focus:border-transparent focus:ring-2 focus:ring-gradient-to-r focus:from-teal-600 focus:to-indigo-600 focus:bg-white transition-all duration-200 rounded-lg text-sm"
                          style={{
                            "--tw-ring-color": "transparent",
                            "--tw-ring-offset-shadow":
                              "0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
                            "--tw-ring-shadow":
                              "inset 0 0 0 1px rgb(15 118 110 / 0.5), 0 0 0 calc(2px + var(--tw-ring-offset-width)) rgb(79 70 229 / 0.3)",
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="password"
                        className="text-slate-700 mb-1 md:mb-2 block font-medium text-xs bg-primary-500"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-10 md:h-12 bg-slate-50 border-slate-200 focus:border-transparent focus:ring-2 focus:bg-white transition-all duration-200 rounded-lg text-sm"
                          style={{
                            "--tw-ring-color": "transparent",
                            "--tw-ring-offset-shadow":
                              "0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
                            "--tw-ring-shadow":
                              "inset 0 0 0 1px rgb(15 118 110 / 0.5), 0 0 0 calc(2px + var(--tw-ring-offset-width)) rgb(79 70 229 / 0.3)",
                          }}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <Alert
                        variant="destructive"
                        className="bg-red-50 border-red-200 rounded-lg"
                      >
                        <AlertDescription className="text-red-700 text-xs">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="text-right">
                      <div className="text-right">
                        <button
                          className="text-xs bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent hover:from-teal-700 hover:to-indigo-700 hover:underline transition-all duration-200 font-medium"
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handleEmailLogin}
                      className="w-full h-10 md:h-12 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white flex items-center justify-center gap-1 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In to Dashboard"}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
      {companies && (
        <CompanySelectorModal
          open={showCompanyPopup}
          companies={companies}
          isLogin={true}
          defaultSelected={defaultSelected}
          onSelect={handleSelect}
          onClose={() => setShowCompanyPopup(false)}
          onConfirmNavigate={fetchOtherAsync} // Pass the function directly (no arrow function to avoid stale closure)_
        />
      )}
    </>
  );
}
