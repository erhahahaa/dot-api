import { eq } from "drizzle-orm";
import { createLogger } from "logixlysia/src/logger";
import { Logger } from "logixlysia/src/types";
import { db, sb } from "~/lib";
import { medias, MediaType, ParentType } from "~/schemas/media";

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

export function sanitize(
  obj: any,
  exceptsNotation: string[],
  deleteOperation = false
) {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (deleteOperation) {
      if (exceptsNotation.includes(key)) {
        delete obj[key];
      }
    } else {
      if (!exceptsNotation.includes(key)) {
        result[key] = obj[key];
      }
    }
  });
  return result;
}

export async function uploadFile({
  creatorId,
  parent,
  blob,
  mediaId,
  clubId,
}: {
  creatorId: string;
  parent: ParentType;
  blob: Blob;
  mediaId?: number | null;
  clubId?: number;
}) {
  const hash = Math.floor(Math.random() * 900000) + 100000;
  const path = `${hash}_${blob.name}`;

  const res = await sb.storage.from(`${parent}s`).upload(path, blob, {
    upsert: true,
  });

  if (res.error) {
    return {
      error: res.error,
    };
  }

  const url = sb.storage.from(`${parent}s`).getPublicUrl(path);

  const q = {
    creatorId: parseInt(creatorId),
    name: blob.name,
    fileSize: blob.size,
    path,
    type: blob.type as any,
    parent: parent as any,
    url: url.data.publicUrl,
    clubId,
  };
  let media;
  if (mediaId) {
    media = await db
      .update(medias)
      .set(q)
      .where(eq(medias.id, mediaId))
      .returning();
  } else {
    media = await db.insert(medias).values(q).returning();
  }

  if (media.length == 0) {
    return {
      error: "Failed to insert media into database",
    };
  }

  return {
    result: media[0],
  };
}

export async function deleteFile({
  fileName,
  path,
  parent,
}: {
  fileName: string[];
  path: string;
  parent: MediaType["parent"];
}) {
  const res = await sb.storage.from(`${parent}s`).remove(fileName);
  if (res.error) {
    return {
      error: res.error,
    };
  }

  const media = await db
    .delete(medias)
    .where(eq(medias.path, path))
    .returning();

  if (media.length == 0) {
    return {
      error: "Failed to delete media from database",
    };
  }

  return {
    result: media[0],
  };
}

export function debounce(
  func: { apply: (arg0: any, arg1: any[]) => void },
  wait: number | undefined
) {
  let timeout: number | Timer | undefined;
  return  (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
