import { useEffect, useState } from 'react';

interface Metrics {
  todayRevenue: number;
  monthlyRevenue: number;
  activeVehicles: number;
  pendingTurns: number;
}

interface Order {
  id: string;
  customerName: string;
  vehiclePlate: string;
  services: { id: string; name: string; price: number }[];
  status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
}

export default function App() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const API_URL = 'http://localhost:3000';

  const fetchData = async () => {
    try {
      const [resMetrics, resOrders] = await Promise.all([
        fetch(`${API_URL}/dashboard/summary`),
        fetch(`${API_URL}/orders`),
      ]);
      setMetrics(await resMetrics.json());
      setOrders(await resOrders.json());
    } catch (err) {
      console.error('Error conectando a la API:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !vehiclePlate) return;

    await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        vehiclePlate,
        services: [{ id: '1', name: 'Lavado Completo', price: 5000 }],
      }),
    });

    setCustomerName('');
    setVehiclePlate('');
    fetchData(); // Recargar métricas y lista
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🏎️ Admin Lavadero</h1>

      {/* BLOQUE A: MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <small>Caja del Día</small>
          <h2>${metrics?.todayRevenue ?? 0}</h2>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <small>Facturación Mes</small>
          <h2>${metrics?.monthlyRevenue ?? 0}</h2>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <small>En Lavado</small>
          <h2>{metrics?.activeVehicles ?? 0}</h2>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <small>Pendientes</small>
          <h2>{metrics?.pendingTurns ?? 0}</h2>
        </div>
      </div>

      {/* BLOQUE B: SIMULAR RESERVA */}
      <form onSubmit={handleCreateOrder} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input
          placeholder="Nombre del Cliente"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={{ padding: '0.5rem', flex: 1 }}
        />
        <input
          placeholder="Patente (ej: AA123BB)"
          value={vehiclePlate}
          onChange={(e) => setVehiclePlate(e.target.value)}
          style={{ padding: '0.5rem', flex: 1 }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: '#fff', border: 'none' }}>
          + Simular Reserva
        </button>
      </form>

      {/* BLOQUE C: TABLERO OPERATIVO */}
      <h3>Órdenes Activas</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map((ord) => (
          <div key={ord.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{ord.customerName}</strong> ({ord.vehiclePlate}) - <small>${ord.totalAmount}</small>
              <div>Estado actual: <code>{ord.status}</code></div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {ord.status === 'PENDING' && (
                <button onClick={() => handleStatusChange(ord.id, 'IN_PROGRESS')}>Iniciar Lavado</button>
              )}
              {ord.status === 'IN_PROGRESS' && (
                <button onClick={() => handleStatusChange(ord.id, 'READY')}>Marcar Listo</button>
              )}
              {ord.status === 'READY' && (
                <button onClick={() => handleStatusChange(ord.id, 'COMPLETED')}>Entregar y Cobrar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}