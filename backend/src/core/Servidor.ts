import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import categoriaRoutes from '../route/categoria.route';
import prestadorRoutes from '../route/prestador.route'
import resenaRoutes from '../route/resena.route'
import usuarioRoutes from '../route/usuario.route';
import { errorHandler } from '../middlewares/errorHandler';

export class Servidor {
    private app: Application;

    constructor() {
        this.app = express();
        this.middlewares();
        this.rutas();
        this.manejoErrores();
    }

    private middlewares() {
        const origenesEnv = (process.env.CORS_ORIGIN ?? '')
            .split(',')
            .map((origen) => origen.trim())
            .filter(Boolean);
        const origenesPermitidos = Array.from(
            new Set([
                'http://localhost:5173',
                'http://localhost:5174',
                ...origenesEnv,
            ])
        );
        this.app.use(
            cors({
                origin: origenesEnv.includes('*') ? '*' : origenesPermitidos,
            })
        );
        this.app.use(express.json({ limit: '5mb' }));
    }

    private rutas() {
        this.app.get('/api/v1/health', (_req: Request, res: Response) => {
        res.status(200).json({ code: 200, msg: 'Ok', data: { status: 'up' } });
        });
        this.app.use('/api/v1/categorias', categoriaRoutes);
        this.app.use('/api/v1/prestadores', prestadorRoutes);
        this.app.use('/api/v1/resenas', resenaRoutes);
        this.app.use('/api/v1', usuarioRoutes); 
    }

    private manejoErrores() {
        this.app.use(errorHandler);
    }

    obtenerApp(): Application {
        return this.app;
    }

    escuchar(port: number) {
        this.app.listen(port, () => console.log(`Backend en puerto ${port}`));
    }
}
