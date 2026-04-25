'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileText,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import AuthShell from '../../components/AuthShell';

export default function CreateAccountPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push('/otp');
  };

  return (
    <AuthShell
      title="Organization Registration"
      description="Provide your organization details to join our formal registry and start your mission."
      footerRightLabel="Verified"
      maxWidth="max-w-[640px]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          {/* Left Column */}
          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Fullname</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <UserRound size={16} className="text-[#bcb3b0]" />
              <input
                type="text"
                placeholder="Jane Doe"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>

          {/* Right Column */}
          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Organization</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <Building2 size={16} className="text-[#bcb3b0]" />
              <input
                type="text"
                placeholder="Org Name"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>

          <label className="block space-y-1.5">
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

          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Contact Number</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <Phone size={16} className="text-[#bcb3b0]" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Password</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <Lock size={16} className="text-[#bcb3b0]" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="........"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition">
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Confirm Password</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <ShieldCheck size={16} className="text-[#bcb3b0]" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="........"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition">
                {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-4 pb-2">
          <span className="text-[12px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763] whitespace-nowrap">
            Required Documents
          </span>
          <div className="h-px w-full bg-[#f4ecea]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6c9c5] bg-[#f9f4f3] p-6 text-center transition hover:bg-[#f2eaea]">
            <input type="file" className="hidden" />
            <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#fcdbd6] text-[#e06d61]">
              <FileText size={16} />
            </div>
            <span className="mt-3 text-[12px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">
              SEC Registration
            </span>
            <span className="mt-2 text-[13px] font-bold text-[#433330]">Click to upload</span>
            <span className="mt-1 text-[11px] font-medium text-[#9a8d88]">PDF, JPG up to 10MB</span>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6c9c5] bg-[#f9f4f3] p-6 text-center transition hover:bg-[#f2eaea]">
            <input type="file" className="hidden" />
            <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#fcdbd6] text-[#e06d61]">
              <BadgeCheck size={16} />
            </div>
            <span className="mt-3 text-[12px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">
              Organizational Certificate
            </span>
            <span className="mt-2 text-[13px] font-bold text-[#433330]">Click to upload</span>
            <span className="mt-1 text-[11px] font-medium text-[#9a8d88]">PDF, JPG up to 10MB</span>
          </label>
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 flex h-4 w-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-[4px] border border-[#d6c5c2] bg-white transition checked:border-[#a6493f] checked:bg-[#a6493f] hover:border-[#b5a8a6]"
            required
          />
          <span className="text-[13px] leading-6 text-[#887a78]">
            I certify that the information and documents provided are accurate and valid. I agree to the{' '}
            <Link href="#" className="font-semibold text-[#a6493f] hover:underline">
              Terms of Service
            </Link>.
          </span>
        </label>

        <button
          type="submit"
          className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#823a33] text-[13px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(130,58,51,0.22)] transition hover:bg-[#6e2f2a]"
        >
          COMPLETE REGISTRATION
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-[#8f817d]">
        Already have an account?{' '}
        <Link href="/" className="font-semibold text-[#f07b71]">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
