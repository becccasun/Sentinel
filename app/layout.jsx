import './globals.css';
import { DM_Sans } from 'next/font/google';
import { StoreProvider } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Toasts from '@/components/Toasts';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: 'Sentinel | Your finances, reviewed daily',
  description: 'An AI agent that reviews your whole financial life daily: spending, subscriptions, banking, and investing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <StoreProvider>
          <Sidebar />
          <main><div className="col">{children}</div></main>
          <Toasts />
        </StoreProvider>
      </body>
    </html>
  );
}
