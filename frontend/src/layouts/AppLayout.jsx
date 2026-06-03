import { NavLink, Outlet } from "react-router-dom";
import { Bot, History, LayoutDashboard, LogOut, Moon, ScanLine, Sun, Users, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ChatbotPanel from "../components/ChatbotPanel";
import NotificationCenter from "../components/NotificationCenter";

const nav = [
  { to: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { to: "/scanner", label: "Threat Scanner", icon: ScanLine },
  { to: "/history", label: "Audit History", icon: History },
  { to: "/tips", label: "Security Playbook", icon: Zap }
];

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const items = isAdmin ? [...nav, { to: "/admin", label: "Admin Console", icon: Users }] : nav;

  return (
    <div className="min-h-screen bg-panel text-ink dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-950/90 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <img src="/logo.svg" alt="PhishGuard AI" className="h-14 w-14 rounded bg-white object-contain p-1 shadow-glow" />
          <div className="min-w-0">
            <p className="text-lg font-bold">PhishGuard AI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise threat defense</p>
          </div>
        </div>
        <div className="mb-5 rounded border border-cyber-500/20 bg-cyber-50 p-3 text-xs text-slate-600 dark:border-cyber-500/30 dark:bg-slate-900 dark:text-slate-300">
          <p className="font-bold text-cyber-700 dark:text-cyber-400">Security Operations</p>
          <p className="mt-1">AI-assisted phishing detection, evidence tracking, and user risk monitoring.</p>
        </div>
        <nav className="space-y-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyber-500 text-white shadow-glow"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyber-600 dark:text-cyber-400">PhishGuard Security Cloud</p>
            <h1 className="text-xl font-bold">Welcome back, {user?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <button className="rounded border border-slate-200 p-2 dark:border-slate-800" title="AI Assistant">
              <Bot size={18} />
            </button>
            <button onClick={toggleTheme} className="rounded border border-slate-200 p-2 dark:border-slate-800" title="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={logout} className="rounded border border-slate-200 p-2 text-signal-red dark:border-slate-800" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-14 flex-col items-center gap-1 rounded px-2 py-1 text-[11px] ${
                isActive ? "text-cyber-500" : "text-slate-500 dark:text-slate-400"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <ChatbotPanel />
    </div>
  );
}
