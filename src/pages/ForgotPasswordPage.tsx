import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
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

        <Link
          to="/login"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#77758B] hover:text-[#6425E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#EAE8F2] shadow-xl shadow-[#6425E8]/5 p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152F] tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-[#77758B]">
              Enter your account email and we'll send you recovery instructions
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center space-y-2.5 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-[#16A36A] mx-auto" />
              <h3 className="text-sm font-bold text-green-900">Recovery Instructions Sent</h3>
              <p className="text-xs text-green-700">
                We sent a secure password reset link to <strong>{email}</strong>. Check your inbox and follow the link to reset your password.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#6425E8] text-white text-xs font-bold shadow-xs hover:bg-[#521dc7] transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17152F]">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E9CAB] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@business.com or creator@mail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE8F2] bg-white text-xs sm:text-sm text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#6425E8]/25 transition-all cursor-pointer"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#F0EDF6]">
            <Link to="/login" className="text-xs font-bold text-[#6425E8] hover:underline">
              ← Return to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#77758B]">
        © 2026 CreatorBridge. All rights reserved.
      </footer>
    </div>
  );
};
