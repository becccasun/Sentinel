'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Home, Report, Chart, Repeat, Target, LinkIc } from '@/lib/icons';

const PAGES = [
  { href: '/',              t: 'Overview',           Ic: Home },
  { href: '/report',        t: 'Daily report',       Ic: Report, cnt: 1 },
  { href: '/spending',      t: 'Spending',           Ic: Chart },
  { href: '/subscriptions', t: 'Subscriptions',      Ic: Repeat },
  { href: '/goals',         t: 'Goals & guardrails', Ic: Target },
  { href: '/connections',   t: 'Connections',        Ic: LinkIc },
];

export default function Sidebar() {
  const path = usePathname();
  const { state } = useStore();
  const platforms = state.accounts.length + state.connectable.filter(c => c.connected).length;
  return (
    <aside className="sidebar">
      <Link className="logo" href="/">
        <span className="mark"><span /></span>
        <span className="word">Sentinel</span>
      </Link>
      <div className="step-meta">Your money</div>
      <nav className="nav">
        {PAGES.map(({ href, t, Ic, cnt }) => (
          <Link key={href} href={href} className={`nav-item ${path === href ? 'active' : ''}`}>
            <Ic /> {t}{cnt ? <span className="cnt">{cnt}</span> : null}
          </Link>
        ))}
      </nav>
      <div className="side-spacer" />
      <div className="agent-pill"><span className="dot" /> Agent watching · {platforms} platforms</div>
      <div className="userbox">
        <div className="em">alex@example.com</div>
        <div className="sub">Daily report · {state.reportTime} via SMS</div>
      </div>
    </aside>
  );
}
