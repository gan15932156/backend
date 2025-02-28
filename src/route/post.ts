import { Hono } from "hono";
import { Variables } from "..";
import { authMiddleware } from "./middleware";
import { db } from "../db";
import { posts, postsInsertSchema } from "../db/schema/post";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono<{ Variables: Variables }>();
export default app;

app.post(
  "/",
  authMiddleware,
  zValidator(
    "json",
    z.object({ title: z.string().min(1), content: z.string().min(1) })
  ),
  async (c) => {
    const userPayload = c.get("user");
    const body = await c.req.valid("json");
    const [newPost] = await db
      .insert(posts)
      .values({ ...body, authorId: userPayload.id })
      .returning();
    return c.json({ data: newPost });
  }
);

app.get("/", authMiddleware, async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const offset = (page - 1) * limit;

  const allPosts = await db.select().from(posts).limit(limit).offset(offset);
  const totalPosts = await db.$count(posts);

  return c.json({
    data: allPosts,
    meta: {
      page,
      limit,
      total: totalPosts || 0,
      totalPages: Math.ceil((totalPosts || 0) / limit),
    },
  });
});
