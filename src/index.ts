import { serve } from "@hono/node-server";
import { Hono, type Context, type Next } from "hono";
import user from "./route/user";
import auth from "./route/auth";
import post from "./route/post";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { cors } from "hono/cors";
import { authMiddleware } from "./route/middleware";

export const roleMiddleware =
  (role: "ADMIN" | "USER") => async (c: Context, next: Next) => {
    const user = c.get("user");
    if (user.role !== role) return c.json({ error: "Forbidden" }, 403);
    await next();
  };
export type Variables = {
  user: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    exp: number;
  };
};
const errorHandler = (err: Error | HTTPException, c: Context) => {
  console.log("=== Caught Error ===");
  if (err instanceof HTTPException) {
    return c.text(err.message, err.status);
  }
  if (err instanceof z.ZodError) {
    return c.text(err.errors.map((err) => err.message).join(",\n"), 400);
  }
  console.error(err);
  return c.text("Something went wrong", 500);
};

const app = new Hono<{ Variables: Variables }>().basePath("/api");
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173",
  })
);
app.onError(errorHandler);

app.route("/user", user);
app.route("/post", post);
app.route("/auth", auth);

app.get("/pro", authMiddleware, async (c) => {
  const user = c.get("user");
  console.log(user);
  return c.text("Hello Hono!");
});
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
