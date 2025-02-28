import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as user from "./schema/user";
import * as posts from "./schema/post";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...user, ...posts },
});
