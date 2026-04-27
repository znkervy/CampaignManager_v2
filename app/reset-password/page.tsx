'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthShell from '../../components/AuthShell';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Please ensure both passwords match perfectly.");
      return;
    }
    
    setError('');
    setShowToast(true);
    setTimeout(() => {
      router.push('/');
    }, 2500);
  };

  return (
    <AuthShell
      title="Create New Password"
      description="Your new password must be different from previously used passwords."
      footerRightLabel="Verified"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Your New Password</span>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Lock size={16} className="text-[#bcb3b0]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#8f7f7b]"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition">
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Retype Your New Password</span>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Lock size={16} className="text-[#bcb3b0]" />
            <input
              type={showRetypePassword ? "text" : "password"}
              placeholder="........"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#8f7f7b]"
              required
            />
            <button type="button" onClick={() => setShowRetypePassword(!showRetypePassword)} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition">
              {showRetypePassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </label>

        {error && (
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#d72617]">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#a6493f] text-[13px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(166,73,63,0.28)] transition hover:bg-[#963f37]"
        >
          Update Password
          <ArrowRight size={16} />
        </button>
      </form>
      
      <div className="mt-8 text-center text-[13px] text-[#8f817d]">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[#f0a4a0] hover:text-[#e4807b]">
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </div>

      {showToast && (
        <div className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#2a1c1a] px-6 py-3.5 text-[13px] font-medium text-[#f5ece8] shadow-[0_16px_42px_rgba(42,28,26,0.5)]">
          <CheckCircle2 size={16} className="text-[#f0a4a0]" />
          Password successfully changed!
        </div>
      )}
    </AuthShell>
  );
}
