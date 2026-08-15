import { Order } from '../domain/order.entity.js';
import type { ServiceItem } from '../domain/order.entity.js';
import type { OrderRepository } from '../domain/order.repository.js';

// DTO: Lo que necesita el caso de uso para ejecutar la acción
export interface CreateOrderInput {
    customerName: string;
    vehiclePlate: string;
    services: ServiceItem[];
}

export class CreateOrderUseCase {
    // Inyección de dependencias a través de la interfaz (Puerto)
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(input: CreateOrderInput): Promise<Order> {
        // 1. Lógica de Negocio: Calcular el monto total de la orden
        const totalAmount = input.services.reduce((sum, item) => sum + item.price, 0);

        // 2. Lógica de Negocio: Crear entidad con valores por defecto (ID único, fecha, estado inicial)
        const newOrder = new Order({
            id: crypto.randomUUID(), // Usamos la API nativa de Node.js para UUID
            customerName: input.customerName,
            vehiclePlate: input.vehiclePlate.toUpperCase(), // Regla: Matrícula siempre en mayúsculas
            services: input.services,
            status: 'PENDING',
            totalAmount,
            createdAt: new Date(),
        });

        // 3. Persistir usando el puerto del repositorio
        await this.orderRepository.save(newOrder);

        return newOrder;
    }
}