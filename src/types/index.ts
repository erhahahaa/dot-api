import { JWTPayloadSpec } from "@elysiajs/jwt";

export type JWTPlugin = {
  readonly sign: (
    morePayload: Record<string, string | number> & JWTPayloadSpec
  ) => Promise<string>;
  readonly verify: (
    jwt?: string
  ) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
};

export type APIResponse = {
  readonly error?: string;
  readonly message?: string;
  readonly data?: Record<string, any> | Record<string, any>[];
};

export type WebSocketMessage = {
  readonly type: "create" | "join" | "leave";
  readonly params: Record<string, any> | Record<string, any>[];
  readonly data: Record<string, any> | Record<string, any>[];
};
