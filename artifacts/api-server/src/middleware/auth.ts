import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { db, workspaceApiKeysTable } from "@workspace/db";
import { eq, isNull } from "drizzle-orm";

const PRIVY_APP_ID = "cmmq9suw202wk0clhb690sjxz";

const JWKS = createRemoteJWKSet(
  new URL(`https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`),
);

async function verifyPrivyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: "privy.io",
      audience: PRIVY_APP_ID,
    });
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

async function verifyWorkspaceKey(token: string): Promise<string | null> {
  if (!token.startsWith("olympay_ws_")) return null;
  try {
    const [row] = await db
      .select()
      .from(workspaceApiKeysTable)
      .where(eq(workspaceApiKeysTable.key, token));
    if (!row) return null;
    if (row.revokedAt) return null;
    return row.workspaceId;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" },
    });
    return;
  }

  const token = authHeader.slice(7);

  let workspaceId = await verifyWorkspaceKey(token);

  if (!workspaceId) {
    workspaceId = await verifyPrivyToken(token);
  }

  if (!workspaceId) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
    return;
  }

  (req as any).workspaceId = workspaceId;
  next();
}
