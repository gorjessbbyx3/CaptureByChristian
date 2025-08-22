import request from 'supertest';
import { createApp } from './app';

describe('Health endpoints', () => {
  const app = createApp() as any;

  const runSupertest = process.env.CI === 'true';

  if (runSupertest) {
    it('GET /health returns 200 and payload (CI)', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('GET /api/health returns 200 and payload (CI)', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
    });
  } else {
    it('registers /health and /api/health routes (local sandbox)', () => {
      const stack: any[] = app._router?.stack ?? [];
      const paths = stack
        .filter((l: any) => l.route && l.route.path)
        .map((l: any) => l.route.path);

      expect(paths).toContain('/health');
      expect(paths).toContain('/api/health');
    });
  }
});
