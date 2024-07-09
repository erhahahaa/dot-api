import { createLogger } from "logixlysia/src/logger";
import { Logger } from "logixlysia/src/types";

export const DEFAULT = Symbol();

export class MapWithDefault<K, V> extends Map<K | typeof DEFAULT, V> {
  get(key: K): V {
    return super.get(key) ?? (super.get(DEFAULT) as V);
  }
}

export const logConfig = {
  ip: true,
  logFilePath: "logs/app.log",
  customLogFormat:
    "🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip}",
};

export const log: Logger = createLogger({
  config: logConfig,
});
