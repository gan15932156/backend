import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { posts } from "./post";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["ADMIN", "USER"]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: roleEnum(),
});
export const userRelations = relations(usersTable, ({ many }) => ({
  posts: many(posts),
}));

export const userInsertSchema = createInsertSchema(usersTable);
