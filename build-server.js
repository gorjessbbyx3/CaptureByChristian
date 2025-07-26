import { build } from 'esbuild';

// Build the server with proper module resolution
build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: false,
  external: [
    '@babel/preset-typescript',
    'lightningcss',
    'express',
    'cors',
    'dotenv',
    'pg',
    'drizzle-orm',
    'openai',
    'multer',
    'twilio',
    'cheerio',
    'stripe',
    'node-cron',
    'ws'
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).then(() => {
  console.log('✅ Server build completed successfully');
}).catch((error) => {
  console.error('❌ Server build failed:', error);
  process.exit(1);
});
