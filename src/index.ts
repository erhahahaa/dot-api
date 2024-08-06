import { initializeBuckets } from "./core/services/sb";
import { createApp } from "./core/services/server";
import { env } from "./utils/env";

await initializeBuckets();
export const app = createApp();
app.listen(parseInt(env.APP_PORT));
