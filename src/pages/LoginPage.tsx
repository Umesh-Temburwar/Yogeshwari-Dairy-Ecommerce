import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/store/useAuthStore';
import { triggerHaptic } from '@/utils/haptics';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    sendOtp,
    loginWithOtp,
    loginWithEmail,
    registerUser,
    clearError,
  } = useAuthStore();

  // Mode: 'phone' | 'email' | 'register'
  const [authMode, setAuthMode] = useState<'phone' | 'email' | 'register'>('phone');

  // Phone Auth State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [resendActive, setResendActive] = useState(false);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendActive(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMsg(null);
    clearError();

    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10 || !/^[6-9]/.test(clean)) {
      setValidationMsg('Please enter a valid 10-digit Indian mobile number.');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');
    const res = await sendOtp(clean);
    if (res.success) {
      setOtpSent(true);
      setCountdown(30);
      setResendActive(false);
      triggerHaptic('success');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMsg(null);
    clearError();

    if (otp.length < 4) {
      setValidationMsg('Please enter the OTP sent to your phone (Demo: 123456).');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');
    const res = await loginWithOtp(phone, otp, customerName);
    if (res.success) {
      triggerHaptic('success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      navigate(-1);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMsg(null);
    clearError();

    if (!email || !password) {
      setValidationMsg('Please enter both email and password.');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');
    const res = await loginWithEmail(email, password);
    if (res.success) {
      triggerHaptic('success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      navigate(-1);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMsg(null);
    clearError();

    if (!regName.trim()) {
      setValidationMsg('Please enter your full name.');
      triggerHaptic('warning');
      return;
    }
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setValidationMsg('Please enter a valid 10-digit mobile number.');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');
    const res = await registerUser({
      name: regName,
      phone: cleanPhone,
      email: regEmail,
      password: regPassword,
    });

    if (res.success) {
      triggerHaptic('success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      navigate(-1);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-emerald-50/60 via-[#F4F6F8] to-[#F4F6F8] py-8 sm:py-12 px-3 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-[#0C831F] to-[#0A6D19] p-6 text-white text-center relative">
          <Link
            to="/"
            onClick={() => triggerHaptic('light')}
            className="absolute left-4 top-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-md">
            <span className="text-3xl">🥛</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Yogeshwari Dairy
          </h1>
          <p className="text-xs text-emerald-100 font-medium mt-0.5">
            Fresh Milk, Pure Ghee & Sweets Delivery in Ambajogai
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold bg-white/15 backdrop-blur-xs py-1 px-3 rounded-full mx-auto w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>MongoDB Atlas Secured Login</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setAuthMode('phone');
              setValidationMsg(null);
              clearError();
            }}
            className={`flex-1 py-3 px-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'phone'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile (OTP)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setAuthMode('email');
              setValidationMsg(null);
              clearError();
            }}
            className={`flex-1 py-3 px-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'email'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setAuthMode('register');
              setValidationMsg(null);
              clearError();
            }}
            className={`flex-1 py-3 px-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>New Sign Up</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {(error || validationMsg) && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-medium flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{validationMsg || error}</span>
            </div>
          )}

          {/* TAB 1: PHONE LOGIN */}
          {authMode === 'phone' && (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-extrabold text-xs text-slate-500 bg-slate-100 py-1 px-1.5 rounded-lg border border-slate-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      autoFocus
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full text-sm pl-16 pr-3 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    We will send an instant SMS OTP for login & order verification.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Sending OTP...' : 'Continue with OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">OTP sent to</span>
                    <span className="font-extrabold text-slate-900">+91 {phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    className="w-full text-center tracking-widest text-lg font-black py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-[11px] text-emerald-700 font-bold">
                      💡 Dev test OTP: <code className="bg-emerald-100 px-1 py-0.5 rounded">123456</code>
                    </span>
                    {resendActive ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Resend in {countdown}s
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Your Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name for delivery slips"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying...' : 'Verify & Sign In'}</span>
                </button>
              </form>
            )
          )}

          {/* TAB 2: EMAIL LOGIN */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-extrabold text-slate-800 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-800 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-xs pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Don't have an account? Sign up now &rarr;
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: REGISTER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 animate-fade-in">
              <div>
                <label className="text-xs font-extrabold text-slate-800 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Umesh Temburwar"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-800 block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-800 block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. umesh@example.com"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-800 block mb-1">
                  Create Password (Optional)
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password for email login"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'Creating Account...' : 'Create Account & Start Ordering'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('phone')}
                  className="text-xs text-slate-600 font-bold hover:underline"
                >
                  Already have an account? Log in &rarr;
                </button>
              </div>
            </form>
          )}

          {/* Benefits Footer */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Fast Doorstep Delivery in Ambajogai (20–40 mins)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Save & manage multiple addresses for home & shop</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Live order tracking & digital delivery receipts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
