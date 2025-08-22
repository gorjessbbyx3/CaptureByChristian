import { createApp } from './app';

describe('Health endpoints', () => {
  const app = createApp() as any;

  it('registers /health and /api/health routes', () => {
    const stack: any[] = app._router?.stack ?? [];
    const paths = stack
      .filter((l: any) => l.route && l.route.path)
      .map((l: any) => l.route.path);

    expect(paths).toContain('/health');
    expect(paths).toContain('/api/health');
  });
});
