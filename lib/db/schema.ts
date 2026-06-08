import {
  pgTable, text, timestamp, uuid, integer, boolean, jsonb,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

// ─── Gebruikers & Rollen ──────────────────────────────────────────────────────

export const gebruikers = pgTable("gebruikers", {
  userId: text("user_id").primaryKey(),
  rol: text("rol").notNull().default("gebruiker"), // superadmin | facilitator | coach | gebruiker
  naam: text("naam"),
  email: text("email"),
  wachtwoord: text("wachtwoord"),
  actief: boolean("actief").notNull().default(true),
  verificatieCode: text("verificatie_code"),
  verificatieVerloptOp: timestamp("verificatie_verlopt_op"),
  emailsAfgemeld: boolean("emails_afgemeld").notNull().default(false),
  // Stripe abonnement
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  abonnementStatus: text("abonnement_status"), // actief | gepauzeerd | geannuleerd
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

// ─── Workshops (Facilitator) ──────────────────────────────────────────────────

export const workshops = pgTable("workshops", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilitatorId: text("facilitator_id").notNull(),
  naam: text("naam").notNull(),
  beschrijving: text("beschrijving"),
  code: text("code").notNull().unique(), // 6-char join code
  status: text("status").notNull().default("actief"), // actief | afgerond | gearchiveerd
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

export const workshopDeelnemers = pgTable("workshop_deelnemers", {
  id: uuid("id").defaultRandom().primaryKey(),
  workshopId: uuid("workshop_id").references(() => workshops.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  uitgenodigd: boolean("uitgenodigd").notNull().default(true),
  toegetreden: boolean("toegetreden").notNull().default(false),
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

// ─── Coaching Relaties ────────────────────────────────────────────────────────

export const coachingRelaties = pgTable("coaching_relaties", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: text("coach_id").notNull(),
  clientUserId: text("client_user_id").notNull(),
  status: text("status").notNull().default("actief"), // actief | gestopt
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

export const coachNotities = pgTable("coach_notities", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: text("coach_id").notNull(),
  clientUserId: text("client_user_id").notNull(),
  sessieId: uuid("sessie_id").references(() => sessies.id, { onDelete: "cascade" }),
  tekst: text("tekst").notNull(),
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

export const sessies = pgTable("sessies", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  thema: text("thema").notNull(),
  themaLabel: text("thema_label").notNull(),
  status: text("status").notNull().default("intake"), // draft | intake | bouwen | reflectie | rapport | voltooid
  stemmingVoor: integer("stemming_voor"),
  stemmingNa: integer("stemming_na"),
  intakeAntwoorden: jsonb("intake_antwoorden"),
  aiSessieContext: text("ai_sessie_context"),
  vorigeSessieId: uuid("vorige_sessie_id").references((): AnyPgColumn => sessies.id),
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
  bijgewerktOp: timestamp("bijgewerkt_op").defaultNow().notNull(),
  voltooidOp: timestamp("voltooid_op"),
});

export const fases = pgTable("fases", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessieId: uuid("sessie_id").references(() => sessies.id, { onDelete: "cascade" }).notNull(),
  faseNummer: integer("fase_nummer").notNull(),
  faseTitel: text("fase_titel").notNull(),
  vraag: text("vraag").notNull(),
  fotoUrl: text("foto_url"),
  fotoBase64: text("foto_base64"),
  zijfotoBase64: text("zijfoto_base64"),
  gebruikersBeschrijving: text("gebruikers_beschrijving"),
  aiReflectie: text("ai_reflectie"),
  aiVervolgvraag: text("ai_vervolgvraag"),
  gebruikersAntwoord: text("gebruikers_antwoord"),
  voltooid: boolean("voltooid").default(false),
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

export const rapporten = pgTable("rapporten", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessieId: uuid("sessie_id").references(() => sessies.id, { onDelete: "cascade" }).notNull().unique(),
  samenvattingTekst: text("samenvatting_tekst"),
  eersteStap: text("eerste_stap"),
  inzichten: jsonb("inzichten"),
  vergelijkingTekst: text("vergelijking_tekst"),
  pdfUrl: text("pdf_url"),
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  kortingPercent: integer("korting_percent").notNull(), // 100 = gratis, 20 = 20% korting
  beschrijving: text("beschrijving"),
  maxGebruik: integer("max_gebruik"), // null = onbeperkt
  gebruikTeller: integer("gebruik_teller").notNull().default(0),
  actief: boolean("actief").notNull().default(true),
  verloptOp: timestamp("verloopt_op"), // null = nooit
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;

// ─── Blog ─────────────────────────────────────────────────────────────────────

export type InterneLink = {
  ankerTekst: string;
  href: string;
  context: string;
};

export const artikelen = pgTable("artikelen", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  titel: text("titel").notNull(),
  inhoud: text("inhoud").notNull(),
  excerpt: text("excerpt"),
  metaTitel: text("meta_titel"),
  metaBeschrijving: text("meta_beschrijving"),
  trefwoorden: jsonb("trefwoorden").$type<string[]>(),
  ogAfbeelding: text("og_afbeelding"),
  kaartTitel: text("kaart_titel"),
  categorie: text("categorie"),
  tags: jsonb("tags").$type<string[]>(),
  interneLinks: jsonb("interne_links").$type<InterneLink[]>(),
  schemaMarkup: jsonb("schema_markup"),
  leestijd: integer("leestijd"),
  seoScore: integer("seo_score"),
  weergaven: integer("weergaven").notNull().default(156),
  gepubliceerd: boolean("gepubliceerd").notNull().default(false),
  gepubliceerdOp: timestamp("gepubliceerd_op"),
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
  bijgewerktOp: timestamp("bijgewerkt_op").defaultNow().notNull(),
});

export type Artikel = typeof artikelen.$inferSelect;

// ─── Follow-up e-mails ───────────────────────────────────────────────────────

export const followupEmails = pgTable("followup_emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessieId: uuid("sessie_id").references(() => sessies.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'dag3' | 'dag21'
  geplandVoor: timestamp("gepland_voor").notNull(),
  verstuurdOp: timestamp("verstuurd_op"),
  aangemaktOp: timestamp("aangemakt_op").defaultNow().notNull(),
});

export type FollowupEmail = typeof followupEmails.$inferSelect;

export type Sessie = typeof sessies.$inferSelect;
export type NieuweSessie = typeof sessies.$inferInsert;
export type Fase = typeof fases.$inferSelect;
export type NieuweFase = typeof fases.$inferInsert;
export type Rapport = typeof rapporten.$inferSelect;
export type Gebruiker = typeof gebruikers.$inferSelect;
export type Workshop = typeof workshops.$inferSelect;
export type WorkshopDeelnemer = typeof workshopDeelnemers.$inferSelect;
export type CoachingRelatie = typeof coachingRelaties.$inferSelect;
export type CoachNotitie = typeof coachNotities.$inferSelect;
