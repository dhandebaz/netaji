import { pgTable, serial, text, integer, boolean, timestamp, jsonb, real, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const politicians = pgTable('politicians', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  party: text('party').notNull(),
  partyLogo: text('party_logo'),
  state: text('state').notNull(),
  constituency: text('constituency').notNull(),
  photoUrl: text('photo_url'),
  designation: text('designation'),
  mynetaId: text('myneta_id'),
  electionSlug: text('election_slug'),
  age: integer('age'),
  approvalRating: real('approval_rating').default(50),
  totalAssets: real('total_assets').default(0),
  criminalCases: integer('criminal_cases').default(0),
  education: text('education'),
  attendance: real('attendance').default(0),
  verified: boolean('verified').default(false),
  status: text('status').default('active'),
  votesUp: integer('votes_up').default(0),
  votesDown: integer('votes_down').default(0),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id'),
  politicianId: integer('politician_id').references(() => politicians.id),
  voteType: text('vote_type').notNull(),
  voterId: text('voter_id'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  politicianId: integer('politician_id').references(() => politicians.id),
  userId: text('user_id'),
  userName: text('user_name'),
  tenantId: text('tenant_id'),
  category: text('category').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  evidenceUrl: text('evidence_url'),
  upvotes: integer('upvotes').default(0),
  status: text('status').default('pending'),
  proofOfWork: text('proof_of_work'),
  filedAt: timestamp('filed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const volunteers = pgTable('volunteers', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id'),
  name: text('name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  state: text('state'),
  rtisFiled: integer('rtis_filed').default(0),
  points: integer('points').default(0),
  claimsResolved: integer('claims_resolved').default(0),
  rank: integer('rank'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rtiTasks = pgTable('rti_tasks', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id'),
  politicianId: integer('politician_id').references(() => politicians.id),
  politicianName: text('politician_name'),
  topic: text('topic').notNull(),
  status: text('status').default('generated'),
  priority: text('priority').default('medium'),
  generatedDate: timestamp('generated_date').defaultNow(),
  claimedBy: text('claimed_by'),
  filedDate: timestamp('filed_date'),
  responseDate: timestamp('response_date'),
  proofOfFilingUrl: text('proof_of_filing_url'),
  governmentResponseUrl: text('government_response_url'),
  pioDetails: jsonb('pio_details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  playUrl: text('play_url'),
  plays: integer('plays').default(0),
  rating: real('rating').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('voter'),
  avatar: text('avatar'),
  plan: text('plan'),
  apiKey: text('api_key'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  userName: text('user_name'),
  action: text('action').notNull(),
  resource: text('resource'),
  resourceId: text('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const politiciansRelations = relations(politicians, ({ many }) => ({
  votes: many(votes),
  complaints: many(complaints),
  rtiTasks: many(rtiTasks),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  politician: one(politicians, {
    fields: [votes.politicianId],
    references: [politicians.id],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  politician: one(politicians, {
    fields: [complaints.politicianId],
    references: [politicians.id],
  }),
}));

export const rtiTasksRelations = relations(rtiTasks, ({ one }) => ({
  politician: one(politicians, {
    fields: [rtiTasks.politicianId],
    references: [politicians.id],
  }),
}));

export type Politician = typeof politicians.$inferSelect;
export type InsertPolitician = typeof politicians.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = typeof complaints.$inferInsert;
export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = typeof volunteers.$inferInsert;
export type RTITask = typeof rtiTasks.$inferSelect;
export type InsertRTITask = typeof rtiTasks.$inferInsert;
export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
