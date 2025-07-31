import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

// Dynamic imports to avoid compilation errors in production
const viteLogger = {
  info: console.log,
  warn: console.warn, 
  error: console.error
};

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  try {
    // Dynamic import to avoid build-time errors
    const { createServer: createViteServer, createLogger } = await import('vite');
    const viteConfigModule = await import('../vite.config.js');
    const viteConfig = viteConfigModule.default;
    
    const logger = createLogger();
    
    const serverOptions = {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true as const,
    };

    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      customLogger: {
        ...logger,
        error: (msg: string, options?: any) => {
          logger.error(msg, options);
          process.exit(1);
        },
      },
      server: serverOptions,
      appType: "custom",
    });

    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      try {
        const currentDir = path.dirname(new URL(import.meta.url).pathname);
        const clientTemplate = path.resolve(
          decodeURIComponent(currentDir),
          "..",
          "client",
          "index.html",
        );

        // always reload the index.html file from disk incase it changes
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } catch (error) {
    console.error('Failed to setup Vite:', error);
    throw error;
  }
}

export function serveStatic(app: Express) {
const currentDir = path.dirname(new URL(import.meta.url).pathname);
const distPath = path.resolve(decodeURIComponent(currentDir), "../dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
