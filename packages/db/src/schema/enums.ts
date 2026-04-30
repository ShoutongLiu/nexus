import { pgEnum } from "drizzle-orm/pg-core";

export const membershipRoleEnum = pgEnum("membership_role", ["owner", "admin", "agent", "viewer"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free", "pro", "enterprise"]);

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "ai_handling",
  "pending_takeover",
  "agent_handling",
  "resolved",
]);

export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "agent", "system"]);
