import { Router } from "express";
import { db } from "@workspace/db";
import { registrationsTable, eventSettingsTable } from "@workspace/db";
import { eq, inArray, and, count } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

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
  const [femaleWaitlistRow] = await db
    .select({ c: count() })
    .from(registrationsTable)
    .where(and(eq(registrationsTable.gender, "female"), eq(registrationsTable.status, "waitlist")));
  const [maleWaitlistRow] = await db
    .select({ c: count() })
    .from(registrationsTable)
    .where(and(eq(registrationsTable.gender, "male"), eq(registrationsTable.status, "waitlist")));
  const [checkedInRow] = await db
    .select({ c: count() })
    .from(registrationsTable)
    .where(eq(registrationsTable.checked_in, true));
  const [paidRow] = await db
    .select({ c: count() })
    .from(registrationsTable)
    .where(eq(registrationsTable.payment_status, "paid"));

  const femaleCount = Number(femaleRow?.c ?? 0);
  const maleCount = Number(maleRow?.c ?? 0);
  const totalCount = femaleCount + maleCount;

  return res.json({
    femaleCount,
    maleCount,
    totalCount,
    maxFemale: caps.max_female,
    maxMale: caps.max_male,
    maxTotal: caps.max_total,
    femaleSpotsLeft: Math.max(0, caps.max_female - femaleCount),
    maleSpotsLeft: Math.max(0, caps.max_male - maleCount),
    totalSpotsLeft: Math.max(0, caps.max_total - totalCount),
    femaleFull: femaleCount >= caps.max_female,
    maleFull: maleCount >= caps.max_male,
    isFull: totalCount >= caps.max_total,
    femaleWaitlistCount: Number(femaleWaitlistRow?.c ?? 0),
    maleWaitlistCount: Number(maleWaitlistRow?.c ?? 0),
    checkedInCount: Number(checkedInRow?.c ?? 0),
    paidCount: Number(paidRow?.c ?? 0),
  });
});

export default router;
