'use client';

import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  BriefcaseMedical,
  CalendarDays,
  Camera,
  Check,
  CheckSquare,
  CloudUpload,
  FileBadge2,
  FileCheck2,
  FileText,
  Flag,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  ImagePlus,
  List,
  Link2,
  MapPin,
  Mountain,
  Plus,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  Square,
  Type,
  Undo2,
  UserSquare2,
} from 'lucide-react';
import { useState } from 'react';
import AppShell from '../../components/AppShell';

const steps = [
  { number: 1, label: 'Basics' },
  { number: 2, label: 'Story' },
  { number: 3, label: 'Beneficiary' },
  { number: 4, label: 'Documents' },
  { number: 5, label: 'Review' },
] as const;

const categories = [
  { label: 'Health', icon: BriefcaseMedical },
  { label: 'Education', icon: GraduationCap, active: true },
  { label: 'Environment', icon: Mountain },
  { label: 'Disaster', icon: ShieldAlert },
];

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, 5));
  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 1));

  const stepTitle =
    currentStep === 1
      ? 'Create New Campaign'
      : currentStep === 2
        ? 'Define your goal & timeline'
        : currentStep === 3
          ? 'Beneficiary Details'
          : currentStep === 4
            ? 'Documents & Legal'
            : 'Final Review';

  const stepDescription =
    currentStep === 1
      ? 'Bring your vision to life and start making an impact today.'
      : currentStep === 2
        ? 'Set clear financial targets and milestones to build trust with your potential donors.'
        : currentStep === 3
          ? 'Please provide the details of the person or organization who will receive the funds collected from this campaign.'
          : currentStep === 4
            ? 'To ensure trust and transparency within the HOPECARD community, we require official documentation to verify your campaign\'s legitimacy.'
            : 'Review your campaign setup before submitting it for approval.';

  const nextLabel =
    currentStep === 1
      ? 'Next: Goal & Timeline'
      : currentStep === 2
        ? 'Next: Beneficiary Details'
        : currentStep === 3
          ? 'Next: Documents & Legal'
          : currentStep === 4
            ? 'Next: Final Review'
            : 'View My Campaigns';

  return (
    <AppShell searchPlaceholder="Search campaigns...">
      <div className="mx-auto max-w-[1100px] space-y-6 pb-10">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">{stepTitle}</h1>
          <p className="mt-2 max-w-[860px] text-[15px] text-[#84716b]">{stepDescription}</p>
        </div>

        <section className="rounded-[28px] bg-white px-4 py-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:px-6">
          <div className="relative grid grid-cols-5 items-start">
            <div className="pointer-events-none absolute left-[4%] right-[4%] top-4 h-px bg-[#ece3df]" />
            {steps.map((step) => (
              <div key={step.label} className="relative flex flex-col items-center">
                <div
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-extrabold ${
                    step.number === currentStep ? 'bg-[#b55247] text-white' : 'bg-[#efebe9] text-[#8e7f7a]'
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`mt-4 text-center text-[10px] font-extrabold uppercase tracking-[0.06em] ${
                    step.number === currentStep ? 'text-[#b55247]' : 'text-[#6f5f5b]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {currentStep === 1 ? (
          <>
            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Campaign Basics</h2>

              <div className="mt-6 space-y-6">
                <InputBlock label="Campaign Name" placeholder="e.g. Clean Water Initiative for Mali Village" />

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Category</label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {categories.map(({ label, icon: Icon, active }) => (
                      <button
                        key={label}
                        type="button"
                        className={`flex h-[82px] flex-col items-center justify-center rounded-[20px] border text-center ${
                          active
                            ? 'border-[#c97a6d] bg-[#fff9f8] text-[#b55247]'
                            : 'border-transparent bg-[#f7f4f3] text-[#6e5f5b]'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="mt-2 text-[12px] font-bold">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Tell Your Story</label>
                  <div className="mt-3 overflow-hidden rounded-[24px] bg-[#f7f4f3]">
                    <div className="flex items-center gap-4 px-4 py-3 text-[#786863]">
                      <button type="button">
                        <Type size={14} />
                      </button>
                      <button type="button">
                        <Undo2 size={14} />
                      </button>
                      <button type="button">
                        <List size={14} />
                      </button>
                      <button type="button">
                        <Link2 size={14} />
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      placeholder="Explain why you are starting this campaign and how the funds will be used..."
                      className="min-h-[250px] w-full resize-none bg-[#f7f4f3] px-6 pb-6 pt-2 text-[14px] text-[#6d5d59] outline-none placeholder:text-[#b9aeaa]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Visual Impact</h2>
              <p className="mt-2 text-[13px] text-[#8d7d78]">High-quality visuals increase donations by up to 3x.</p>

              <button
                type="button"
                className="mt-6 flex min-h-[280px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] px-6 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e9e6] text-[#b55247]">
                  <Camera size={24} />
                </div>
                <p className="mt-5 text-[18px] font-bold text-[#4a3936]">Upload main cover photo</p>
                <p className="mt-2 text-[12px] font-medium text-[#9a8d88]">Recommended size: 1200 x 675px</p>
              </button>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  className="flex h-[138px] items-center justify-center rounded-[24px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] text-[#6f5f5b]"
                >
                  <ImagePlus size={20} />
                </button>
                {[1, 2, 3].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className="flex h-[138px] items-center justify-center rounded-[24px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] text-[#6f5f5b]"
                  >
                    <Plus size={20} />
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Financial Objectives</h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InputBlock label="Monetary Goal" placeholder="0.00" icon={BadgeDollarSign} iconColor="text-[#b79d45]" />
                <InputBlock label="Minimum Donation" placeholder="5.00" icon={HandCoins} />
              </div>

              <div className="mt-5">
                <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Goal Deadline</label>
                <div className="mt-3 flex h-[52px] items-center justify-between rounded-full bg-[#f7f4f3] px-5">
                  <div className="flex items-center gap-3">
                    <CalendarDays size={16} className="text-[#9a8d88]" />
                    <input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      className="w-full bg-transparent text-[14px] text-[#6d5d59] outline-none placeholder:text-[#b9aeaa]"
                    />
                  </div>
                  <CalendarDays size={16} className="text-[#9a8d88]" />
                </div>
                <p className="mt-2 text-[11px] text-[#a19490]">Campaigns typically run for 30-60 days for maximum impact.</p>
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Campaign Milestones</h2>
                <button type="button" className="text-[12px] font-bold text-[#c96a5b]">
                  + Add Milestone
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ['Launch Phase Complete', 'Reach first 10% of goal to unlock matching donor funds.'],
                  ['First Distribution', 'Purchase and delivery of primary learning materials.'],
                ].map(([title, copy]) => (
                  <div key={title} className="flex items-center gap-4 rounded-[22px] bg-[#f7f4f3] px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7de] text-[#b99933]">
                      <Flag size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#433330]">{title}</h3>
                      <p className="mt-1 text-[12px] text-[#8d7d78]">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eae7] text-[#b55247]">
                  <HeartHandshake size={16} />
                </div>
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Beneficiary Information</h2>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InputBlock label="Beneficiary Name" placeholder="Full legal name" />
                <InputBlock label="Contact Person" placeholder="If different from beneficiary" />
                <InputBlock label="Phone Number" placeholder="+1 (555) 000-0000" />
                <InputBlock label="Email Address" placeholder="email@example.com" />
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eae7] text-[#b55247]">
                  <UserSquare2 size={16} />
                </div>
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Identity Verification</h2>
              </div>
              <p className="mt-3 text-[12px] text-[#8d7d78]">
                Upload a clear copy of a government-issued ID to verify the beneficiary&apos;s identity.
              </p>

              <button
                type="button"
                className="mt-5 flex min-h-[220px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] px-6 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#b5a7a2] shadow-[0_8px_18px_rgba(87,55,48,0.04)]">
                  <CloudUpload size={20} />
                </div>
                <p className="mt-5 text-[16px] font-bold text-[#4a3936]">Click to upload or drag and drop</p>
                <p className="mt-2 text-[11px] font-medium text-[#9a8d88]">PDF, JPG or PNG (max. 10MB)</p>
              </button>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eae7] text-[#b55247]">
                  <Banknote size={16} />
                </div>
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Bank Details</h2>
              </div>

              <div className="mt-6 space-y-5">
                <InputBlock label="Account Holder Name" placeholder="As it appears on bank statement" />
                <div className="grid gap-5 md:grid-cols-2">
                  <InputBlock label="Bank Name" placeholder="e.g. Chase Bank, HSBC" />
                  <InputBlock label="Account Number" placeholder="0000 0000 0000" />
                </div>
                <div className="flex items-start gap-3 rounded-[20px] bg-[#fcf7ea] px-4 py-4 text-[#85734e]">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                  <p className="text-[12px] leading-6">
                    Your financial information is encrypted and securely stored. We only use this information for disbursement of collected funds.
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {currentStep === 4 ? (
          <>
            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eae7] text-[#b55247]">
                  <FileBadge2 size={16} />
                </div>
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Legal &amp; Identity Documents</h2>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <DocumentUpload
                  label="Manager ID"
                  title="Drop your ID photo here"
                  subtitle="PNG, JPG or PDF (max. 10MB)"
                  icon={FileCheck2}
                />
                <DocumentUpload
                  label="Proof of Address"
                  title="Upload utility bill or bank statement"
                  subtitle="Dated within the last 6 months"
                  icon={MapPin}
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-[20px] bg-[#fcf7ea] px-4 py-4 text-[#85734e]">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <p className="text-[12px] leading-6">
                  Your documents are encrypted and stored securely. They are only used for internal verification and are never shared publicly.
                </p>
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eae7] text-[#b55247]">
                  <ReceiptText size={16} />
                </div>
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Agreements &amp; Terms</h2>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ['Terms of Service', 'I agree to follow the campaign management rules and platform usage policies.'],
                  ['Privacy Policy', 'I understand how HOPECARD handles my personal and financial information.'],
                  ['Campaign Accuracy', 'I certify that all information provided in this campaign setup is true and accurate.'],
                ].map(([title, copy]) => (
                  <div key={title} className="flex items-start justify-between gap-4 rounded-[20px] bg-[#f7f4f3] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <button type="button" className="mt-1 text-[#d1c5c1]">
                        <Square size={16} />
                      </button>
                      <div>
                        <h3 className="text-[14px] font-bold text-[#433330]">{title}</h3>
                        <p className="mt-1 text-[12px] text-[#8d7d78]">{copy}</p>
                      </div>
                    </div>
                    <button type="button" className="text-[12px] font-bold text-[#c96a5b]">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="rounded-[20px] bg-white px-5 py-4 text-center text-[13px] text-[#8d7d78] shadow-[0_12px_32px_rgba(87,55,48,0.05)] ring-1 ring-[#f5ece8]">
              Need help with documents? <span className="font-semibold text-[#c96a5b]">Chat with Support</span> or visit our <span className="font-semibold text-[#c96a5b]">Help Center.</span>
            </div>
          </>
        ) : null}

        {currentStep === 5 ? (
          <>
            <section className="rounded-[30px] bg-white px-6 py-8 text-center shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:px-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f58f86] text-white shadow-[0_16px_32px_rgba(245,143,134,0.28)]">
                <Check size={28} strokeWidth={3} />
              </div>

              <h2 className="mt-8 text-[22px] font-extrabold text-[#382b28] sm:text-[24px]">Campaign Submitted for Review!</h2>
              <p className="mx-auto mt-4 max-w-[620px] text-[14px] leading-7 text-[#7f6f6a]">
                Great job, Sarah! Your campaign <span className="font-semibold text-[#e07d71]">&quot;Clean Water Initiative&quot;</span> has
                been sent to our administration team for verification. We&apos;ll review the details and beneficiary information to ensure
                everything is ready for the marketplace.
              </p>

              <div className="mx-auto mt-8 max-w-[760px] rounded-[22px] bg-[#faf7f5] px-5 py-6 text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#8f817d]">Next Steps</p>

                <div className="relative mt-5 grid grid-cols-3 gap-4">
                  <div className="pointer-events-none absolute left-[12%] right-[12%] top-4 h-px bg-[#ece3df]" />

                  {[
                    ['Admin Screening', 'ID verification', 'Est. 24-48 hours', true],
                    ['Final Approval', 'Reviewing compliance', '', false],
                    ['Marketplace Listing', 'Launch to donors', '', false],
                  ].map(([title, copy, eta, active]) => (
                    <div key={title as string} className="relative z-10 flex flex-col items-start">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full shadow-[0_6px_14px_rgba(87,55,48,0.06)] ${
                          active ? 'bg-[#f58f86] text-white' : 'bg-white text-[#8f817d]'
                        }`}
                      >
                        <CheckSquare size={15} />
                      </div>
                      <h3 className="mt-4 text-[12px] font-extrabold text-[#433330]">{title}</h3>
                      <p className="mt-1 text-[11px] text-[#8d7d78]">{copy}</p>
                      {eta ? <p className="mt-1 text-[10px] font-bold text-[#d56f60]">{eta}</p> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-7 text-[13px] font-extrabold uppercase tracking-[0.04em] text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
                >
                  View My Campaigns
                  <ArrowRight size={14} />
                </button>
                <button type="button" className="text-[12px] font-extrabold uppercase tracking-[0.05em] text-[#7f6f6a]">
                  Back to Dashboard
                </button>
              </div>
            </section>

            <div className="rounded-[20px] bg-white px-5 py-4 text-center text-[13px] text-[#8d7d78] shadow-[0_12px_32px_rgba(87,55,48,0.05)] ring-1 ring-[#f5ece8]">
              Need help with your final submission? <span className="font-semibold text-[#c96a5b]">Chat with Support</span> or visit our{' '}
              <span className="font-semibold text-[#c96a5b]">Help Center.</span>
            </div>
          </>
        ) : null}

        {currentStep !== 5 ? (
        <div className="flex flex-col gap-4 pb-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 1}
            className={`text-left text-[12px] font-extrabold uppercase tracking-[0.06em] ${
              currentStep === 1 ? 'text-[#c8bbb7]' : 'text-[#7e6d68]'
            }`}
          >
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-8 text-[13px] font-extrabold uppercase tracking-[0.05em] text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
          >
            {nextLabel}
            <ArrowRight size={15} />
          </button>
        </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function InputBlock({
  label,
  placeholder,
  icon: Icon,
  iconColor = 'text-[#9a8d88]',
}: {
  label: string;
  placeholder: string;
  icon?: typeof FileText;
  iconColor?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">{label}</label>
      <div className="mt-3 flex h-[52px] items-center gap-3 rounded-full bg-[#f7f4f3] px-5">
        {Icon ? <Icon size={16} className={iconColor} /> : null}
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent text-[14px] text-[#6d5d59] outline-none placeholder:text-[#b9aeaa]"
        />
      </div>
    </div>
  );
}

function DocumentUpload({
  label,
  title,
  subtitle,
  icon: Icon,
}: {
  label: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
}) {
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">{label}</label>
      <button
        type="button"
        className="mt-3 flex min-h-[220px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] px-6 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#b5a7a2] shadow-[0_8px_18px_rgba(87,55,48,0.04)]">
          <Icon size={20} />
        </div>
        <p className="mt-5 text-[16px] font-bold text-[#4a3936]">{title}</p>
        <p className="mt-2 text-[11px] font-medium text-[#9a8d88]">{subtitle}</p>
        <span className="mt-4 rounded-full bg-[#f8eae7] px-4 py-2 text-[11px] font-bold text-[#c96a5b]">Select File</span>
      </button>
    </div>
  );
}
