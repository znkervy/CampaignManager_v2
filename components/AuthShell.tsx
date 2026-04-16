import Image from 'next/image';
import { ReactNode } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footerRightLabel?: string;
}

export default function AuthShell({
  title,
  description,
  children,
  footerRightLabel = 'Verified',
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fcfaf9] px-4 py-10">
      <div className="flex w-full max-w-[340px] flex-col items-center">
        <section className="w-full rounded-[18px] bg-white px-7 pb-7 pt-6 shadow-[0_18px_55px_rgba(74,43,37,0.08)]">
          <div className="mb-5 flex items-center justify-center gap-2">
            <Image src="/images/logo_h.png" alt="HOPECARD" width={30} height={30} className="h-[30px] w-[30px] object-contain" />
            <span className="text-[18px] font-extrabold tracking-[-0.02em] text-[#b25045]">HOPECARD</span>
          </div>

          <div className="mb-7 text-center">
            <h1 className="text-[15px] font-extrabold text-[#6d4a44]">{title}</h1>
            <p className="mx-auto mt-2 max-w-[230px] text-[10px] leading-[1.6] text-[#9d8f8b]">{description}</p>
          </div>

          {children}
        </section>

        <div className="mt-6 flex items-center gap-5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#c5bcb9]">
          <div className="flex items-center gap-1.5">
            <Lock size={10} strokeWidth={2.4} />
            <span>Secure SSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={10} strokeWidth={2.4} />
            <span>{footerRightLabel}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
