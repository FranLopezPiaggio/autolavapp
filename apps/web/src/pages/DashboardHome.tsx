
import { DollarSign, Users, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const kpis = [
    { title: 'Ingresos Totales', value: '$45,231.89', change: '+12.5%', isPositive: true, icon: DollarSign },
    { title: 'Usuarios Activos', value: '+2,350', change: '+18.2%', isPositive: true, icon: Users },
    { title: 'Ventas Mensuales', value: '1,245', change: '-3.1%', isPositive: false, icon: ShoppingBag },
];

const chartData = [
    { month: 'Ene', ingresos: 12000 },
    { month: 'Feb', ingresos: 19000 },
    { month: 'Mar', ingresos: 15000 },
    { month: 'Abr', ingresos: 22000 },
    { month: 'May', ingresos: 28000 },
    { month: 'Jun', ingresos: 35000 },
];

export default function DashboardHome() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Resumen General</h1>
                <p className="text-slate-400 text-sm">Métricas clave y rendimiento financiero</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={index} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm font-medium">{kpi.title}</span>
                                <div className="p-2.5 bg-slate-800 rounded-xl text-indigo-400">
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-bold text-white">{kpi.value}</span>
                                <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                    {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                    {kpi.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recharts Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-semibold text-white">Evolución de Ingresos</h2>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="ingresos" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}