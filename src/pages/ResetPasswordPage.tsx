import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col justify-between text-[#17152F] font-sans antialiased">
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#6425E8] to-[#8B5CF6] text-white shadow-md shadow-[#6425E8]/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#17152F]">
            CreatorBridge
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#EAE8F2] shadow-xl shadow-[#6425E8]/5 p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152F] tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs sm:text-sm text-[#77758B]">
              Enter your new secure password below
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#16A36A] mx-auto" />
              <h3 className="text-sm font-bold text-green-900">Password Updated!</h3>
              <p className="text-xs text-green-700">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#17152F]">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9E9CAB] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#EAE8F2] bg-white text-xs text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#17152F]">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9E9CAB] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EAE8F2] bg-white text-xs text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#6425E8]/25 transition-all cursor-pointer"
              >
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#77758B]">
        © 2026 CreatorBridge. All rights reserved.
      </footer>
    </div>
  );
};
