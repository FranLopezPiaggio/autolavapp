import { Order } from '../domain/order.entity.js';
import type { ServiceItem } from '../domain/order.entity.js';
import type { OrderRepository } from '../domain/order.repository.js';
import { CreateCustomerUseCase } from './create-customer.use-case.js';
import { CreateVehicleUseCase } from './create-vehicle.use-case.js';

// Input DTO: what the use case needs to run
// phone included for customer lookup (REQ §2.1)
// scheduledAt included for the availability slot (REQ §2.3)
export interface CreateOrderInput {
    customerName: string;
    customerPhone: string;
    vehiclePlate: string;
    services: ServiceItem[];
    scheduledAt?: Date; // optional: omitted -> created without a slot
}

export class CreateOrderUseCase {
    // Dependency injection through the interface (Port)
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(input: CreateOrderInput): Promise<Order> {
        // --- REQ §2: Client/Vehicle on new plate ---
        // 1. Create/lookup customer by phone
        const createCustomerUseCase = new CreateCustomerUseCase();
        const customer = await createCustomerUseCase.execute({
            phone: input.customerPhone,
            name: input.customerName,
        });

        // 2. Create/lookup vehicle by plate (linked to the customer)
        const createVehicleUseCase = new CreateVehicleUseCase();
        const vehicle = await createVehicleUseCase.execute({
            plate: input.vehiclePlate,
            customerId: customer.id,
            vehicleType: 'CAR', // default; extend later if needed
            vehicleSize: 'MEDIUM',
        });

        // 3. Business logic: compute the total order amount
        const totalAmount = input.services.reduce((sum, item) => sum + Number(item.price), 0);

        // 4. Business logic: create entity with defaults (unique ID, date, initial status)
        const orderProps: ConstructorParameters<typeof Order>[0] = {
            id: crypto.randomUUID(),
            customerName: input.customerName,
            vehiclePlate: input.vehiclePlate.toUpperCase(),
            services: input.services,
            status: 'PENDING',
            totalAmount,
            createdAt: new Date(),
            customerId: customer.id,
            vehicleId: vehicle.id,
        };
        if (input.scheduledAt) {
            orderProps.scheduledAt = input.scheduledAt;
        }
        const newOrder = new Order(orderProps);

        // 6. Persist via the repository port
        await this.orderRepository.save(newOrder);

        return newOrder;
    }
}