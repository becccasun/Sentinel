import { LayoutDashboard, Shield, CreditCard, TrendingUp, MessageSquare } from 'lucide-react'

const NAV = [
  { id: 'dashboard',     label: 'Dashboard',     Icon: LayoutDashboard },
  { id: 'guardrails',    label: 'Guardrails',     Icon: Shield          },
  { id: 'subscriptions', label: 'Subscriptions',  Icon: CreditCard      },
  { id: 'investments',   label: 'Investments',    Icon: TrendingUp      },
  { id: 'checkin',       label: 'Check-In',       Icon: MessageSquare   },
]

export default function NavBar({ activeScreen, onNavigate }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-slate-950 border-r border-slate-800 flex flex-col z-10">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
            M
          </div>
          <span className="font-semibold text-slate-100 text-sm tracking-tight">Money Sentinel</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`nav-item w-full ${activeScreen === id ? 'active' : ''}`}
          >
            <Icon size={16} className={activeScreen === id ? 'text-emerald-400' : ''} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">Alex's accounts</p>
        <p className="text-xs text-slate-500 mt-0.5">Fri, Jul 18, 2026</p>
      </div>
    </aside>
  )
}
