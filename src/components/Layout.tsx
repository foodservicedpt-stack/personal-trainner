import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, CalendarDays, PlusCircle, BarChart3, Settings } from 'lucide-react'
import InstallPrompt from './InstallPrompt'

const navItems = [
  { to: '/', icon: Home, label: 'Hoy', end: true },
  { to: '/semana', icon: CalendarDays, label: 'Semana' },
  { to: '/registrar', icon: PlusCircle, label: 'Registrar' },
  { to: '/progreso', icon: BarChart3, label: 'Progreso' },
  { to: '/ajustes', icon: Settings, label: 'Ajustes' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[260px_1fr] lg:min-h-screen">
        <aside className="hidden lg:flex lg:flex-col lg:border-r lg:border-slate-800/60 lg:bg-slate-900/40 lg:sticky lg:top-0 lg:h-screen">
          <div className="px-6 py-5 border-b border-slate-800/60">
            <h1 className="text-lg font-semibold tracking-tight text-slate-100">Personal Trainer</h1>
            <p className="text-xs text-slate-400 mt-1">Tu planificador adaptativo</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navegación principal">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-lime-500/10 text-lime-400'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-slate-800/60">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Versión local. Datos privados en tu dispositivo.
            </p>
          </div>
        </aside>

        <main className="min-h-screen pb-24 lg:pb-0">
          <div className="max-w-2xl mx-auto px-4 py-5">
            <Outlet />
          </div>
        </main>
      </div>

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl"
        aria-label="Navegación inferior"
      >
        <div className="mx-auto max-w-lg grid grid-cols-5">
          {navItems.map(({ to, icon: Icon, label, end }) => {
            const isActive = end ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={`flex flex-col items-center justify-center py-2 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-lime-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </NavLink>
            )
          })}
        </div>
      </nav>

      <InstallPrompt />
    </div>
  )
}
