'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  Bell,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  Megaphone,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/my-campaigns', label: 'My Campaigns', icon: Megaphone },
  { href: '/create-campaign', label: 'Create Campaign', icon: Plus },
  { href: '/donors', label: 'Donors', icon: Users },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface AppShellProps {
  children: ReactNode;
  searchPlaceholder?: string;
}

export default function AppShell({
  children,
  searchPlaceholder = 'Search campaigns...',
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <main className="h-screen overflow-hidden bg-[#fcfaf8] text-[#463431]">
      <div className="mx-auto flex h-screen max-w-[1440px]">
        <aside className="hidden h-screen w-[250px] shrink-0 flex-col border-r border-[#f0e7e3] bg-[#fffdfa] xl:flex">
          <div className="flex h-[72px] items-center gap-3 border-b border-[#f0e7e3] px-5">
            <button type="button" className="text-[#7d6a64]">
              <Menu size={18} />
            </button>
            <Image src="/images/logo_h.png" alt="HOPECARD" width={24} height={24} className="h-6 w-6 object-contain" />
            <span className="text-[20px] font-extrabold tracking-[-0.03em] text-[#b25649]">HOPECARD</span>
          </div>

          <div className="border-b border-[#f0e7e3] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#20313f] text-white">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#473531]">Sarah Jenkins</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#d27766]">Campaign Manager</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-5">
            <ul className="space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium transition ${
                        active ? 'bg-[#fff1ed] text-[#cc6d58]' : 'text-[#746560] hover:bg-[#faf3f0]'
                      }`}
                    >
                      <Icon size={16} className={active ? 'text-[#cc6d58]' : 'text-[#8a7a76]'} />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-4 pb-5">
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-[#746560] hover:bg-[#faf3f0]"
            >
              <LogOut size={16} className="text-[#8a7a76]" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#f0e7e3] bg-[#fffdfa] px-5 sm:px-8">
            <div className="flex items-center gap-3 xl:hidden">
              <button type="button" className="text-[#7d6a64]">
                <Menu size={18} />
              </button>
              <Image src="/images/logo_h.png" alt="HOPECARD" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
              <span className="text-[18px] font-extrabold tracking-[-0.03em] text-[#b25649]">HOPECARD</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden h-10 w-[250px] items-center gap-2 rounded-full bg-[#faf7f5] px-4 md:flex">
                <Search size={15} className="text-[#b5a8a4]" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
                />
              </div>
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-[#7f6b66]">
                <Bell size={16} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-6 sm:px-8 lg:px-10">{children}</div>
          </div>
        </section>
      </div>

      {showLogoutModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d201d]/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(61,34,29,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#352826]">You are about to logout</h2>
                <p className="mt-2 text-[14px] leading-6 text-[#87736e]">
                  Your current frontend session will end and you will be returned to the login page.
                </p>
              </div>
              <button type="button" onClick={() => setShowLogoutModal(false)} className="text-[#a18e89]">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-full border border-[#eedfdb] px-5 py-2.5 text-[13px] font-bold text-[#7b6763]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-full bg-[#b55247] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
