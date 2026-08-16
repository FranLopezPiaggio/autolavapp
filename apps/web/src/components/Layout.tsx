
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Usuarios & Data', path: '/dashboard/users', icon: Users },
    { label: 'Analíticas', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Configuración', path: '/dashboard/settings', icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">D</div>
                        <span className="font-bold text-lg text-white">CoreDash</span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${isActive
                                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}