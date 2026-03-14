import { Router } from "express";
import { db, agentsTable, accountsTable, cardsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { sendSuccess, sendError } from "../lib/response.js";
import { NotFoundError, BadRequestError } from "../lib/errors.js";
import { createAuditLog } from "../lib/auditLogger.js";

const router = Router();

const VALID_TRANSITIONS: Record<string, string[]> = {
  active: ["frozen", "terminated"],
  frozen: ["active"],
  terminated: [],
};

const createCardSchema = z.object({
  agentId: z.string().min(1),
  accountId: z.string().min(1),
  last4: z.string().optional(),
  brand: z.string().optional(),
  network: z.string().optional(),
  cardRef: z.string().optional(),
});

const updateStatusSchema = z.object({ status: z.enum(["active", "frozen", "terminated"]) });
const toggleSpendingSchema = z.object({ spendingEnabled: z.boolean() });

router.get("/", async (_req, res, next) => {
  try {
    const cards = await db.select().from(cardsTable).orderBy(desc(cardsTable.createdAt));
    return sendSuccess(res, cards);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = createCardSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, parsed.data.agentId));
    if (!agent) throw new NotFoundError(`Agent ${parsed.data.agentId} not found`);
    const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, parsed.data.accountId));
    if (!account) throw new NotFoundError(`Account ${parsed.data.accountId} not found`);
    if (account.agentId !== parsed.data.agentId) throw new BadRequestError("Account does not belong to the provided agent");

    const [card] = await db.insert(cardsTable).values(parsed.data).returning();
    await createAuditLog({ entityType: "CARD", entityId: card.id, action: "CARD_CREATED", payloadJson: { agentId: card.agentId, accountId: card.accountId } });
    return sendSuccess(res, card, 201);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [card] = await db.select().from(cardsTable).where(eq(cardsTable.id, req.params.id));
    if (!card) throw new NotFoundError(`Card ${req.params.id} not found`);
    return sendSuccess(res, card);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const [card] = await db.select().from(cardsTable).where(eq(cardsTable.id, req.params.id));
    if (!card) throw new NotFoundError(`Card ${req.params.id} not found`);
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", parsed.error.errors.map(e => e.message).join("; "), 400);
    }
    const allowed = VALID_TRANSITIONS[card.status] ?? [];
    if (!allowed.includes(parsed.data.status)) {
      throw new BadRequestError(`Invalid status transition from ${card.status} to ${parsed.data.status}. Allowed: ${allowed.join(", ") || "none"}`);
    }
    const [updated] = await db.update(cardsTable).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(cardsTable.id, req.params.id)).returning();
    await createAuditLog({ entityType: "CARD", entityId: card.id, action: "CARD_STATUS_CHANGED", payloadJson: { from: card.status, to: updated.status } });
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/spending", async (req, res, next) => {
  try {
    const [card] = await db.select().from(cardsTable).where(eq(cardsTable.id, req.params.id));
    if (!card) throw new NotFoundError(`Card ${req.params.id} not found`);
    if (card.status === "terminated") throw new BadRequestError("Cannot toggle spending on a terminated card");
    const parsed = toggleSpendingSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "VALIDATION_ERROR", "spendingEnabled must be boolean", 400);
    }
    const [updated] = await db.update(cardsTable).set({ spendingEnabled: parsed.data.spendingEnabled, updatedAt: new Date() }).where(eq(cardsTable.id, req.params.id)).returning();
    await createAuditLog({ entityType: "CARD", entityId: card.id, action: "CARD_SPENDING_TOGGLED", payloadJson: { spendingEnabled: updated.spendingEnabled } });
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
});

export default router;
