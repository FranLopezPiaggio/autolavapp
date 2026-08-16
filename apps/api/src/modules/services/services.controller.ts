import { Router, Request, Response } from 'express';
import { ServicesService } from './services.service.js';

export function createServicesRouter(servicesService: ServicesService): Router {
    const router = Router();

    // GET /api/services - Obtener catálogo de servicios activos
    router.get('/', async (_req: Request, res: Response) => {
        try {
            const services = await servicesService.getActiveServices();
            res.json(services);
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Error al obtener servicios' });
        }
    });

    // POST /api/services - Crear un nuevo servicio
    router.post('/', async (req: Request, res: Response) => {
        try {
            const newService = await servicesService.createService(req.body);
            res.status(201).json(newService);
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error al crear servicio' });
        }
    });

    // GET /api/services/working-hours - Obtener horarios de atención
    router.get('/working-hours', async (_req: Request, res: Response) => {
        try {
            const hours = await servicesService.getWorkingHours();
            res.json(hours);
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Error al obtener horarios' });
        }
    });

    return router;
}