import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user";
import { createInsertSchema } from "drizzle-zod";

export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(usersTable, {
    fields: [posts.authorId],
    references: [usersTable.id],
  }),
}));

export const postsInsertSchema = createInsertSchema(posts);
