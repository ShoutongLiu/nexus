-- 启用 pgvector 扩展（用于存储 embedding）
CREATE EXTENSION IF NOT EXISTS vector;

-- 启用 UUID 扩展（用于主键）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用 pg_trgm（用于文本模糊搜索，后期会用到）
CREATE EXTENSION IF NOT EXISTS pg_trgm;