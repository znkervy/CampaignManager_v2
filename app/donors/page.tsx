'use client';

import Image from 'next/image';
import {
  CircleDollarSign,
  Download,
  Filter,
  MoreVertical,
  UserPlus,
  Users,
} from 'lucide-react';
import AppShell from '../../components/AppShell';

const statCards = [
  {
    icon: Users,
    iconBg: 'bg-[#fde8e5]',
    iconColor: 'text-[#c86a5d]',
    badge: '+12%',
    badgeClass: 'text-[#c86a5d]',
    title: 'Total Unique Donors',
    value: '1,284',
  },
  {
    icon: CircleDollarSign,
    iconBg: 'bg-[#fff3d5]',
    iconColor: 'text-[#bb9432]',
    badge: 'Target: $150',
    badgeClass: 'text-[#bb9432]',
    title: 'Average Donation',
    value: '$142.50',
  },
  {
    icon: UserPlus,
    iconBg: 'bg-[#fde8e5]',
    iconColor: 'text-[#c86a5d]',
    badge: 'New',
    badgeClass: 'text-[#c86a5d]',
    title: 'New Donors This Month',
    value: '86',
  },
];

const donors = [
  {
    name: 'Marcus Thorne',
    subtitle: 'VIP DONOR',
    subtitleColor: 'text-[#b7962c]',
    email: 'm.thorne@example.com',
    total: '$12,450.00',
    lastDonation: 'Oct 24,\n2023',
    campaigns: ['CLEAN WATER', '+2'],
    image: '/images/background.jpg',
  },
  {
    name: 'Elena Rodriguez',
    subtitle: 'RECURRING',
    subtitleColor: 'text-[#d06f5b]',
    email: 'elena.rod@webmail.org',
    total: '$2,100.00',
    lastDonation: 'Nov 02,\n2023',
    campaigns: ['EDUCATION'],
    image: '/images/logo_h.png',
  },
  {
    name: 'David Chen',
    subtitle: 'STANDARD',
    subtitleColor: 'text-[#8f817d]',
    email: 'd.chen@corporate.com',
    total: '$850.00',
    lastDonation: 'Oct 15,\n2023',
    campaigns: ['REFOREST', 'RELIEF'],
    image: '/images/background.jpg',
  },
  {
    name: 'Sarah Jenkins',
    subtitle: 'MAJOR GIFT',
    subtitleColor: 'text-[#b7962c]',
    email: 'jenkins.se@global.org',
    total: '$50,000.00',
    lastDonation: 'Nov 10,\n2023',
    campaigns: ['HOUSING'],
    image: '/images/logo_h.png',
  },
];

export default function DonorsPage() {
  return (
    <AppShell searchPlaceholder="Search donors...">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Donors Database</h1>
            <p className="mt-2 text-[15px] text-[#84716b]">Managing 1,284 contributors across 12 active campaigns.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#5d4c48] shadow-[0_12px_30px_rgba(87,55,48,0.06)] ring-1 ring-[#f0e7e3]"
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-5 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {statCards.map(({ icon: Icon, iconBg, iconColor, badge, badgeClass, title, value }) => (
            <section
              key={title}
              className="rounded-[24px] bg-white p-5 shadow-[0_14px_36px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <span className={`rounded-full bg-[#fcf6f3] px-3 py-1 text-[11px] font-bold ${badgeClass}`}>{badge}</span>
              </div>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">{title}</p>
              <p className="mt-2 text-[18px] font-extrabold text-[#342827]">{value}</p>
            </section>
          ))}
        </div>

        <section className="rounded-[28px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-3 border-b border-[#f4ebea] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Community Database</h2>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#8c7c77]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c85d50]" />
              Live sync active
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-7 py-4">Donor Name</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Total Contributed</th>
                  <th className="px-4 py-4">Last Donation</th>
                  <th className="px-4 py-4">Campaigns</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor.email} className="border-b border-[#f4ebea]">
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <Image src={donor.image} alt={donor.name} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                        <div>
                          <p className="text-[14px] font-bold leading-[1.2] text-[#3b2f2c]">{donor.name}</p>
                          <p className={`mt-1 text-[10px] font-extrabold uppercase tracking-[0.05em] ${donor.subtitleColor}`}>{donor.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[13px] font-medium text-[#6f605c]">{donor.email}</td>
                    <td className="px-4 py-5 text-[14px] font-bold text-[#433330]">{donor.total}</td>
                    <td className="px-4 py-5 whitespace-pre-line text-[13px] font-medium leading-[1.35] text-[#6f605c]">{donor.lastDonation}</td>
                    <td className="px-4 py-5">
                      <div className="flex flex-wrap gap-2">
                        {donor.campaigns.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                              tag.startsWith('+')
                                ? 'bg-[#efebe9] text-[#8f817d]'
                                : 'bg-[#f4f1ef] text-[#6e5f5b]'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <button type="button" className="text-[#9d8f8a]">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#80716c]">Showing 1-10 of 1,284 donors</p>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              {['<', '1', '2', '3', '>'].map((page, index) => (
                <button
                  key={`${page}-${index}`}
                  type="button"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    page === '1' ? 'bg-[#b55247] text-white' : 'border border-[#efdfdb] text-[#8c7d78]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center pb-6 pt-2 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#c2b6b2]">
          (c) 2023 HOPECARD Mission Management System. All rights reserved.
        </div>
      </div>
    </AppShell>
  );
}
