import { Router } from "express";
import { db, agentsTable, accountsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { sendSuccess } from "../lib/response.js";
import { NotFoundError } from "../lib/errors.js";

const router = Router({ mergeParams: true });

router.get("/", async (req, res, next) => {
  try {
    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, req.params.agentId));
    if (!agent) throw new NotFoundError(`Agent ${req.params.agentId} not found`);
    const accounts = await db.select().from(accountsTable).where(eq(accountsTable.agentId, req.params.agentId)).orderBy(desc(accountsTable.createdAt));
    return sendSuccess(res, accounts);
  } catch (err) {
    next(err);
  }
});

export default router;
