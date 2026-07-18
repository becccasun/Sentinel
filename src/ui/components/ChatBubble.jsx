function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function ChatBubble({ message }) {
  const isAgent = message.role === 'agent'

  return (
    <div className={`flex flex-col gap-1 animate-slide-up ${isAgent ? 'items-start' : 'items-end'}`}>
      {isAgent && (
        <span className="text-xs text-slate-600 px-1 font-medium">Money Sentinel</span>
      )}
      <div
        className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAgent
            ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
            : 'bg-emerald-500 text-slate-950 font-medium rounded-tr-sm'
        }`}
      >
        {message.text}
      </div>
      <span className={`text-xs text-slate-600 px-1 ${isAgent ? '' : 'text-right'}`}>
        {formatTime(message.timestamp)}
        {!isAgent && <span className="ml-1">· You</span>}
      </span>
    </div>
  )
}
