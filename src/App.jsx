import { useState } from 'react'
import { AppProvider } from './logic/state/AppContext'
import NavBar from './ui/components/NavBar'
import Dashboard from './ui/screens/Dashboard'
import Guardrails from './ui/screens/Guardrails'
import Subscriptions from './ui/screens/Subscriptions'
import Investments from './ui/screens/Investments'
import CheckInChat from './ui/screens/CheckInChat'

const SCREENS = {
  dashboard:     Dashboard,
  guardrails:    Guardrails,
  subscriptions: Subscriptions,
  investments:   Investments,
  checkin:       CheckInChat,
}

function AppShell() {
  const [screen, setScreen] = useState('dashboard')
  const Screen = SCREENS[screen]

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <NavBar activeScreen={screen} onNavigate={setScreen} />

      <main className="ml-56 flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Screen onNavigate={setScreen} />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
