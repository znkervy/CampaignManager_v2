'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import AuthShell from '../components/AuthShell';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push('/otp');
  };

  return (
    <AuthShell
      title="Welcome Back"
      description="Continue your journey of making an impact today."
      footerRightLabel="Verified"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Email Address</span>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Mail size={16} className="text-[#bcb3b0]" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
              required
            />
          </div>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Password</span>
            <button type="button" className="text-[11px] font-semibold text-[#f0a4a0]">
              Forgot Password?
            </button>
          </div>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Lock size={16} className="text-[#bcb3b0]" />
            <input
              type="password"
              placeholder="........"
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#8f7f7b]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#a6493f] text-[13px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(166,73,63,0.28)] transition hover:bg-[#963f37]"
        >
          Sign In
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-[#8f817d]">
        Don&apos;t have an account?{' '}
        <Link href="/create-account" className="font-semibold text-[#f0a4a0]">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
