import  { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../App';
import { 
  Shield, 
  Mail, 
  Phone, 
  Fingerprint, 
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
  Globe
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
 import { useAuthStore } from '../../../store/authStore'; 

export function Login() {

  // const { user, login, loading } = useAuth();
  const { login, isLoading:loading ,user} = useAuthStore()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  // const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('email');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  console.log(user,'usuario en login');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailLogin = async (e:any) => {
    e.preventDefault();
    // setError('');
    if (loginAttempts >= 3) {
      // setError('Too many failed attempts. Please try again later.');
      return;
    }
    const success = await login({email, password});
     if (success) {
      toast.success('Login successful!');
    } else {
      setLoginAttempts(prev => prev + 1);
      setError('Invalid credentials. Please try again.');
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleOTPLogin = (e:any) => {
    e.preventDefault();
    if (otp === '123456') {
      toast.success('OTP verified successfully!');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    alert('Google login would be implemented with OAuth integration');
  };

  const handleBiometricLogin = () => {
    alert('Biometric login would use device authentication APIs');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Panel - Dashboard Preview & Branding */}
          <div className="bg-gradient-to-br from-teal-600 via-indigo-600 to-indigo-700 p-10 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 translate-y-16"></div>
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/40 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-500"></div>
            
            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 border border-white/30">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">BMS</h1>
                  <p className="text-white/80 text-sm">Business Management</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                  Welcome to Your Business Dashboard
                </h2>
                <p className="text-white/90 mb-8 text-lg">
                  Monitor your business performance with real-time analytics and comprehensive management tools.
                </p>

                {/* Dashboard Preview Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-white/90" />
                      <span className="text-xs text-emerald-200 bg-emerald-400/20 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-white text-lg font-bold">12,430</p>
                    <p className="text-white/80 text-sm">Total Users</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-5 h-5 text-white/90" />
                      <span className="text-xs text-amber-200 bg-amber-400/20 px-2 py-1 rounded-full">+8%</span>
                    </div>
                    <p className="text-white text-lg font-bold">$54,300</p>
                    <p className="text-white/80 text-sm">Revenue</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-5 h-5 text-white/90" />
                      <span className="text-xs text-green-200 bg-green-400/20 px-2 py-1 rounded-full">Online</span>
                    </div>
                    <p className="text-white text-lg font-bold">1,210</p>
                    <p className="text-white/80 text-sm">Active Sessions</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <Globe className="w-5 h-5 text-white/90" />
                      <span className="text-xs text-blue-200 bg-blue-400/20 px-2 py-1 rounded-full">-2%</span>
                    </div>
                    <p className="text-white text-lg font-bold">28%</p>
                    <p className="text-white/80 text-sm">Bounce Rate</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white">Real-time Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white">Multi-role Access Control</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white">Advanced Business Intelligence</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-white/90 text-sm font-medium">Enterprise Grade Security</span>
                </div>
                <p className="text-white/70 text-sm">
                  Trusted by businesses worldwide for secure, scalable management solutions
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="p-10 flex flex-col justify-center bg-white">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h1>
              <p className="text-slate-600">Access your business management dashboard</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8 bg-slate-100 p-1 rounded-xl h-14">
                <TabsTrigger 
                  value="email" 
                  className="data-[state=active]:bg-white data-[state=active]:text-teal-500 data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-indigo-600 data-[state=active]:shadow-sm rounded-lg py-3 px-2 flex items-center justify-center gap-2 transition-all duration-200 font-medium"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="otp" 
                  className="data-[state=active]:bg-white data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-indigo-600 data-[state=active]:shadow-sm rounded-lg py-3 px-2 flex items-center justify-center gap-2 transition-all duration-200 font-medium"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">OTP</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="social" 
                  className="data-[state=active]:bg-white data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-indigo-600 data-[state=active]:shadow-sm rounded-lg py-3 px-2 flex items-center justify-center gap-2 transition-all duration-200 font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden sm:inline">Google</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="biometric" 
                  className="data-[state=active]:bg-white data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-indigo-600 data-[state=active]:shadow-sm rounded-lg py-3 px-2 flex items-center justify-center gap-2 transition-all duration-200 font-medium"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span className="hidden sm:inline">Bio</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-slate-700 mb-3 block font-medium">Email Address</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 bg-slate-50 border-slate-200 focus:border-transparent focus:ring-2 focus:ring-gradient-to-r focus:from-teal-600 focus:to-indigo-600 focus:bg-white transition-all duration-200 rounded-xl"
                        style={{
                          '--tw-ring-color': 'transparent',
                          '--tw-ring-offset-shadow': '0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
                          '--tw-ring-shadow': 'inset 0 0 0 1px rgb(15 118 110 / 0.5), 0 0 0 calc(2px + var(--tw-ring-offset-width)) rgb(79 70 229 / 0.3)'
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-slate-700 mb-3 block font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 bg-slate-50 border-slate-200 focus:border-transparent focus:ring-2 focus:bg-white transition-all duration-200 rounded-xl"
                        style={{
                          '--tw-ring-color': 'transparent',
                          '--tw-ring-offset-shadow': '0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
                          '--tw-ring-shadow': 'inset 0 0 0 1px rgb(15 118 110 / 0.5), 0 0 0 calc(2px + var(--tw-ring-offset-width)) rgb(79 70 229 / 0.3)'
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="text-right">
                    <button className="text-sm bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent hover:from-teal-700 hover:to-indigo-700 hover:underline transition-all duration-200 font-medium" type="button">
                      Forgot your password?
                    </button>
                  </div>
                  <Button 
                    onClick={handleEmailLogin}
                    className="w-full h-14 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In to Dashboard'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="otp" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="phone" className="text-slate-700 mb-3 block font-medium">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-12 h-14 bg-slate-50 border-slate-200 focus:border-transparent focus:ring-2 focus:bg-white transition-all duration-200 rounded-xl"
                        style={{
                          '--tw-ring-color': 'transparent',
                          '--tw-ring-offset-shadow': '0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
                          '--tw-ring-shadow': 'inset 0 0 0 1px rgb(15 118 110 / 0.5), 0 0 0 calc(2px + var(--tw-ring-offset-width)) rgb(79 70 229 / 0.3)'
                        }}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-12 border-slate-200 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent hover:from-teal-700 hover:to-indigo-700 hover:bg-slate-50 transition-all duration-200 rounded-xl border-2 hover:border-slate-300"
                  >
                    Send OTP Code
                  </Button>
                  <div>
                    <Label htmlFor="otp" className="text-slate-700 mb-3 block font-medium">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="h-14 bg-slate-50 border-slate-200 focus:border-transparent focus:ring-2 focus:bg-white text-center text-lg tracking-widest transition-all duration-200 rounded-xl"
                      style={{
                        '--tw-ring-color': 'transparent',
                        '--tw-ring-offset-shadow': '0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
                        '--tw-ring-shadow': 'inset 0 0 0 1px rgb(15 118 110 / 0.5), 0 0 0 calc(2px + var(--tw-ring-offset-width)) rgb(79 70 229 / 0.3)'
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleOTPLogin}
                    className="w-full h-14 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Verify & Sign In
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-14 border-slate-200 text-slate-700 flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 rounded-xl border-2"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                <div className="text-center">
                  <p className="text-slate-500 text-sm">
                    Single sign-on with your Google workspace account
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="biometric" className="space-y-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-100 via-indigo-100 to-indigo-200 rounded-2xl mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 to-indigo-600/10 rounded-2xl"></div>
                    <Fingerprint className="w-10 h-10 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent relative z-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Biometric Authentication</h3>
                  <p className="text-slate-600 mb-6">
                    Use your device's fingerprint or face recognition for secure access
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 border-slate-200 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent hover:from-teal-700 hover:to-indigo-700 hover:bg-slate-50 transition-all duration-200 rounded-xl font-semibold border-2 hover:border-slate-300"
                    onClick={handleBiometricLogin}
                  >
                    Authenticate with Biometric
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <p className="text-slate-600 text-sm text-center">
                <span className="font-semibold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">Demo Access:</span><br />
                <span className="font-mono bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent text-xs">admin@company.com</span> / <span className="font-mono bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent text-xs">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}