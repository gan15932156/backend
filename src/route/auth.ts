import { Hono } from "hono";
import { db } from "../db/index";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema/user";
import { compare } from "bcryptjs";
import { sign } from "hono/jwt";

const app = new Hono();
export default app;

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
  if (!user) return c.json({ error: "Invalid credentials" }, 401);
  if (await compare(password, user.password)) {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };
    const token = await sign(payload, process.env.SECRET!);
    return c.json({ accessToken: token });
  }
  return c.json({ error: "Invalid credentials" }, 401);
});
