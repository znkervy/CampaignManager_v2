'use client';

import { BellDot, ChevronRight, CreditCard, ShieldCheck, UserRound } from 'lucide-react';
import AppShell from '../../components/AppShell';

const securityItems = [
  {
    title: 'Change Password',
    copy: 'Updated 30 days ago',
    icon: ShieldCheck,
    accent: 'text-[#c86a5d]',
    bg: 'bg-[#fde8e5]',
    trailing: '',
  },
  {
    title: 'Two-Factor Auth',
    copy: 'Add an extra layer of security to your account.',
    icon: ShieldCheck,
    accent: 'text-[#b9922e]',
    bg: 'bg-[#fff3d5]',
    trailing: 'Enable 2FA Now >',
  },
];

const bankingItems = [
  {
    title: 'Chase Business Checking',
    account: '**** 8621',
    badge: 'VERIFIED',
    badgeClass: 'bg-[#fff6db] text-[#b9922e]',
    active: true,
  },
  {
    title: 'Foundation Savings',
    account: '**** 4430',
    badge: 'PENDING VERIFICATION',
    badgeClass: 'bg-[#f4f1ef] text-[#8f817d]',
    active: false,
  },
];

export default function SettingsPage() {
  return (
    <AppShell searchPlaceholder="Search campaign settings...">
      <div className="w-full space-y-6 pb-32">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Account Settings</h1>
          <p className="mt-2 text-[15px] text-[#84716b]">
            Manage your personal information, security preferences, and financial details.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Profile Settings</h2>
                <button
                  type="button"
                  className="flex h-[42px] items-center justify-center rounded-full bg-[#b55247] px-5 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
                >
                  Save Changes
                </button>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-[160px_minmax(0,1fr)]">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-[22px] bg-[#294459] text-white">
                      <UserRound size={54} />
                    </div>
                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#c86a5d] shadow-[0_10px_22px_rgba(87,55,48,0.10)]"
                    >
                      <BellDot size={16} />
                    </button>
                  </div>
                  <button type="button" className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#8f817d]">
                    Update Photo
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputChip label="Full Name" value="Elena Rodriguez" />
                    <InputChip label="Email Address" value="elena.r@warmauthorit" />
                  </div>
                  <InputArea
                    label="Bio"
                    value="Dedicated to building sustainable communities and fostering impactful change through global transparency."
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[18px] font-extrabold text-[#382b28]">Banking &amp; Payouts</h2>
                  <p className="mt-1 text-[13px] text-[#8d7d78]">Linked accounts for fund disbursement</p>
                </div>
                <button type="button" className="text-[12px] font-bold text-[#c96a5b]">
                  + Add Account
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {bankingItems.map((item) => (
                  <div key={item.title} className="flex flex-col gap-4 rounded-[22px] bg-[#faf7f5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full ${
                          item.active ? 'bg-[#fff3d5] text-[#bb9432]' : 'bg-[#f0ece9] text-[#8f817d]'
                        }`}
                      >
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#3b2f2c]">{item.title}</p>
                        <p className="mt-1 text-[12px] font-medium text-[#8d7d78]">{item.account}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${item.badgeClass}`}>{item.badge}</span>
                      <button type="button" className="text-[#9d8f8a]">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-10">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#d56f60]">Danger Zone</p>
              <p className="mt-2 text-[13px] text-[#8d7d78]">Deactivating your account is permanent and cannot be undone.</p>
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Notifications</h2>

              <div className="mt-5 space-y-5">
                {[
                  ['Campaign Milestones', 'Goal at 50% / 100% met', true],
                  ['New Donations', 'Instant alerts for every gift', true],
                  ['Admin Messages', 'Critical system updates', false],
                ].map(([title, copy, enabled]) => (
                  <div key={title} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-bold text-[#433330]">{title}</p>
                      <p className="mt-1 text-[12px] text-[#8d7d78]">{copy}</p>
                    </div>
                    <div
                      className={`flex h-7 w-12 items-center rounded-full px-1 ${
                        enabled ? 'justify-end bg-[#fde8e5]' : 'justify-start bg-[#f0ece9]'
                      }`}
                    >
                      <span className={`h-5 w-5 rounded-full ${enabled ? 'bg-[#ef8f86]' : 'bg-white shadow-[0_4px_10px_rgba(0,0,0,0.08)]'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Security</h2>

              <div className="mt-5 space-y-4">
                {securityItems.map(({ title, copy, icon: Icon, accent, bg, trailing }) => (
                  <div key={title} className="rounded-[22px] bg-[#faf7f5] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} ${accent}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#433330]">{title}</p>
                        <p className="mt-1 text-[12px] text-[#8d7d78]">{copy}</p>
                        {trailing ? <button type="button" className="mt-3 text-[11px] font-bold text-[#c96a5b]">{trailing}</button> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <div className="flex flex-col gap-8 pt-12">
          <div className="flex justify-end">
            <button
              type="button"
              className="flex h-[46px] items-center justify-center rounded-full bg-[#d72617] px-6 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(215,38,23,0.22)]"
            >
              Deactivate Account
            </button>
          </div>

          <div className="text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#c2b6b2]">
            (c) 2023 HOPECARD Mission Management System. All rights reserved.
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InputChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">{label}</p>
      <div className="mt-3 rounded-[18px] bg-[#f7f4f3] px-5 py-4 text-[14px] font-medium text-[#5d4c48]">{value}</div>
    </div>
  );
}

function InputArea({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">{label}</p>
      <div className="mt-3 min-h-[108px] rounded-[18px] bg-[#f7f4f3] px-5 py-4 text-[14px] leading-7 text-[#5d4c48]">{value}</div>
    </div>
  );
}
