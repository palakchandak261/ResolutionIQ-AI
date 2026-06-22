import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complaintsTable = pgTable("complaints", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  department: text("department").notNull().default(""),
  status: text("status").notNull().default("Pending"),
  severity: text("severity").notNull().default("Medium"),
  priority: text("priority").notNull().default("Normal"),
  ward: text("ward").notNull(),
  location: text("location").notNull(),
  citizenName: text("citizen_name").notNull(),
  citizenEmail: text("citizen_email").notNull(),
  assignedTo: text("assigned_to"),
  imageUrl: text("image_url"),
  votes: integer("votes").notNull().default(0),
  aiConfidence: real("ai_confidence").notNull().default(0.85),
  aiSummary: text("ai_summary").notNull().default(""),
  isDuplicate: boolean("is_duplicate").notNull().default(false),
  duplicateOf: integer("duplicate_of"),
  estimatedResolutionDays: integer("estimated_resolution_days").notNull().default(7),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertComplaintSchema = createInsertSchema(complaintsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaintsTable.$inferSelect;
