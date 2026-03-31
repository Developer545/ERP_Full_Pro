/**
 * superadmin-auth.ts â€” Autenticacion para endpoints /api/superadmin/*.
 * Valida el header Authorization: Bearer <ERP_SUPERADMIN_API_KEY>.
 * No depende de cookies ni de la autenticacion tenant del ERP.
 */

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";

export type SuperAdminIdentity = {
  id: string;
  username: string;
  nombre: string;
  role: "SUPER_ADMIN";
  source: "api-key";
};

export function validateSuperadminKey(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const key = authHeader.slice(7).trim();
  return key.length > 0 && key === env.ERP_SUPERADMIN_API_KEY;
}

export function getSuperadminIdentity(req: NextRequest): SuperAdminIdentity | null {
  if (!validateSuperadminKey(req)) {
    return null;
  }

  return {
    id: "erp-superadmin-api-key",
    username: "panel-v3",
    nombre: "ERP Full Pro Panel",
    role: "SUPER_ADMIN",
    source: "api-key",
  };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
    { status: 401 }
  );
}
