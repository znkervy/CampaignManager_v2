'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { MoreVertical, Plus, Search, TrendingUp, Users } from 'lucide-react';
import AppShell from '../../components/AppShell';

const campaigns = [
  {
    manager: 'Sarah Jenkins',
    initials: 'SJ',
    avatarColor: 'bg-[#102f4c]',
    image: '/images/background.jpg',
    name: 'Clean Water Initiative',
    beneficiary: 'Village Outreach',
    amount: '$50,000',
    status: 'ACTIVE',
    statusClass: 'bg-[#ddf7e8] text-[#3caa71]',
  },
  {
    manager: 'David Chen',
    initials: 'DC',
    avatarColor: 'bg-[#efebe7]',
    image: '/images/logo_h.png',
    name: 'Digital Literacy Lab',
    beneficiary: 'EdTech Foundation',
    amount: '$25,000',
    status: 'PENDING',
    statusClass: 'bg-[#ffe7d7] text-[#e38f4d]',
  },
  {
    manager: 'Elena Rodriguez',
    initials: 'ER',
    avatarColor: 'bg-[#efebe7]',
    image: '/images/background.jpg',
    name: 'Global Reforestation',
    beneficiary: 'Amazonia Trust',
    amount: '$100,000',
    status: 'CLOSED',
    statusClass: 'bg-[#f1efee] text-[#9e9692]',
  },
];

const extendedCampaigns = Array.from({ length: 24 }).map((_, i) => {
  const base = campaigns[i % 3];
  return {
    ...base,
    name: i < 3 ? base.name : `${base.name} - Unit ${i + 1}`
  };
});

export default function MyCampaignsPage() {
  const [filter, setFilter] = useState('All Campaigns');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCampaigns = extendedCampaigns.filter((c) => {
    if (filter === 'All Campaigns') return true;
    return c.status === filter.toUpperCase();
  });

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCampaigns = filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);

  const setPage = (p: number) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setCurrentPage(p);
  };

  return (
    <AppShell searchPlaceholder="Search campaigns...">
      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Campaign Management</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#84716b]">
              Track, manage, and scale your active social impact initiatives from one centralized editorial dashboard.
            </p>
          </div>

          <Link
            href="/create-campaign"
            className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-7 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] hover:bg-[#a0483e] transition-colors"
          >
            <Plus size={18} />
            Launch New Campaign
          </Link>
        </div>

        <section className="rounded-[28px] bg-white p-4 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-4 px-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-[12px] font-bold">
              {['All Campaigns', 'Active', 'Pending', 'Closed'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setFilter(tab); setCurrentPage(1); }}
                  className={`rounded-xl px-4 py-2 transition-colors ${tab === filter ? 'bg-[#fff1ed] text-[#cc6d58]' : 'text-[#8a7b76] hover:bg-[#f7f4f3]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex h-11 w-full items-center gap-2 rounded-full bg-[#faf7f5] px-4 sm:max-w-[320px]">
              <Search size={15} className="text-[#b5a8a4]" />
              <input
                type="text"
                placeholder="Search campaign name..."
                className="w-full bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-4 py-4">Campaign Manager</th>
                  <th className="px-4 py-4">Campaign Name</th>
                  <th className="px-4 py-4">Beneficiary</th>
                  <th className="px-4 py-4">Amount Allocated</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedCampaigns.map((campaign, index) => (
                  <tr key={index} className="border-b border-[#f4ebea]">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-extrabold ${campaign.avatarColor} ${campaign.avatarColor === 'bg-[#102f4c]' ? 'text-white' : 'text-[#8a7b76]'}`}>
                          {campaign.initials}
                        </div>
                        <span className="text-[14px] font-semibold text-[#4a3936]">{campaign.manager}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <Image src={campaign.image} alt={campaign.name} width={34} height={34} className="h-[34px] w-[34px] rounded-lg object-cover" />
                        <span className="max-w-[170px] text-[14px] font-bold leading-[1.3] text-[#3b2f2c]">{campaign.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[14px] font-medium text-[#766762]">{campaign.beneficiary}</td>
                    <td className="px-4 py-5 text-[14px] font-bold text-[#453633]">{campaign.amount}</td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${campaign.statusClass}`}>
                        {campaign.status}
                      </span>
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

          <div className="flex flex-col gap-4 px-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#80716c]">
              Showing {filteredCampaigns.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
            </p>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages })
                .map((_, i) => i + 1)
                .filter(page => {
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, startPage + 4);
                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }
                  return page >= startPage && page <= endPage;
                })
                .map((page) => {
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      page === currentPage ? 'bg-[#b55247] text-white' : 'border border-[#efdfdb] text-[#8c7d78] hover:bg-[#f7f4f3]'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1ed] text-[#cc6d58]">
                <TrendingUp size={16} />
              </div>
              <h2 className="text-[16px] font-extrabold text-[#433330]">Weekly Growth</h2>
            </div>
            <p className="mt-5 text-[40px] font-extrabold tracking-[-0.04em] text-[#ba5f4e]">+24.8%</p>
            <p className="mt-2 text-[13px] leading-6 text-[#8b7d78]">Donation velocity increased since Monday</p>
          </section>

          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff6db] text-[#b9922e]">
                <Users size={16} />
              </div>
              <h2 className="text-[16px] font-extrabold text-[#433330]">New Donors</h2>
            </div>
            <p className="mt-5 text-[40px] font-extrabold tracking-[-0.04em] text-[#b9922e]">1,402</p>
            <p className="mt-2 text-[13px] leading-6 text-[#8b7d78]">First-time contributors this month</p>
          </section>

          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <h2 className="text-[16px] font-extrabold text-[#433330]">Campaign Tip</h2>
            <p className="mt-4 text-[14px] leading-7 text-[#8b7d78]">
              Visual updates increase donor retention by 42%. Try adding a video to &quot;Digital Literacy Lab&quot;.
            </p>
            <button type="button" className="mt-5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-[#c96a5b]">
              Learn More
            </button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
