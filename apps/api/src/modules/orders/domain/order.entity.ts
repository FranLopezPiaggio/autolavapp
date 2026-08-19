// OrderStatus aligned with PRD / @repo/shared (6 states)
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface ServiceItem {
    id: string;
    name: string;
    price: number;
}

export interface OrderProps {
    id: string;
    customerName: string;
    vehiclePlate: string;
    services: ServiceItem[];
    status: OrderStatus;
    totalAmount: number;
    createdAt: Date;
    customerId?: string;
    vehicleId?: string;
    scheduledAt?: Date;
}

// Allowed transitions (PRD §Strict State Machine)
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED'],
    CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['READY'],
    READY: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};

export class InvalidStatusTransitionError extends Error {
    constructor(from: OrderStatus, to: OrderStatus) {
        super(`Invalid status transition: ${from} -> ${to}`);
        this.name = 'InvalidStatusTransitionError';
    }
}

export class Order {
    constructor(private props: OrderProps) {
        // Immutable snapshot: freeze the services array
        this.props = {
            ...props,
            services: Object.freeze([...props.services]) as ServiceItem[],
        };
    }

    get id(): string { return this.props.id; }
    get customerName(): string { return this.props.customerName; }
    get vehiclePlate(): string { return this.props.vehiclePlate; }
    get customerId(): string | undefined { return this.props.customerId; }
    get vehicleId(): string | undefined { return this.props.vehicleId; }
    get scheduledAt(): Date | undefined { return this.props.scheduledAt; }
    get services(): ServiceItem[] { return [...this.props.services]; }
    get status(): OrderStatus { return this.props.status; }
    get totalAmount(): number { return this.props.totalAmount; }
    get createdAt(): Date { return this.props.createdAt; }

    public changeStatus(newStatus: OrderStatus): void {
        const allowed = TRANSITIONS[this.props.status] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new InvalidStatusTransitionError(this.props.status, newStatus);
        }
        this.props.status = newStatus;
    }

    public toJSON(): OrderProps {
        return { ...this.props, services: [...this.props.services] };
    }
}
