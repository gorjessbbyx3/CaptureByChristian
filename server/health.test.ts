import request from "supertest";
import { createApp } from "./app";

describe("Health endpoints", () => {
  const app = createApp() as any;

  const runSupertest = process.env.CI === "true";

  if (runSupertest) {
    it("GET /health returns 200 and payload (CI)", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "healthy");
      expect(res.body).toHaveProperty("timestamp");
    });

    it("GET /api/health returns 200 and payload (CI)", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "healthy");
      expect(res.body).toHaveProperty("timestamp");
    });
  } else {
    let httpMocks: any;
    try {
      httpMocks = require("node-mocks-http");
    } catch {
      it.skip("skipped: node-mocks-http not installed in sandbox", () => {});
      return;
    }

    it("handles /health without sockets (local sandbox)", async () => {
      const req = httpMocks.createRequest({ method: "GET", url: "/health" });
      const res = httpMocks.createResponse({
        eventEmitter: require("events").EventEmitter,
      });

      await new Promise<void>((resolve, reject) => {
        res.on("end", () => resolve());
        try {
          app.handle(req, res as any);
        } catch (e) {
          reject(e);
        }
      });

      expect(res.statusCode).toBe(200);
      const data = res._getData();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      expect(parsed).toHaveProperty("status", "healthy");
    });

    it("handles /api/health without sockets (local sandbox)", async () => {
      const req = httpMocks.createRequest({
        method: "GET",
        url: "/api/health",
      });
      const res = httpMocks.createResponse({
        eventEmitter: require("events").EventEmitter,
      });

      await new Promise<void>((resolve, reject) => {
        res.on("end", () => resolve());
        try {
          app.handle(req, res as any);
        } catch (e) {
          reject(e);
        }
      });

      expect(res.statusCode).toBe(200);
      const data = res._getData();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      expect(parsed).toHaveProperty("status", "healthy");
    });
  }
});
