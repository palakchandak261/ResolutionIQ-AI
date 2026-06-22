import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskAlertsTable = pgTable("risk_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  riskType: text("risk_type").notNull(),
  location: text("location").notNull(),
  ward: text("ward").notNull(),
  severity: text("severity").notNull().default("Medium"),
  status: text("status").notNull().default("Active"),
  confidence: real("confidence").notNull().default(0.8),
  relatedComplaintIds: integer("related_complaint_ids").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const insertRiskAlertSchema = createInsertSchema(riskAlertsTable).omit({ id: true, createdAt: true });
export type InsertRiskAlert = z.infer<typeof insertRiskAlertSchema>;
export type RiskAlert = typeof riskAlertsTable.$inferSelect;
