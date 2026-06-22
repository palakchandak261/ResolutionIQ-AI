import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, riskAlertsTable } from "@workspace/db";
import { CreateRiskAlertBody, UpdateRiskAlertBody, UpdateRiskAlertParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatAlert(a: typeof riskAlertsTable.$inferSelect) {
  return {
    ...a,
    createdAt: a.createdAt.toISOString(),
    resolvedAt: a.resolvedAt ? a.resolvedAt.toISOString() : null,
  };
}

router.get("/risk/alerts", async (_req, res): Promise<void> => {
  const alerts = await db.select().from(riskAlertsTable).orderBy(riskAlertsTable.createdAt);
  res.json(alerts.map(formatAlert));
});

router.post("/risk/alerts", async (req, res): Promise<void> => {
  const parsed = CreateRiskAlertBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [alert] = await db.insert(riskAlertsTable).values({
    ...parsed.data,
    relatedComplaintIds: parsed.data.relatedComplaintIds ?? [],
  }).returning();
  res.status(201).json(formatAlert(alert));
});

router.patch("/risk/alerts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateRiskAlertBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updateData: Partial<typeof riskAlertsTable.$inferInsert> = {};
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.status === "Resolved") updateData.resolvedAt = new Date();
  const [alert] = await db.update(riskAlertsTable).set(updateData).where(eq(riskAlertsTable.id, id)).returning();
  if (!alert) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatAlert(alert));
});

export default router;
