const CONFIG = {
  'On Track': {
    dot:  'bg-emerald-400',
    text: 'text-emerald-400',
    bg:   'bg-emerald-400/10 border-emerald-400/20',
    pulse: false,
  },
  'Watch Mode': {
    dot:  'bg-amber-400 animate-pulse-soft',
    text: 'text-amber-400',
    bg:   'bg-amber-400/10 border-amber-400/20',
    pulse: true,
  },
  'Needs Attention': {
    dot:  'bg-red-400 animate-pulse-soft',
    text: 'text-red-400',
    bg:   'bg-red-400/10 border-red-400/20',
    pulse: true,
  },
}

export default function AgentStatus({ status, size = 'md' }) {
  const c = CONFIG[status] || CONFIG['On Track']
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const padding  = size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'

  return (
    <span className={`inline-flex items-center gap-2 ${padding} rounded-full border ${c.bg} transition-all duration-500`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
      <span className={`${textSize} font-semibold ${c.text}`}>{status}</span>
    </span>
  )
}
