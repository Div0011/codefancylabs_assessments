'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FolderOpen, CheckSquare, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-sav-gold/15 bg-white/75 -webkit-backdrop-filter backdrop-blur-lg backdrop-filter backdrop-blur-lg hidden md:flex md:flex-col shadow-[4px_0_24px_rgba(90,77,28,0.02)]">
      <div className="flex h-16 items-center px-6 border-b border-sav-gold/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sav-gold-bright via-sav-gold to-sav-gold-dark text-white shadow-[0_4px_12px_rgba(189,162,55,0.2)]">
            <FolderOpen className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-sav-text tracking-tight leading-tight">Project Tracker</h1>
            <p className="text-[9px] font-bold text-sav-gold-dark uppercase tracking-widest">Codefancy Lab</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3.5 rounded-2xl px-4.5 py-3 text-sm font-semibold transition-all duration-300 relative',
                isActive 
                  ? 'bg-gradient-to-r from-sav-gold/8 to-sav-gold/2 text-sav-gold-dark shadow-[inset_3px_0_0_#bda237] border-l-0' 
                  : 'text-sav-text/75 hover:bg-sav-surface hover:text-sav-text'
              )}
            >
              <Icon className={cn('h-4 w-4 transition-transform duration-300 group-hover:scale-110', isActive ? 'text-sav-gold' : 'text-sav-bronze group-hover:text-sav-gold')} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-sav-gold" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <div className="rounded-3xl bg-gradient-to-br from-sav-text via-[#2a2c22] to-sav-text p-5 text-white shadow-[0_8px_30px_rgba(26,27,21,0.15)] relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-sav-gold/10 blur-xl group-hover:bg-sav-gold/25 transition-colors duration-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-sav-gold-bright">Internal Workspace</p>
          <p className="text-xs text-white/70 mt-1">Codefancy Lab administrative portal.</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-white/50">Online & Secured</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
