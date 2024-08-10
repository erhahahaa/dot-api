import Elysia, { getSchemaValidator } from "elysia";
import { InsertMediaSchema, MediaParent } from "../../feats/media/media.schema";
import { BadRequestError, UnsupportedMediaTypeError } from "../errors";
import { sb } from "./sb";

const BucketService = new Elysia().derive({ as: "global" }, () => ({
  async uploadFile({
    parent,
    blob,
    withUniqueName = true,
  }: {
    parent: MediaParent;
    blob: Blob;
    withUniqueName?: boolean;
  }) {
    let name = blob.name;
    if (withUniqueName) {
      const unique = Math.floor(Math.random() * 900000) + 100000;
      name = `${unique}_${blob.name}`;
    }

    const check = getSchemaValidator(InsertMediaSchema.properties.type).Check(
      blob.type
    );

    if (!check)
      throw new UnsupportedMediaTypeError("Invalid file type : " + blob.type);

    const result = await sb.storage.from(`${parent}s`).upload(name, blob, {
      contentType: blob.type,
      upsert: true,
    });

    if (result.error) throw new BadRequestError(result.error.message);

    const url = sb.storage.from(`${parent}s`).getPublicUrl(name);

    return {
      url: url.data.publicUrl,
      name,
    };
  },

  async deleteFile({ parent, path }: { parent: string; path: string }) {
    return await sb.storage.from(`${parent}s`).remove([path]);
  },
}));

export { BucketService };
