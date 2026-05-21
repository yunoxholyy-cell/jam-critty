import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const registrationsTable = pgTable(
  "registrations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    full_name: text("full_name").notNull(),
    gender: text("gender").notNull(),
    phone: text("phone").notNull(),
    instagram_handle: text("instagram_handle").notNull(),
    status: text("status").notNull().default("approved"),
    payment_status: text("payment_status").notNull().default("unpaid"),
    payment_method: text("payment_method"),
    notes: text("notes").notNull().default(""),
    ticket_token: text("ticket_token")
      .notNull()
      .unique()
      .$defaultFn(() => genTicketToken()),
    checked_in: boolean("checked_in").notNull().default(false),
    checked_in_at: timestamp("checked_in_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("gender_check", sql`${table.gender} IN ('female', 'male')`),
    check(
      "status_check",
      sql`${table.status} IN ('pending', 'approved', 'rejected', 'waitlist')`,
    ),
    check(
      "payment_status_check",
      sql`${table.payment_status} IN ('unpaid', 'pending', 'paid')`,
    ),
    check(
      "payment_method_check",
      sql`${table.payment_method} IS NULL OR ${table.payment_method} IN ('cash', 'ecocash')`,
    ),
  ],
);

function genTicketToken(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/[^A-Z0-9]/gi, "X")
    .substring(0, 8)
    .toUpperCase();
}

export const insertRegistrationSchema = createInsertSchema(registrationsTable)
  .omit({ id: true, ticket_token: true, checked_in: true, checked_in_at: true, created_at: true });

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;

export const eventSettingsTable = pgTable("event_settings", {
  id: integer("id").primaryKey().default(1),
  max_total: integer("max_total").notNull().default(50),
  max_female: integer("max_female").notNull().default(34),
  max_male: integer("max_male").notNull().default(16),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EventSettings = typeof eventSettingsTable.$inferSelect;
