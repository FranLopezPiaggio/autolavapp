type UserRow = { id: number; name: string; email: string; role: string; status: string };

const data: UserRow[] = [
    { id: 1, name: 'Ana García', email: 'ana@example.com', role: 'Admin', status: 'Activo' },
    { id: 2, name: 'Carlos López', email: 'carlos@example.com', role: 'Editor', status: 'Inactivo' },
    { id: 3, name: 'María Rodríguez', email: 'maria@example.com', role: 'Usuario', status: 'Activo' },
];

const headers: { key: keyof UserRow; label: string }[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' },
    { key: 'status', label: 'Estado' },
];

function StatusBadge({ value }: { value: string }) {
    const active = value === 'Activo';
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
            {value}
        </span>
    );
}

function Cell({ row, header }: { row: UserRow; header: { key: keyof UserRow; label: string } }) {
    const value = row[header.key];
    return (
        <td className="p-4">
            {header.key === 'status' ? <StatusBadge value={String(value)} /> : String(value)}
        </td>
    );
}

export default function UsersTable() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
                <p className="text-slate-400 text-sm">Listado completo de la base de usuarios</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                        <tr>
                            {headers.map((h) => (
                                <th key={h.key} className="p-4 font-semibold">{h.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {data.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-800/30 transition">
                                {headers.map((h) => <Cell key={h.key} row={row} header={h} />)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
