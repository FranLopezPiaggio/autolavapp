export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ServiceItem {
    id: string;
    name: string;   // Ej: "Lavado completo", "Limpieza de tapizado"
    price: number;
}

export interface OrderProps {
    id: string;
    customerName: string;
    vehiclePlate: string; // Patente/Matrícula del vehículo
    services: ServiceItem[];
    status: OrderStatus;
    totalAmount: number;
    createdAt: Date;
}

export class Order {
    constructor(private props: OrderProps) { }

    // Getter para exponer propiedades de forma inmutable
    get id(): string { return this.props.id; }
    get customerName(): string { return this.props.customerName; }
    get vehiclePlate(): string { return this.props.vehiclePlate; }
    get services(): ServiceItem[] { return this.props.services; }
    get status(): OrderStatus { return this.props.status; }
    get totalAmount(): number { return this.props.totalAmount; }
    get createdAt(): Date { return this.props.createdAt; }

    // Regla de negocio del dominio: Cambiar estado
    public changeStatus(newStatus: OrderStatus): void {
        if (this.props.status === 'COMPLETED' || this.props.status === 'CANCELLED') {
            throw new Error(`No se puede cambiar el estado de una orden ${this.props.status.toLowerCase()}`);
        }
        this.props.status = newStatus;
    }

    public toJSON(): OrderProps {
        return { ...this.props };
    }
}