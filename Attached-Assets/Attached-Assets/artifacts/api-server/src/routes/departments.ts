import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, departmentsTable, complaintsTable } from "@workspace/db";
import { CreateDepartmentBody, UpdateDepartmentBody, UpdateDepartmentParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/departments/stats/workload", async (_req, res): Promise<void> => {
  const depts = await db.select().from(departmentsTable);
  const complaints = await db.select().from(complaintsTable);
  const workload = depts.map(d => {
    const dc = complaints.filter(c => c.department === d.name);
    const resolved = dc.filter(c => c.status === "Resolved").length;
    const pending = dc.filter(c => c.status === "Pending").length;
    const active = dc.filter(c => c.status !== "Resolved").length;
    const breached = dc.filter(c => {
      if (c.status === "Resolved") return false;
      const hours = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
      return hours > d.slaHours;
    }).length;
    return { departmentName: d.name, activeComplaints: active, resolved, pending, breachedSla: breached };
  });
  res.json(workload);
});

router.get("/departments", async (_req, res): Promise<void> => {
  const depts = await db.select().from(departmentsTable);
  res.json(depts);
});

router.post("/departments", async (req, res): Promise<void> => {
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [dept] = await db.insert(departmentsTable).values(parsed.data).returning();
  res.status(201).json(dept);
});

router.patch("/departments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateDepartmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [dept] = await db.update(departmentsTable).set(parsed.data).where(eq(departmentsTable.id, id)).returning();
  if (!dept) { res.status(404).json({ error: "Not found" }); return; }
  res.json(dept);
});

export default router;
