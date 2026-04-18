'use client';

import { useState } from 'react';
import {
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Download,
  MoreVertical,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import AppShell from '../../components/AppShell';

const statCards = [
  {
    icon: CircleDollarSign,
    iconBg: 'bg-[#fde8e5]',
    iconColor: 'text-[#c86a5d]',
    badge: '+12.4%',
    badgeClass: 'text-[#c86a5d]',
    title: 'Total Funds Raised',
    value: '$128,450.00',
  },
  {
    icon: CircleDollarSign,
    iconBg: 'bg-[#fff3d5]',
    iconColor: 'text-[#bb9432]',
    badge: '+4.2%',
    badgeClass: 'text-[#bb9432]',
    title: 'Average Donation',
    value: '$142.50',
  },
  {
    icon: Users,
    iconBg: 'bg-[#fde8e5]',
    iconColor: 'text-[#c86a5d]',
    badge: 'Active',
    badgeClass: 'text-[#c86a5d]',
    title: 'Active Donors',
    value: '3,241',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-[#f4f1ef]',
    iconColor: 'text-[#8f817d]',
    badge: '+0.6%',
    badgeClass: 'text-[#bb9432]',
    title: 'Conversion Rate',
    value: '4.8%',
  },
];

const transactions = [
  {
    date: 'Oct 24,\n2023',
    donor: 'Andrew Johnson',
    initials: 'AJ',
    campaign: 'Clean Water Initiative',
    amount: '$500.00',
    payment: 'Visa',
    status: 'SUCCESS',
    statusClass: 'bg-[#fff6db] text-[#b9922e]',
  },
  {
    date: 'Oct 23,\n2023',
    donor: 'Elena Petrov',
    initials: 'EP',
    campaign: 'Rural Education Hub',
    amount: '$1,200.00',
    payment: 'Bank Transfer',
    status: 'PENDING',
    statusClass: 'bg-[#fde8e5] text-[#c86a5d]',
  },
];

const extendedTransactions = Array.from({ length: 1241 }).map((_, i) => {
  const base = transactions[i % transactions.length];
  return {
    ...base,
    id: i,
  };
});

export default function ReportsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(extendedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTransactions = extendedTransactions.slice(startIndex, startIndex + itemsPerPage);

  const setPage = (p: number) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setCurrentPage(p);
  };

  return (
    <AppShell searchPlaceholder="Search reports...">
      <div className="w-full space-y-6 pb-28">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Financial Reports &amp; Insights</h1>
            <p className="mt-2 max-w-[760px] text-[15px] text-[#84716b]">
              Analyze fundraising performance, donor demographics, and impact metrics across all active campaigns.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#5d4c48] shadow-[0_12px_30px_rgba(87,55,48,0.06)] ring-1 ring-[#f0e7e3]"
            >
              <CalendarDays size={16} />
              Last 30 Days
            </button>
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-5 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
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

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Fundraising Trends</h2>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-[0.04em] text-[#9b8d88]">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f08d87]" />
                  Current Period
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#a78310]" />
                  Previous Period
                </span>
              </div>
            </div>

            <div className="mt-6 h-[300px] rounded-[24px] bg-[#fffdfa] p-4">
              <svg viewBox="0 0 600 260" className="h-full w-full">
                <path
                  d="M20 200 C100 210, 130 40, 220 60 S360 120, 430 110 S520 120, 580 100"
                  fill="none"
                  stroke="#f08d87"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M20 225 C90 225, 140 170, 220 165 S360 150, 430 145 S520 138, 580 132"
                  fill="none"
                  stroke="#a78310"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <g fill="#c6b8b3" fontSize="12" fontWeight="700">
                  <text x="18" y="248">W1 01</text>
                  <text x="200" y="248">W1 03</text>
                  <text x="390" y="248">W1 14</text>
                  <text x="548" y="248">W1 02</text>
                </g>
              </svg>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Donation by Category</h2>

            <div className="mt-7 flex items-center justify-center">
              <div className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full bg-[conic-gradient(#a45b52_0_41%,#f08d87_41%_66%,#a78310_66%_86%,#f3ebe7_86%_100%)]">
                <div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-[16px] font-extrabold text-[#382b28]">Total</span>
                  <span className="mt-1 text-[13px] font-bold text-[#8d7d78]">$126k</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                ['Clean Water', '41%', '#a45b52'],
                ['Education', '25%', '#f08d87'],
                ['Healthcare', '20%', '#a78310'],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between text-[13px] font-medium text-[#6f605c]">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                  <span className="font-bold text-[#433330]">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[28px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-4 border-b border-[#f4ebea] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Detailed Transaction Report</h2>
            <div className="flex h-11 w-full items-center gap-2 rounded-full bg-[#faf7f5] px-4 sm:max-w-[260px]">
              <Search size={15} className="text-[#b5a8a4]" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-7 py-4">Date</th>
                  <th className="px-4 py-4">Donor Name</th>
                  <th className="px-4 py-4">Campaign</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Payment Method</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-[#f4ebea]">
                    <td className="px-7 py-5 whitespace-pre-line text-[13px] font-medium leading-[1.35] text-[#6f605c]">{transaction.date}</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fde8e5] text-[10px] font-extrabold text-[#c86a5d]">
                          {transaction.initials}
                        </div>
                        <span className="text-[14px] font-bold text-[#3b2f2c]">{transaction.donor}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[13px] font-medium text-[#6f605c]">{transaction.campaign}</td>
                    <td className="px-4 py-5 text-[14px] font-extrabold text-[#c86a5d]">{transaction.amount}</td>
                    <td className="px-4 py-5">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-[#6f605c]">
                        <CreditCard size={14} />
                        {transaction.payment}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${transaction.statusClass}`}>
                        {transaction.status}
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

          <div className="flex flex-col gap-4 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#80716c]">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, extendedTransactions.length)} of {extendedTransactions.length} transactions
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
                .map((page) => (
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
                ))}
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

        <div className="pt-10 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#c2b6b2]">
          (c) 2023 HOPECARD Mission Management System. All rights reserved.
        </div>
      </div>
    </AppShell>
  );
}
