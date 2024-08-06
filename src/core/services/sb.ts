import { createClient } from "@supabase/supabase-js";
import { env } from "../../utils/env";

const BUCKETS_NAME = [
  "users",
  "clubs",
  "programs",
  "exercises",
  "exams",
  "questions",
  "tacticals",
];

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
const initializeBuckets = async () => {
  const buckets = await sb.storage.listBuckets();
  if (buckets.error) throw buckets.error;

  for (const bucket of BUCKETS_NAME) {
    if (!buckets.data.find((b) => b.name === bucket)) {
      const newBucket = await sb.storage.createBucket(bucket, { public: true });
      if (newBucket.error) throw newBucket.error;
      console.log("Bucket created", newBucket.data);
    }
  }

  console.log("Buckets ready 🚀");
};

export { initializeBuckets, sb };
