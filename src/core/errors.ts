import { DEFAULT, MapWithDefault } from "../utils";

export class AuthenticationError extends Error {
  public status = 401;
  public type = "authentication";
  constructor(public message: string) {
    super(message);
  }
}

export class AuthorizationError extends Error {
  public status = 403;
  public type = "authorization";
  constructor(public message: string) {
    super(message);
  }
}

export class BadRequestError extends Error {
  public status = 400;
  public type = "bad_request";
  constructor(public message: string) {
    super(message);
  }
}

export class StorageError extends Error {
  public status = 500;
  public type = "storage";
  constructor(public message: string) {
    super(message);
  }
}

export class ServerError extends Error {
  public status = 500;
  public type = "internal";
  constructor(public message: string) {
    super(message);
  }
}

export class NoContentError extends Error {
  public status = 204;
  public type = "no_content";
  constructor(public message: string) {
    super(message);
  }
}

export class UnsupportedMediaTypeError extends Error {
  public status = 415;
  public type = "unsupported_media_type";
  constructor(public message: string) {
    super(message);
  }
}

export const ERROR_CODE_STATUS_MAP = new MapWithDefault<string, number>([
  ["NO_CONTENT", 204],
  ["PARSE", 400],
  ["BAD_REQUEST", 400],
  ["UNSUPPORTED_MEDIA_TYPE", 415],
  ["VALIDATION", 422],
  ["NOT_FOUND", 404],
  ["INVALID_COOKIE_SIGNATURE", 401],
  ["AUTHENTICATION", 401],
  ["AUTHORIZATION", 403],
  ["INTERNAL_SERVER_ERROR", 500],
  ["UNKNOWN", 500],
  [DEFAULT, 500],
]);
