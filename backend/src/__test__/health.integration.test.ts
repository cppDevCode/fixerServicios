import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { crearApp } from './helpers/crearApp';

const app = crearApp();

describe('API - Integración (en memoria)', () => {
    it('GET /api/v1/health responde con la estructura unificada', async () => {
        const res = await request(app).get('/api/v1/health').expect(200);

        expect(res.body).toHaveProperty('code', 200);
        expect(res.body).toHaveProperty('msg', 'Ok');
        expect(res.body.data).toEqual({ status: 'up' });
    });
});