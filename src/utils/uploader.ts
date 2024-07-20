import { sb } from "~/lib";

export async function uploadSBFile({
  parent,
  blob,
}: {
  parent: string;
  blob: Blob;
}) {
  const hash = Math.floor(Math.random() * 900000) + 100000;
  const path = `${hash}_${blob.name}`;

  const res = await sb.storage.from(`${parent}s`).upload(path, blob, {
    contentType: blob.type,
    // upsert: true,
  });

  if (res.error) {
    return {
      error: res.error,
    };
  }

  const url = sb.storage.from(`${parent}s`).getPublicUrl(path);

  return {
    result: {
      url: url.data.publicUrl,
      path,
    },
  };
}

export async function deleteSBFile({
  parent,
  path,
}: {
  parent: string;
  path: string;
}) {
  return await sb.storage.from(`${parent}s`).remove([path]);
}
