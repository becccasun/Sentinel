import { Minus, Plus } from 'lucide-react'

export default function NumberInput({ value, onChange, min = 0, max = 9999, step = 25, prefix = '$', suffix = '', label, description }) {
  const dec = () => onChange(Math.max(min, value - step))
  const inc = () => onChange(Math.min(max, value + step))

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        {label && <p className="text-sm font-medium text-slate-200">{label}</p>}
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={dec} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all">
          <Minus size={12} />
        </button>
        <span className="w-16 text-center text-sm font-semibold text-slate-100 money">
          {prefix}{value}{suffix}
        </span>
        <button onClick={inc} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all">
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}
