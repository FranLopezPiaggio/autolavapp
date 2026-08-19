import { useEffect, useState } from 'react';
import { DollarSign, Car, Clock, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';

interface Summary {
    todayRevenue: number;
    monthlyRevenue: number;
    activeVehicles: number;
    pendingTurns: number;
}

const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export default function DashboardHome() {
    const [summary, setSummary] = useState<Summary | null>(null);

    useEffect(() => {
        api.get<Summary>('/dashboard/summary')
            .then(({ data }) => setSummary(data))
            .catch(() => { /* 401/403 handled by interceptor; ignore the rest */ });
    }, []);

    const kpis = summary
        ? [
              { title: 'Ingresos de Hoy', value: ars.format(summary.todayRevenue), icon: DollarSign },
              { title: 'Ingresos del Mes', value: ars.format(summary.monthlyRevenue), icon: CalendarDays },
              { title: 'Vehículos en Proceso', value: String(summary.activeVehicles), icon: Car },
              { title: 'Turnos Pendientes', value: String(summary.pendingTurns), icon: Clock },
          ]
        : [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Resumen General</h1>
                <p className="text-slate-400 text-sm">Métricas clave y rendimiento financiero</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}