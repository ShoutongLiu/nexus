import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { documentStatusEnum } from "./enums";
import { organizations } from "./organizations";

export const knowledgeBases = pgTable(
  "knowledge_bases",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("knowledge_bases_org_id_idx").on(t.organizationId)],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    knowledgeBaseId: uuid("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sourceType: text("source_type").notNull(), // "upload" | "url" | "text"
    sourceUrl: text("source_url"),
    storageKey: text("storage_key"), // S3/MinIO 中的 key
    fileSize: integer("file_size"), // bytes
    mimeType: text("mime_type"),
    status: documentStatusEnum("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("documents_kb_id_idx").on(t.knowledgeBaseId),
    index("documents_org_id_idx").on(t.organizationId),
    index("documents_status_idx").on(t.status),
  ],
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    // text-embedding-3-small 的维度是 1536
    embedding: vector("embedding", { dimensions: 1536 }),
    tokenCount: integer("token_count"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("document_chunks_doc_id_idx").on(t.documentId),
    index("document_chunks_org_id_idx").on(t.organizationId),
    // pgvector HNSW 索引，用于快速相似度搜索
    index("document_chunks_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);
