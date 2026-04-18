'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Heart,
  Megaphone,
  Plus,
  QrCode,
  Rocket,
} from 'lucide-react';
import AppShell from '../../components/AppShell';

const metricCards = [
  {
    icon: CircleDollarSign,
    iconBg: 'bg-[#fdf2d8]',
    iconColor: 'text-[#b58b28]',
    badge: '+12.5%',
    badgeColor: 'text-[#bf9336]',
    title: 'Funds Raised',
    value: '$128,450.00',
  },
  {
    icon: Rocket,
    iconBg: 'bg-[#fde7e1]',
    iconColor: 'text-[#c86b5e]',
    badge: '4 Active',
    badgeColor: 'text-[#ca7264]',
    title: 'Active Campaigns',
    value: '12',
  },
  {
    icon: Heart,
    iconBg: 'bg-[#fdeceb]',
    iconColor: 'text-[#c66b62]',
    badge: '84 New',
    badgeColor: 'text-[#cf746b]',
    title: 'Total Donors',
    value: '3,241',
  },
  {
    icon: Bell,
    iconBg: 'bg-[#fde8e5]',
    iconColor: 'text-[#ca655d]',
    badge: 'Action Required',
    badgeColor: 'text-[#d14f45]',
    title: 'Pending Actions',
    value: '7',
  },
];

const campaigns = [
  {
    image: '/images/background.jpg',
    title: 'Clean Water for Omo',
    status: 'ACTIVE',
    statusClass: 'bg-[#ddf7e8] text-[#3caa71]',
    raised: '$42,000',
    goal: '$50,000',
    progress: '84% Complete',
    progressWidth: '84%',
    deadline: 'Oct 12,\n2024',
  },
  {
    image: '/images/logo_h.png',
    title: 'Education for All',
    status: 'PENDING',
    statusClass: 'bg-[#ffe7d7] text-[#e38f4d]',
    raised: '$12,500',
    goal: '$25,000',
    progress: '50% Complete',
    progressWidth: '50%',
    deadline: 'Nov 05,\n2024',
  },
  {
    image: '/images/background.jpg',
    title: 'Healthcare Reach',
    status: 'ACTIVE',
    statusClass: 'bg-[#ddf7e8] text-[#3caa71]',
    raised: '$89,200',
    goal: '$100,000',
    progress: '89% Complete',
    progressWidth: '89%',
    deadline: 'Dec 20,\n2024',
  },
];

const quickActions = [
  { icon: Megaphone, label: 'Updates' },
  { icon: FileText, label: 'CSV Report' },
  { icon: ClipboardCheck, label: 'Proof' },
  { icon: QrCode, label: 'QR Code' },
];

