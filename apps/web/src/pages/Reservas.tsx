import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const STATUS: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Pendiente', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    CONFIRMED: { label: 'Confirmada', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    IN_PROGRESS: { label: 'En curso', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    READY: { label: 'Lista', cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    COMPLETED: { label: 'Completada', cls: 'bg-green-700/20 text-green-400 border-green-700/40' },
    CANCELLED: { label: 'Cancelada', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

// Same transitions as the domain entity (apps/api/src/modules/orders/domain/order.entity.ts)
const TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED'],
    CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['READY'],
    READY: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};

interface Order {
    id: string;
    customerName: string;
    customerPhone?: string;
    vehiclePlate: string;
    services: { id: string; name: string; price: number }[];
    status: string;
    totalAmount: number;
    scheduledAt?: string;
    createdAt: string;
}

const fmtDate = (d?: string) =>
    d
        ? new Date(d).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
        : '—';

export default function Reservas() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get<Order[]>('/orders');
            setOrders(data);
            setError(null);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Error al cargar reservas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // Sort: scheduled first, then created (newest first)
    const sorted = [...orders].sort((a, b) => {
        if (a.scheduledAt && b.scheduledAt) return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        if (a.scheduledAt) return -1;
        if (b.scheduledAt) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const changeStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            setError(null);
            load();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Error al cambiar estado');
            load();
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Reservas</h1>
                    <p className="text-slate-400 text-sm">Gestion de turnos</p>
                </div>
                <Link to="/dashboard/nueva-reserva" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nueva Reserva
                </Link>
            </div>

            {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
                </div>
            ) : sorted.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 text-center py-20 rounded-2xl text-slate-400">
                    <p className="text-lg font-medium text-white mb-1">No hay reservas todavía</p>
                    <p className="text-sm">Creá la primera desde "Nueva Reserva".</p>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-left text-slate-400">
                                <th className="px-5 py-3 font-medium">Fecha</th>
                                <th className="px-5 py-3 font-medium">Cliente</th>
                                <th className="px-5 py-3 font-medium">Vehículo</th>
                                <th className="px-5 py-3 font-medium">Servicios</th>
                                <th className="px-5 py-3 font-medium">Total</th>
                                <th className="px-5 py-3 font-medium">Estado</th>
                                <th className="px-5 py-3 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((o) => {
                                const st = STATUS[o.status] ?? { label: o.status, cls: 'bg-slate-800 text-slate-300 border-slate-700' };
                                const next = TRANSITIONS[o.status] ?? [];
                                return (
                                    <tr key={o.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                                        <td className="px-5 py-3 text-white">{fmtDate(o.scheduledAt)}</td>
                                        <td className="px-5 py-3 text-slate-300">{o.customerName}</td>
                                        <td className="px-5 py-3 text-slate-300">{o.vehiclePlate}</td>
                                        <td className="px-5 py-3 text-slate-300">{o.services.map((s) => s.name).join(', ')}</td>
                                        <td className="px-5 py-3 text-white font-medium">
                                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(o.totalAmount)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${st.cls}`}>{st.label}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {next.length === 0 ? (
                                                <span className="text-xs text-slate-600">Terminal</span>
                                            ) : (
                                                <select
                                                    defaultValue=""
                                                    onChange={(e) => e.target.value && changeStatus(o.id, e.target.value)}
                                                    className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="" disabled>Cambiar...</option>
                                                    {next.map((s) => (
                                                        <option key={s} value={s}>{STATUS[s]?.label ?? s}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}