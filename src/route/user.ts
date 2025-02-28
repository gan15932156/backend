import { Hono } from "hono";
import { hash } from "bcryptjs";
import { db } from "../db/index";
import { userInsertSchema, usersTable } from "../db/schema/user";
import { zValidator } from "@hono/zod-validator";
import { sign, verify } from "hono/jwt";
import { eq } from "drizzle-orm";
import { type Variables } from "../index";
import { authMiddleware } from "./middleware";

const app = new Hono<{ Variables: Variables }>();
export default app;

app.get("/", async (c) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      age: usersTable.age,
      email: usersTable.email,
    })
    .from(usersTable);
  return c.json({ success: true, data: users });
});

app.post("/register", zValidator("json", userInsertSchema), async (c) => {
  const { name, email, age, password } = c.req.valid("json");
  const emailExist = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
  if (emailExist) {
    return c.json({ error: "Email already registered" }, 400);
  }
  const hasedPassword = await hash(password, 10);
  const [newUser] = await db
    .insert(usersTable)
    .values({ name, email, age, password: hasedPassword, role: "USER" })
    .returning();
  const payload = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 5 minutes
  };
  const token = await sign(payload, process.env.SECRET!);
  return c.json({
    accessToken: token,
  });
});

app.get("/me", authMiddleware, async (c) => {
  const userPayload = c.get("user");
  const user = await db.query.usersTable.findFirst({
    columns: { id: true, age: true, email: true, name: true, role: true },
    where: eq(usersTable.id, userPayload.id),
  });
  return c.json({ data: user });
});

app.put("/", authMiddleware, async (c) => {
  const userPayload = c.get("user");
  const user = await db.query.usersTable.findFirst({
    columns: { id: true, age: true, email: true, name: true, role: true },
    where: eq(usersTable.id, userPayload.id),
  });
  if (!user) return c.json({ error: "User not found." }, 400);
  const body = await c.req.json();
  const [res] = await db
    .update(usersTable)
    .set(body)
    .where(eq(usersTable.id, user.id))
    .returning({
      id: usersTable.id,
      age: usersTable.age,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
    });
  return c.json({ success: true, data: res });
});
