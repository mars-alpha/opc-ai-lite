# DATA.md — Data / Evidence / Audit Boundary

Status: **CURRENT**

本文件只定义数据事实源、审计和 Content Workbench 的数据边界。具体表结构以 Drizzle Schema / Migration 为准。

## 1. Source of Truth

```text
PostgreSQL
→ business state / relation / version / audit

External Source Snapshot
→ factual evidence

COS
→ large raw/media objects

Feishu
→ deep editing workspace
```

飞书不是正式业务状态源。

## 2. Learning Data

当前正式 Learning 数据包括：
- Progress；
- Check Response；
- Practice / Submission / Evaluation；
- Feedback；
- Event / Insight；
- Access / Entitlement 相关状态。

结果事件必须由服务端业务逻辑产生，前端不能伪造 passed / completed / published。

## 3. OPC AI 官方内容数据

OPC AI 官方内容 Core 当前已建立：

```text
Source
SourceSnapshot / Evidence
Candidate
Review
DailyItem / Article
KnowledgeItem
PublishRecord
AuditRecord
```

当前 Schema 对应：
- `content_sources`
- `content_evidence`
- `content_item_evidence`
- `content_items.version`
- `content_reviews`
- `content_publish_records`
- `content_audit_records`
- `knowledge_items.version`
- `feishu_document_mappings`
- `ai_runs`

官方内容基础迁移起于 `drizzle/0014_chunky_ricochet.sql`；current Development 数据库为 TencentDB `opc_ai_dev`，Supabase 仅为 LEGACY TEST ONLY。最新 migration 状态由 `docs/CURRENT_SYSTEM_FACTS.md` 记录。

要求：
- 每条正式内容可追溯 Evidence；
- 状态迁移可审计；
- 编辑版本可追溯；
- 发布与草稿分离；
- 不用 Prompt 字符串代替正式数据关系。
- Candidate 旧 `sourceType/sourceRef/sourceUrl` 字段仅保留兼容；新 Workbench 的正式 provenance 以 `Content → Evidence → Source` 关系为准。
- Knowledge 只能从已发布 Content 派生；Supporting Content 也必须已发布并具有 VERIFIED Evidence。

## 4. Feishu / Connector Boundary

个人 AI 工作台固定采用 Connector + 用户 OAuth：
- 用户选择自己的目标；
- 工作台只把用户明确勾选的数据单向写入；
- 第一版不做飞书返回编辑或实时双向同步；
- 飞书不是平台正式业务状态源。

OPC AI 官方平台如果未来需要飞书深度编辑或回写，必须作为独立管理员 Workflow 重新定义 Contract / Conflict / Audit，不得把旧 Sync Back 方案当作通用工作台事实。

## 5. AI Run

未来 AI 调用必须单独记录 provenance：

```text
run_id
task_type
model_provider
model
skill_version
prompt_version
rule_pack_versions
context_ids
evidence_ids
input_hash
raw_output
validator_result
human_review_result
created_at
```

AI Run 是审计记录，不是正式 Published Content。

## 6. Evidence

Evidence 必须保留：
- original URL / provider；
- published_at（可得时）；
- collected_at；
- content hash；
- snapshot key；
- source tier / type；
- verification status。

事实不只因为“知识库里写过”就视为最新真相。

## 7. Object Storage

COS 未来存：
- Raw HTML；
- 网页/来源 Snapshot；
- PDF；
- 图片；
- 音频；
- 视频；
- OPC AI 官方生成媒体资产；
- 或未来用户明确选择上传的云端资产。

PostgreSQL 只保存 object key / metadata / relation。

## 8. Context / Knowledge

Approved Knowledge 是审核知识，不等于永远最新的 Evidence。

AI Context Assembly 必须区分：
- current evidence；
- approved knowledge；
- unknown。

详见 `docs/CONTEXT_GOVERNANCE.md`。

## 9. Minimal Infrastructure

第一阶段继续标准 PostgreSQL + 现有服务器。

当前数据库部署：
- Development：TencentDB `opc_ai_dev`，本地经 SSH tunnel；
- Production：轻量服务器本机 PostgreSQL `opc_ai_prod`，仅 loopback；
- Dev / Prod 数据库与账号隔离；
- Production 每日自动备份，保留 7 天；
- Drizzle migration 保持 provider-neutral PostgreSQL，未来可按负载迁回托管 PostgreSQL。

暂不增加：
- 独立 Vector DB；
- Redis；
- Kafka；
- Data Warehouse。

只有真实吞吐/检索需求出现后再增加。

## 10. Analytics Principle

只采集当前产品决策需要的数据。

禁止因为“未来可能分析”提前构建复杂数据平台。
