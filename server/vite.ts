import * as express from "express";
import { type Express } from "express";
import * as fs from "fs";
import * as path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

// Type definitions for dynamic imports to avoid compilation errors
type ViteDevServer = {
  middlewares: any;
  transformIndexHtml: (url: string, html: string) => Promise<string>;
  ssrFixStacktrace: (error: Error) => void;
};

type ViteModule = {
  createServer: (config: any) => Promise<ViteDevServer>;
  createLogger: () => any;
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
    // Dynamic import to avoid build-time errors in production
    const viteModule: ViteModule = await import('vite') as any;
    const { createServer: createViteServer, createLogger } = viteModule;
    
    // Use empty config to avoid module declaration issues
    const viteConfig = {};
    
    const logger = createLogger();
    
    const serverOptions = {
      middlewareMode: true as const,
      hmr: { server },
      allowedHosts: true as const,
    };

    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      customLogger: {
        ...logger,
        error: (msg: string, options?: { error?: Error; timestamp?: boolean; clear?: boolean }) => {
          logger.error(msg, options);
          process.exit(1);
        },
      },
      server: serverOptions,
      appType: "custom" as const,
    });

    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      try {
        const currentDir = __dirname;
        const clientTemplate = path.resolve(
          currentDir,
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
  const currentDir = __dirname;
  const distPath = path.resolve(currentDir, "../dist/public");

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
