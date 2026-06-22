import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const departmentsTable = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  head: text("head").notNull(),
  email: text("email").notNull(),
  slaHours: integer("sla_hours").notNull().default(72),
  activeComplaints: integer("active_complaints").notNull().default(0),
  totalResolved: integer("total_resolved").notNull().default(0),
  avgResolutionHours: real("avg_resolution_hours").notNull().default(0),
});

export const insertDepartmentSchema = createInsertSchema(departmentsTable).omit({ id: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departmentsTable.$inferSelect;
