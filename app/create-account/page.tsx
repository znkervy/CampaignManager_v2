'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { ArrowRight, Building2, Lock, Mail, UserRound } from 'lucide-react';
import AuthShell from '../../components/AuthShell';

export default function CreateAccountPage() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push('/otp');
  };

  return (
    <AuthShell
      title="Create An Account"
      description="Set up your account to start managing campaigns."
      footerRightLabel="Verified"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Full Name</span>
          <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
            <UserRound size={13} className="text-[#bcb3b0]" />
            <input
              type="text"
              placeholder="Juan Dela Cruz"
              className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
              required
            />
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Organization</span>
          <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
            <Building2 size={13} className="text-[#bcb3b0]" />
            <input
              type="text"
              placeholder="HopeCard Foundation"
              className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
              required
            />
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Email Address</span>
          <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
            <Mail size={13} className="text-[#bcb3b0]" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
              required
            />
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Password</span>
          <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
            <Lock size={13} className="text-[#bcb3b0]" />
            <input
              type="password"
              placeholder="Create a password"
              className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
              required
            />
          </div>
        </label>

        <button
          type="submit"
          className="mt-5 flex h-[42px] w-full items-center justify-center gap-1.5 rounded-full bg-[#a6493f] text-[11px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(166,73,63,0.28)] transition hover:bg-[#963f37]"
        >
          Create Account
          <ArrowRight size={13} />
        </button>
      </form>

      <p className="mt-6 text-center text-[10px] text-[#8f817d]">
        Already have an account?{' '}
        <Link href="/" className="font-semibold text-[#f0a4a0]">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
