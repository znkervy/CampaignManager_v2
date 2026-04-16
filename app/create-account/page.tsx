'use client';

import Link from 'next/link';
import { FormEvent, useState, ChangeEvent } from 'react';
import { ArrowRight, Building2, Lock, Mail, UserRound, Phone, Upload, CheckCircle2 } from 'lucide-react';
import AuthShell from '../../components/AuthShell';
import { signUpAction } from '../actions/auth';

export default function CreateAccountPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    organization: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [files, setFiles] = useState<{
    secRegistration: File | null;
    orgCertificate: File | null;
  }>({ secRegistration: null, orgCertificate: null });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: 'secRegistration' | 'orgCertificate',
  ) => {
    if (e.target.files?.[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
      if (error) setError('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('firstName', formData.firstName);
    fd.append('lastName', formData.lastName);
    fd.append('organization', formData.organization);
    fd.append('email', formData.email);
    fd.append('contactNumber', formData.contactNumber);
    fd.append('password', formData.password);
    fd.append('confirmPassword', formData.confirmPassword);
    if (files.secRegistration) fd.append('secRegistration', files.secRegistration);
    if (files.orgCertificate) fd.append('orgCertificate', files.orgCertificate);

    const result = await signUpAction(fd);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      setFiles({ secRegistration: null, orgCertificate: null });
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Check Your Email"
        description="We've sent a confirmation link to your email address."
        footerRightLabel="Pending"
      >
        <p className="text-center text-[11px] font-medium text-[#8f817d]">
          Click the link in your email to confirm your account. Once confirmed,
          an admin will review and approve your access.
        </p>
        <p className="mt-4 text-center text-[10px] text-[#8f817d]">
          Already confirmed?{' '}
          <Link href="/" className="font-semibold text-[#f0a4a0]">
            Sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create An Account"
      description="Set up your account to start managing campaigns."
      footerRightLabel="Verified"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">First Name</span>
            <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
              <UserRound size={13} className="text-[#bcb3b0]" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Last Name</span>
            <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
              <UserRound size={13} className="text-[#bcb3b0]" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Dela Cruz"
                className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Organization</span>
          <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
            <Building2 size={13} className="text-[#bcb3b0]" />
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="HopeCard Foundation"
              className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
              required
            />
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Email Address</span>
            <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
              <Mail size={13} className="text-[#bcb3b0]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Contact Number</span>
            <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
              <Phone size={13} className="text-[#bcb3b0]" />
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="09123456789"
                className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Password</span>
            <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
              <Lock size={13} className="text-[#bcb3b0]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Confirm Password</span>
            <div className="flex h-[38px] items-center gap-2 rounded-full bg-[#f5f2f1] px-4">
              <Lock size={13} className="text-[#bcb3b0]" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent text-[10px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>
        </div>

        <div className="pt-2">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Required Documents</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="relative flex h-[60px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#bcb3b0] bg-[#fdfaf9] p-2 transition hover:bg-[#f5f2f1]">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'secRegistration')}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {files.secRegistration ? (
                <>
                  <CheckCircle2 size={14} className="text-[#a6493f]" />
                  <span className="mt-1 line-clamp-1 text-[8px] font-bold text-[#6d4a44]">{files.secRegistration.name}</span>
                </>
              ) : (
                <>
                  <Upload size={14} className="text-[#bcb3b0]" />
                  <span className="mt-1 text-[8px] font-bold text-[#7f6763]">SEC Registration</span>
                </>
              )}
            </label>

            <label className="relative flex h-[60px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#bcb3b0] bg-[#fdfaf9] p-2 transition hover:bg-[#f5f2f1]">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'orgCertificate')}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {files.orgCertificate ? (
                <>
                  <CheckCircle2 size={14} className="text-[#a6493f]" />
                  <span className="mt-1 line-clamp-1 text-[8px] font-bold text-[#6d4a44]">{files.orgCertificate.name}</span>
                </>
              ) : (
                <>
                  <Upload size={14} className="text-[#bcb3b0]" />
                  <span className="mt-1 text-center text-[8px] font-bold text-[#7f6763]">Organizational Cert.</span>
                </>
              )}
            </label>
          </div>
        </div>

        {error && (
          <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-wider text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex h-[42px] w-full items-center justify-center gap-1.5 rounded-full bg-[#a6493f] text-[11px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(166,73,63,0.28)] transition hover:bg-[#963f37] disabled:opacity-60"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
          {!loading && <ArrowRight size={13} />}
        </button>
      </form>

      <p className="mt-5 text-center text-[10px] text-[#8f817d]">
        Already have an account?{' '}
        <Link href="/" className="font-semibold text-[#f0a4a0]">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
