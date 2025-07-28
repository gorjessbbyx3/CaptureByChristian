import { build } from 'esbuild';

// Build the server with proper module resolution and externalize built-in node modules
build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: false,
  external: [
    'fs',
    'path',
    'os',
    'util',
    'stream',
    'events',
    'http',
    'https',
    'url',
    'crypto',
    'zlib',
    'tty',
    'net',
    'dns',
    'tls',
    'child_process',
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
    'ws',
    '@babel/preset-typescript',
    'lightningcss',
    'rollup',
    'vite',
    'esbuild',
    'typescript'
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  alias: {
    'node:fs': 'fs',
    'node:path': 'path',
    'node:os': 'os',
    'node:util': 'util',
    'node:stream': 'stream',
    'node:events': 'events',
    'node:http': 'http',
    'node:https': 'https',
    'node:url': 'url',
    'node:crypto': 'crypto',
    'node:zlib': 'zlib',
    'node:tty': 'tty',
    'node:net': 'net',
    'node:dns': 'dns',
    'node:tls': 'tls',
    'node:child_process': 'child_process'
  }
}).then(() => {
  console.log('✅ Server build completed successfully');
}).catch((error) => {
  console.error('❌ Server build failed:', error);
  process.exit(1);
});
