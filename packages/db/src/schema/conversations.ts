import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { conversationStatusEnum, messageRoleEnum } from "./enums";
import { knowledgeBases } from "./knowledge";
import { organizations } from "./organizations";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    knowledgeBaseId: uuid("knowledge_base_id").references(() => knowledgeBases.id, {
      onDelete: "set null",
    }),
    // 终端访客标识（cookie 中的匿名 ID，不一定是注册用户）
    visitorId: text("visitor_id").notNull(),
    visitorEmail: text("visitor_email"),
    visitorName: text("visitor_name"),
    // 接管对话的客服（可空，AI 处理时为 null）
    assignedAgentId: uuid("assigned_agent_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: conversationStatusEnum("status").notNull().default("ai_handling"),
    title: text("title"), // 由 AI 自动生成的对话标题
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [
    index("conversations_org_id_idx").on(t.organizationId),
    index("conversations_visitor_id_idx").on(t.visitorId),
    index("conversations_status_idx").on(t.status),
    index("conversations_assigned_agent_idx").on(t.assignedAgentId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    // 引用的 chunks（仅 assistant 消息）
    citations: jsonb("citations").$type<{ chunkId: string; documentId: string; score: number }[]>(),
    // 发送者（agent 消息时填充客服 ID）
    senderId: uuid("sender_id").references(() => users.id, {
      onDelete: "set null",
    }),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    model: text("model"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("messages_conversation_id_idx").on(t.conversationId),
    index("messages_org_id_idx").on(t.organizationId),
    index("messages_created_at_idx").on(t.createdAt),
  ],
);
