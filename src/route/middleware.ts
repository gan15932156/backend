import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = await verify(token, process.env.SECRET!);
    c.set("user", payload); // ส่งข้อมูล user ไปใช้ใน Route อื่นๆ
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});
