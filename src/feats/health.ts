import Elysia from "elysia";
import os from "os";

export const HealthRouter = new Elysia()
  .get(
    "/",
    () => {
      return {
        status: "ok",
        message: "Server is running",
      };
    },
    {
      detail: {
        tags: ["HEALTH"],
      },
    }
  )
  .get(
    "/info",
    () => {
      console.log("GET /info");
      return {
        cpu: os.cpus(),
        memory: os.totalmem(),
        uptime: os.uptime(),
        platform: os.platform(),
        arch: os.arch(),
      };
    },
    {
      detail: {
        tags: ["HEALTH"],
      },
    }
  );
