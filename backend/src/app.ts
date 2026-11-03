import dotenv from 'dotenv';
import { Servidor } from './core/Servidor';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const servidor = new Servidor();
servidor.escuchar(PORT);
