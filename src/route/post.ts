import { Hono } from "hono";
import { Variables } from "..";
import { authMiddleware } from "./middleware";
import { db } from "../db";
import { posts } from "../db/schema/post";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { asc, count, desc, eq } from "drizzle-orm";

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

// Get a single post by ID
app.get("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const post = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  return c.json(
    post.length ? { data: post[0] } : { error: "Post not found" },
    post.length ? 200 : 404
  );
});

app.put("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const updatedPost = await db
    .update(posts)
    .set(body)
    .where(eq(posts.id, id))
    .returning();
  return c.json({ data: updatedPost });
});

// Get paginated posts by a user
app.get("/:id/user", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const offset = (page - 1) * limit;

  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(posts.createdAt));
  const [totalUserPosts] = await db
    .select({ count: count(posts) })
    .from(posts)
    .where(eq(posts.authorId, id));
  return c.json({
    data: userPosts,
    meta: {
      page,
      limit,
      total: totalUserPosts.count || 0,
      totalPages: Math.ceil((totalUserPosts.count || 0) / limit),
    },
  });
});

app.delete("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(posts).where(eq(posts.id, id));
  return c.json({ success: true, message: "Post deleted" });
});
