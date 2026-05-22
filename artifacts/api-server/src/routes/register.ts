import { Router } from "express";
import { db } from "@workspace/db";
import { registrationsTable, eventSettingsTable } from "@workspace/db";
import { eq, inArray, or, ilike, and, count, sql } from "drizzle-orm";

const router = Router();

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

router.post("/register", async (req, res) => {
  try { await (await import("@workspace/db")).pool.query("SELECT 1"); } catch (e) {
    const cause = (e as { cause?: { message?: string } })?.cause?.message || (e as Error).message;
    return res.status(500).json({ error: `DB connection failed: ${cause}` });
  }
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Try again later." });
  }

  const { full_name, gender, phone, instagram_handle, website } = req.body as {
    full_name?: string;
    gender?: string;
    phone?: string;
    instagram_handle?: string;
    website?: string;
  };

  if (website && website.length > 0) {
    return res.status(400).json({ error: "Invalid submission" });
  }

  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ error: "Full name must be at least 2 characters." });
  }
  if (!gender || !["female", "male"].includes(gender)) {
    return res.status(400).json({ error: "Please select a gender." });
  }
  if (!phone || phone.trim().length < 7) {
    return res.status(400).json({ error: "Please enter a valid phone number." });
  }
  if (!instagram_handle || instagram_handle.trim().length === 0) {
    return res.status(400).json({ error: "Instagram handle is required." });
  }

  const cleanHandle = instagram_handle.trim().replace(/^@/, "");
  const cleanPhone = phone.trim();
  const cleanName = full_name.trim();

  const existing = await db
    .select({ id: registrationsTable.id })
    .from(registrationsTable)
    .where(
      or(
        ilike(registrationsTable.phone, cleanPhone),
        ilike(registrationsTable.instagram_handle, cleanHandle),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: "This phone number or Instagram handle is already registered." });
  }

  const [settings] = await db.select().from(eventSettingsTable).where(eq(eventSettingsTable.id, 1));
  const caps = settings ?? { max_total: 50, max_female: 34, max_male: 16 };

  const [femaleRow] = await db
    .select({ c: count() })
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.gender, "female"),
        inArray(registrationsTable.status, ["approved", "pending"]),
      ),
    );
  const [maleRow] = await db
    .select({ c: count() })
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.gender, "male"),
        inArray(registrationsTable.status, ["approved", "pending"]),
      ),
    );

  const femaleCount = Number(femaleRow?.c ?? 0);
  const maleCount = Number(maleRow?.c ?? 0);
  const totalCount = femaleCount + maleCount;

  let status: "approved" | "waitlist";
  if (totalCount >= caps.max_total) {
    status = "waitlist";
  } else if (gender === "female" && femaleCount >= caps.max_female) {
    status = "waitlist";
  } else if (gender === "male" && maleCount >= caps.max_male) {
    status = "waitlist";
  } else {
    status = "approved";
  }

  const [registration] = await db
    .insert(registrationsTable)
    .values({
      full_name: cleanName,
      gender,
      phone: cleanPhone,
      instagram_handle: cleanHandle,
      status,
      payment_status: "unpaid",
      notes: "",
    })
    .returning();

  return res.status(201).json({ registration, waitlisted: status === "waitlist" });
});

export default router;
