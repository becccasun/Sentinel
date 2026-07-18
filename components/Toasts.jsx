'use client';
import { useStore } from '@/lib/store';

export default function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toasts">
      {toasts.map(t => <div key={t.id} className="toast"><span className="t-dot" />{t.msg}</div>)}
    </div>
  );
}
