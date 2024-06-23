import os from "os";
import { ServerType } from "..";

export function createHealthRouter(app: ServerType) {
  app.get("/", () => {
    return {
      status: "ok",
      message: "Server is running",
    };
  });
  app.get("/info", () => {
    return {
      cpu: os.cpus(),
      memory: os.totalmem(),
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch(),
    };
  });
  return app;
}
