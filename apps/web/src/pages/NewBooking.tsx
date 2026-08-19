import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Search, CalendarDays, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
}

interface Slot {
    startTime: string;
    endTime: string;
}

interface DaySlots {
    date: string;
    day_name: string;
    slots: Slot[];
}

const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
const fmtPrice = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function NewBooking() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Step 1: customer
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [customerFound, setCustomerFound] = useState<{ name: string; phone: string } | null>(null);

    // Step 2: vehicle
    const [plate, setPlate] = useState('');
    const [vehicleFound, setVehicleFound] = useState<{ plates: string; customer_name: string | null } | null>(null);

    // Step 3: services (+ availability data loaded from step 4)
    const [services, setServices] = useState<Service[] | null>(null);
    const [selected, setSelected] = useState<string[]>([]);

    // Step 4: availability
    const [days, setDays] = useState<DaySlots[] | null>(null);
    const [slot, setSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);

    // Loading / feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState(false);

    const searchCustomer = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get<{ name: string; phone: string }[]>('/customers', { params: { search: phone } });
            setCustomerFound(data.find((c) => c.phone === phone) ?? null);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Error al buscar cliente');
        } finally {
            setLoading(false);
        }
    };

    const searchVehicle = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get<{ plates: string; customer_name: string | null }[]>('/vehicles', { params: { plate } });
            setVehicleFound(data.find((v) => v.plates.toUpperCase() === plate.toUpperCase()) ?? null);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Error al buscar vehículo');
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Service[]>('/services', { params: { active: 'true' } });
            setServices(data);
            setStep(3);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Error al cargar servicios');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailability = async () => {
        if (selected.length === 0) {
            setError('Seleccioná al menos un servicio');
            return;
        }
        setLoading(true);
        setError(null);
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() + 1);
        const to = new Date(from);
        to.setDate(from.getDate() + 6);
        const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        try {
            const { data } = await api.get<{ days: DaySlots[] }>('/availability', {
                params: { date_from: fmt(from), date_to: fmt(to), serviceIds: selected.join(',') },
            });
            setDays(data.days);
            setSlot(null);
            setStep(4);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Error al consultar disponibilidad');
        } finally {
            setLoading(false);
        }
    };

    const confirm = async () => {
        if (!slot) return;
        setLoading(true);
        setError(null);
        const chosen = services!.filter((s) => selected.includes(s.id));
        try {
            await api.post('/orders', {
                customerName: name,
                customerPhone: phone,
                vehiclePlate: plate,
                services: chosen.map((s) => ({ id: s.id, name: s.name, price: s.price })),
                scheduledAt: slot.startTime,
            });
            setCreated(true);
            setTimeout(() => navigate('/dashboard/reservas'), 1200);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Error al crear la reserva. Intentá de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (id: string) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

    const startOver = () => {
        setStep(1);
        setDays(null);
        setSlot(null);
        setCreated(false);
        setSelected([]);
    };

    const input =
        'w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-4 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';
    const btnPrimary =
        'bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const btnGhost =
        'border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2';

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Nueva Reserva</h1>
                    <p className="text-slate-400 text-sm">Paso {step} de 5</p>
                </div>
                <Link to="/dashboard/reservas" className="text-slate-400 hover:text-white text-sm">Cancelar</Link>
            </div>

            {/* Progress bar */}
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                ))}
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {created ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center py-16 rounded-2xl">
                    <Check className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-xl font-bold">Reserva creada con éxito</p>
                    <p className="text-sm mt-1">Redirigiendo al listado...</p>
                </div>
            ) : (
                <>
                    {/* STEP 1: Customer */}
                    {step === 1 && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h2 className="font-semibold text-white">Datos del Cliente</h2>
                            <input className={input} placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
                            <div className="flex gap-2">
                                <input className={input} placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                <button onClick={searchCustomer} disabled={loading || !phone} className={btnGhost}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    Buscar
                                </button>
                            </div>
                            {customerFound && (
                                <div className="bg-slate-800 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm">
                                    <p className="text-indigo-400 font-medium">Cliente existente encontrado</p>
                                    <p className="text-slate-300">{customerFound.name} · {customerFound.phone}</p>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button disabled={!name || !phone} onClick={() => setStep(2)} className={btnPrimary}>
                                    Continuar <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Vehicle */}
                    {step === 2 && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h2 className="font-semibold text-white">Datos del Vehículo</h2>
                            <div className="flex gap-2">
                                <input className={input} placeholder="Patente (ej: ABC123)" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} />
                                <button onClick={searchVehicle} disabled={loading || !plate} className={btnGhost}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    Buscar
                                </button>
                            </div>
                            {vehicleFound && (
                                <div className="bg-slate-800 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm">
                                    <p className="text-indigo-400 font-medium">Vehículo existente</p>
                                    <p className="text-slate-300">{vehicleFound.plates} {vehicleFound.customer_name ? `· ${vehicleFound.customer_name}` : ''}</p>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className={btnGhost}>
                                    <ArrowLeft className="w-4 h-4" /> Volver
                                </button>
                                <button disabled={!plate} onClick={loadServices} className={btnPrimary}>
                                    Continuar <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Services */}
                    {step === 3 && services && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h2 className="font-semibold text-white">Seleccioná el/los servicio(s)</h2>
                            <div className="space-y-2">
                                {services.map((s) => {
                                    const isOn = selected.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => toggleService(s.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${isOn
                                                    ? 'bg-indigo-600/10 border-indigo-500/40'
                                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-white">{s.name}</p>
                                                <p className="text-xs text-slate-400">{s.duration_minutes} min {s.description ? `· ${s.description}` : ''}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-indigo-400">{fmtPrice(s.price)}</span>
                                                {isOn && <Check className="w-4 h-4 text-indigo-400" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between">
                                <button onClick={() => setStep(2)} className={btnGhost}>
                                    <ArrowLeft className="w-4 h-4" /> Volver
                                </button>
                                <button onClick={loadAvailability} disabled={loading} className={btnPrimary}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                                    Ver disponibilidad
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Availability */}
                    {step === 4 && days && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h2 className="font-semibold text-white">Disponibilidad próximos 7 días</h2>
                            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                                {days.map((d) => (
                                    <div key={d.date}>
                                        <p className="text-sm font-medium text-slate-300 mb-2">{d.day_name} · {d.date}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {d.slots.length === 0 && <span className="text-xs text-slate-500">Sin turnos disponibles</span>}
                                            {d.slots.map((s) => {
                                                const isOn = slot?.startTime === s.startTime;
                                                return (
                                                    <button
                                                        key={s.startTime}
                                                        onClick={() => setSlot({ date: d.date, startTime: s.startTime, endTime: s.endTime })}
                                                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${isOn
                                                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500/50'
                                                            }`}
                                                    >
                                                        {fmtTime(s.startTime)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between">
                                <button onClick={() => setStep(3)} className={btnGhost}>
                                    <ArrowLeft className="w-4 h-4" /> Volver
                                </button>
                                <button disabled={!slot} onClick={() => setStep(5)} className={btnPrimary}>
                                    Continuar <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Confirm */}
                    {step === 5 && slot && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h2 className="font-semibold text-white">Confirmar Reserva</h2>
                            <dl className="space-y-3 text-sm">
                                {[
                                    ['Cliente', `${name} · ${phone}`],
                                    ['Vehículo', plate],
                                    ['Servicios', services!.filter((s) => selected.includes(s.id)).map((s) => s.name).join(', ')],
                                    ['Fecha', slot.date],
                                    ['Horario', `${fmtTime(slot.startTime)} - ${fmtTime(slot.endTime)}`],
                                    ['Total', fmtPrice(services!.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + s.price, 0))],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <dt className="text-slate-400">{k}</dt>
                                        <dd className="text-white font-medium text-right">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                            <div className="flex justify-between pt-2">
                                <button onClick={startOver} className={btnGhost}>
                                    <ArrowLeft className="w-4 h-4" /> Empezar de nuevo
                                </button>
                                <button onClick={confirm} disabled={loading} className={btnPrimary}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Confirmar Reserva
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}