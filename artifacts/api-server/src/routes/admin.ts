import { Router } from "express";
import { db } from "@workspace/db";
import { registrationsTable, eventSettingsTable } from "@workspace/db";
import { eq, and, inArray, count, desc } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "jamcritty-admin-2026";

function requireAdmin(req: import("express").Request, res: import("express").Response): boolean {
  const pw = req.headers["x-admin-password"];
  if (!pw || pw !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/registrations", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const rows = await db
    .select()
    .from(registrationsTable)
    .orderBy(desc(registrationsTable.created_at));
  return res.json(rows);
});

router.patch("/registrations/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  const { status, payment_status, payment_method, notes, checked_in } = req.body as {
    status?: string;
    payment_status?: string;
    payment_method?: string;
    notes?: string;
    checked_in?: boolean;
  };

  const validStatuses = ["pending", "approved", "rejected", "waitlist"];
  const validPayment = ["unpaid", "pending", "paid"];
  const validMethods = ["cash", "ecocash"];

  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }
  if (payment_status !== undefined && !validPayment.includes(payment_status)) {
    return res.status(400).json({ error: "Invalid payment_status value." });
  }
  if (payment_method !== undefined && payment_method !== null && !validMethods.includes(payment_method)) {
    return res.status(400).json({ error: "Invalid payment_method value." });
  }

  if (status === "approved") {
    const [existing] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Registration not found." });

    if (existing.status === "waitlist") {
      const [settings] = await db.select().from(eventSettingsTable).where(eq(eventSettingsTable.id, 1));
      const caps = settings ?? { max_total: 50, max_female: 34, max_male: 16 };

      const [countRow] = await db
        .select({ c: count() })
        .from(registrationsTable)
        .where(
          and(
            eq(registrationsTable.gender, existing.gender),
            inArray(registrationsTable.status, ["approved", "pending"]),
          ),
        );
      const genderCount = Number(countRow?.c ?? 0);
      const genderCap = existing.gender === "female" ? caps.max_female : caps.max_male;
      if (genderCount >= genderCap) {
        return res.status(409).json({ error: "That gender's cap is full — bump someone else first." });
      }
    }
  }

  const updateData: Record<string, unknown> = {};
  if (status !== undefined) updateData.status = status;
  if (payment_status !== undefined) updateData.payment_status = payment_status;
  if (payment_method !== undefined) updateData.payment_method = payment_method;
  if (notes !== undefined) updateData.notes = notes;
  if (checked_in !== undefined) {
    updateData.checked_in = checked_in;
    updateData.checked_in_at = checked_in ? new Date() : null;
  }

  const [updated] = await db
    .update(registrationsTable)
    .set(updateData)
    .where(eq(registrationsTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Registration not found." });
  return res.json(updated);
});

router.delete("/registrations/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  await db.delete(registrationsTable).where(eq(registrationsTable.id, id));
  return res.status(204).send();
});

router.post("/tickets/lookup", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: "Token is required." });
  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.ticket_token, token.toUpperCase()));
  if (!registration) return res.status(404).json({ error: "Ticket not found." });
  return res.json(registration);
});

router.post("/checkin", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id, collect_cash } = req.body as { id?: string; collect_cash?: boolean };
  if (!id) return res.status(400).json({ error: "id is required." });

  const [existing] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id));
  if (!existing) return res.status(404).json({ error: "Registration not found." });

  if (existing.checked_in) {
    const t = existing.checked_in_at;
    const timeStr = t
      ? t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : "unknown time";
    return res.status(409).json({
      error: `Already checked in at ${timeStr}.`,
      checked_in_at: existing.checked_in_at,
    });
  }

  const updateData: Record<string, unknown> = {
    checked_in: true,
    checked_in_at: new Date(),
  };
  if (collect_cash) {
    updateData.payment_status = "paid";
    updateData.payment_method = "cash";
  }

  const [updated] = await db
    .update(registrationsTable)
    .set(updateData)
    .where(eq(registrationsTable.id, id))
    .returning();

  return res.json(updated);
});

router.post("/walkup", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { full_name, gender } = req.body as { full_name?: string; gender?: string };

  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ error: "Full name must be at least 2 characters." });
  }
  if (!gender || !["female", "male"].includes(gender)) {
    return res.status(400).json({ error: "Please select a gender." });
  }

  const [settings] = await db.select().from(eventSettingsTable).where(eq(eventSettingsTable.id, 1));
  const caps = settings ?? { max_total: 50, max_female: 34, max_male: 16 };

  const [femaleRow] = await db
    .select({ c: count() })
    .from(registrationsTable)
    .where(and(eq(registrationsTable.gender, "female"), inArray(registrationsTable.status, ["approved", "pending"])));
  const [maleRow] = await db
    .select({ c: count() })
    .from(registrationsTable)
    .where(and(eq(registrationsTable.gender, "male"), inArray(registrationsTable.status, ["approved", "pending"])));

  const femaleCount = Number(femaleRow?.c ?? 0);
  const maleCount = Number(maleRow?.c ?? 0);
  const totalCount = femaleCount + maleCount;

  if (totalCount >= caps.max_total) {
    return res.status(409).json({ error: "The event is at capacity. Walk-up declined." });
  }
  const genderCount = gender === "female" ? femaleCount : maleCount;
  const genderCap = gender === "female" ? caps.max_female : caps.max_male;
  if (genderCount >= genderCap) {
    return res.status(409).json({ error: `The ${gender} cap is full. Walk-up declined.` });
  }

  const [registration] = await db
    .insert(registrationsTable)
    .values({
      full_name: full_name.trim(),
      gender,
      phone: "",
      instagram_handle: "",
      status: "approved",
      payment_status: "pending",
      payment_method: "cash",
      notes: "Walk-up at door",
    })
    .returning();

  return res.status(201).json(registration);
});

router.get("/caps", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const [settings] = await db.select().from(eventSettingsTable).where(eq(eventSettingsTable.id, 1));
  if (!settings) {
    const [inserted] = await db
      .insert(eventSettingsTable)
      .values({ id: 1, max_total: 50, max_female: 34, max_male: 16 })
      .returning();
    return res.json(inserted);
  }
  return res.json(settings);
});

router.put("/caps", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { max_total, max_female, max_male } = req.body as {
    max_total?: number;
    max_female?: number;
    max_male?: number;
  };

  if (
    max_total === undefined ||
    max_female === undefined ||
    max_male === undefined ||
    !Number.isInteger(max_total) ||
    !Number.isInteger(max_female) ||
    !Number.isInteger(max_male) ||
    max_total < 0 ||
    max_female < 0 ||
    max_male < 0
  ) {
    return res.status(400).json({ error: "max_total, max_female, max_male must be non-negative integers." });
  }

  const [updated] = await db
    .update(eventSettingsTable)
    .set({ max_total, max_female, max_male, updated_at: new Date() })
    .where(eq(eventSettingsTable.id, 1))
    .returning();

  if (!updated) {
    const [inserted] = await db
      .insert(eventSettingsTable)
      .values({ id: 1, max_total, max_female, max_male })
      .returning();
    return res.json(inserted);
  }
  return res.json(updated);
});

export default router;