const liveActivities = [
  {
    icon: CircleDollarSign,
    iconBg: 'bg-[#fff4d9]',
    iconColor: 'text-[#bb9037]',
    title: 'New Donation Received',
    description: 'Anonymous donated $500.00 to Educational All',
    time: '2 minutes ago',
  },
  {
    icon: ClipboardCheck,
    iconBg: 'bg-[#fde8e5]',
    iconColor: 'text-[#c96b61]',
    title: 'Review Required',
    description: 'Campaign Medical Supplies needs proof of impact documents.',
    time: '1 hour ago',
  },
  {
    icon: Bell,
    iconBg: 'bg-[#fde8e5]',
    iconColor: 'text-[#c96b61]',
    title: 'Milestone Reached!',
    description: 'Clean Water Omo reached 80% of its goal.',
    time: '5 hours ago',
  },
];

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeFilter === 'All') return true;
    return campaign.status.toUpperCase() === activeFilter.toUpperCase();
  });

  return (
    <AppShell>
      <div className="w-full">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#2e2523] sm:text-[28px]">Welcome back, Sarah</h1>
          <p className="mt-1 text-[14px] text-[#84716b]">
            Your global impact has reached <span className="font-semibold text-[#d59654]">12,403 souls</span> this month.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(({ icon: Icon, iconBg, iconColor, badge, badgeColor, title, value }) => (
            <article
              key={title}
              className="min-h-[132px] rounded-[22px] bg-white px-5 py-4 shadow-[0_14px_36px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <span className={`rounded-full bg-[#fcf6f3] px-3 py-1 text-[10px] font-bold ${badgeColor}`}>{badge}</span>
              </div>
              <p className="mt-5 text-[12px] font-semibold text-[#8a7a75]">{title}</p>
              <p className="mt-1 text-[16px] font-extrabold text-[#342827] sm:text-[17px]">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_255px]">
          <div className="min-w-0">
            <section className="overflow-hidden rounded-[26px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex flex-col gap-4 border-b border-[#f4ebea] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[18px] font-extrabold text-[#382b28]">My Campaigns</h2>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  {['All', 'Active', 'Pending', 'Completed'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveFilter(tab)}
                      className={`rounded-lg px-4 py-1.5 transition-colors ${
                        activeFilter === tab ? 'bg-[#fff6f2] text-[#d36f5d]' : 'bg-[#faf7f5] text-[#8a7b76] hover:bg-[#f2eee9]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                      <th className="px-4 py-4">Campaign Name</th>
                      <th className="px-3 py-4">Status</th>
                      <th className="px-3 py-4">Goal / Raised</th>
                      <th className="px-3 py-4">Progress</th>
                      <th className="px-3 py-4">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.title} className="border-t border-[#f4ebea]">
                        <td className="px-4 py-5 align-top">
                          <div className="flex items-center gap-3">
                            <Image
                              src={campaign.image}
                              alt={campaign.title}
                              width={34}
                              height={34}
                              className="h-[34px] w-[34px] rounded-lg object-cover"
                            />
                            <p className="max-w-[105px] text-[14px] font-bold leading-[1.15] text-[#3c302d]">{campaign.title}</p>
                          </div>
                        </td>
                        <td className="px-3 py-5 align-top">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-extrabold ${campaign.statusClass}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-3 py-5 align-top text-[12px] leading-[1.35]">
                          <p className="text-[#9a8d87]">Raised</p>
                          <p className="font-bold text-[#554541]">{campaign.raised}</p>
                          <p className="mt-1 text-[#9a8d87]">Goal:</p>
                          <p className="font-extrabold text-[#453633]">{campaign.goal}</p>
                        </td>
                        <td className="px-3 py-5 align-top">
                          <div className="w-[110px]">
                            <div className="h-2 rounded-full bg-[#f4e7e5]">
                              <div className="h-2 rounded-full bg-[#c96a5b]" style={{ width: campaign.progressWidth }} />
                            </div>
                            <p className="mt-2 text-[10px] font-bold text-[#c96a5b]">{campaign.progress}</p>
                          </div>
                        </td>
                        <td className="px-3 py-5 align-top whitespace-pre-line text-[13px] font-medium leading-[1.25] text-[#6d5d59]">
                          {campaign.deadline}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[26px] bg-white p-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#6f5954]">Quick Actions</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {quickActions.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] bg-[#faf7f5] text-center"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c96a5b] shadow-[0_8px_18px_rgba(87,55,48,0.05)]">
                      <Icon size={16} />
                    </div>
                    <span className="mt-3 text-[11px] font-bold text-[#6d5d59]">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="min-h-[420px] rounded-[26px] bg-white p-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#6f5954]">Live Activity</h2>
                <span className="h-2.5 w-2.5 rounded-full bg-[#c85d50]" />
              </div>

              <div className="mt-5 space-y-5">
                {liveActivities.map(({ icon: Icon, iconBg, iconColor, title, description, time }) => (
                  <article key={title} className="flex gap-3">
                    <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                      <Icon size={15} className={iconColor} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[12px] font-extrabold text-[#433330]">{title}</h3>
                      <p className="mt-1 text-[10px] leading-[1.35] text-[#8d7d78]">{description}</p>
                      <p className="mt-1 text-[9px] font-medium text-[#b0a39f]">{time}</p>
                    </div>
                  </article>
                ))}
              </div>

              <Link
                href="/create-campaign"
                className="mt-5 flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#b55247] text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] transition-colors hover:bg-[#9d463d]"
              >
                <Plus size={16} />
                New Campaign
              </Link>

              <button type="button" className="mt-4 w-full text-center text-[11px] font-bold text-[#c96a5b]">
                View All Activity
              </button>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
