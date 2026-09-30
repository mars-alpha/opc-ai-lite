# Skill Governance Baseline v1

Status: **APPROVED_BASELINE**

本规范定义 OPC 后续所有 Skill 的职责边界、开发前判断、版本化和 Workflow 联动规则。

## 1. 核心原则

### 1.1 单一职责、单一主要输出

一个 Skill 只解决一个可独立验收的问题，并只有一个主要输出职责。

如果两个输出可以分别验收、分别优化、分别失败，默认拆成两个 Skill。

例如：

- 文章整理：只负责把已提供文章整理成稳定、易懂的内容；
- 当前文章配图：只负责基于当前文章产生配图内容/配图方案；
- 文章转 PPT：只负责把当前文章转换成 PPT 内容/成品；
- 热度语义判断：只负责输出热度/推荐价值判断。

禁止把“整理文章 + 配图 + PPT + 发布”合并成一个 Multi-purpose Skill。

## 2. Architecture-neutral / Content-only

Skill 属于 Content / Intelligence Layer。

Skill 可以消费系统已经定义好的 Contract，但不能重新定义项目架构。

Skill 不得自行：

- 新增或修改 DB Schema / Migration；
- 修改 API Contract；
- 修改 Runtime；
- 修改路由或模块边界；
- 修改 Workflow 顺序；
- 修改 Auth / Access / Membership；
- 修改 Publish / Unpublish；
- 修改 Progress / Completion；
- 直接写入 Production Data。

如果 Skill 发现现有 Contract 无法表达所需结果，只能返回 Proposal / Unsupported 状态，由独立工程任务评估。

固定原则：

```text
Architecture defines the box.
Skill fills the box.

Skill may consume contracts.
Skill may not redefine contracts.
```

## 3. Code / Skill / Workflow / Core

固定职责：

```text
Code = Truth
Skill = Intelligence
Workflow = Controlled Bridge
Core System = Authority
```

### Code First

以下优先普通代码：

- 抓取与数据读取；
- 去重；
- 格式转换；
- 数值阈值；
- 排序 / 过滤；
- 状态机；
- 权限；
- Schema / Validation；
- 发布与正式写入。

### Skill

只有需要语义能力时使用 Skill：

- 理解；
- 总结；
- 生成；
- 语义分类；
- 语义判断；
- 内容重写；
- 内容策划。

例如“抓文章播放量/点赞量”属于 Code；“结合内容与指标判断这篇内容是否值得推荐”才可能属于 Skill。

## 4. Skill 不直接调用 Skill

默认禁止 Skill A 自主调用 Skill B。

多个 Skill 的联动由 Workflow 明确编排：

```text
Controlled Input
→ Skill A
→ Schema / Code Validation
→ Workflow
→ Skill B
→ Schema / Code Validation
→ Human Review / Rules
→ Core Action
```

这样每一步都可以：

- 单独重跑；
- 单独替换；
- 单独测试；
- 单独升级；
- 单独失败而不破坏其他步骤。

## 5. 开发前 Skill Decision Gate

任何新开发任务开始实现前，必须先归类：

### A — CODE_ONLY

普通代码可以确定性完成。

直接开发 Code，不创建 Skill。

### B — EXISTING_SKILL

已有 Skill 的职责与输入输出完全覆盖当前需求。

复用已有版本；若真实输出暴露不足，再单独提出版本升级任务。

### C — NEW_SKILL_NEEDED

确实需要新的独立语义能力，且现有 Skill 不覆盖。

此时不得直接进入完整业务开发，必须先形成 **Mini Skill Proposal** 并与产品负责人确认。

## 6. Mini Skill Proposal

创建新 Skill 前必须明确：

```text
Skill ID:
Proposed Version: v0.1
Single Responsibility:
Primary Output:
Input Schema:
Output Schema:
Forbidden Actions:
Acceptance Criteria:
Failure Strategy:
Human Review Requirement:
Called By Workflow:
Why Code Is Not Enough:
Why Existing Skill Cannot Be Reused:
```

未明确以上内容，不进入 Skill 实现。

## 7. Skill Contract

每个 Skill 至少需要明确：

1. **Responsibility** — 只负责什么；
2. **Input** — 系统允许给它什么；
3. **Output** — 唯一主要输出和结构；
4. **Forbidden Actions** — 明确不能做什么；
5. **Acceptance Criteria** — 怎样算输出合格；
6. **Failure Strategy** — 失败、超时、资料不足怎么办；
7. **Human Review** — 是否必须人工审核；
8. **Workflow Caller** — 由哪个 Workflow 调用。

输入输出优先 Schema First。

禁止依赖“上一个 Skill 应该记得什么”的隐式状态；需要的信息必须由 Workflow 显式传入。

## 8. Failure Contract

Skill 不得为了让流程继续而编造缺失事实。

推荐状态语义：

- `SUCCESS`：结构与最低质量要求通过；
- `INCOMPLETE`：输入不足，无法完整输出；
- `NEEDS_REVIEW`：可以给候选，但需要人工判断；
- `UNSUPPORTED`：当前 Skill Contract 不支持。

具体 Skill 可以使用自己的受控枚举，但必须在 Contract 中固定。

Skill failure 不得破坏 Core Runtime。

## 9. Versioning & Provenance

Skill 必须版本化落盘：

```text
v0.1
→ 真实样本
→ Human Review / Acceptance
→ 找到明确不足
→ v0.2
```

规则：

- 不静默覆盖旧版本；
- 一个 Skill 的不足只优化这个 Skill；
- 不因一个 Skill 升级而强制重写其他 Skill；
- 历史输出应能够追溯生成它的 Skill ID / Version；
- Skill Version 与内容 Draft Version 分开；
- 新版本是否成为默认版本必须有明确任务记录。

## 10. Human Review & Authority

自动化程度可以提高，但 Authority 不随自动化转移。

未来可以：

```text
多个 Skill 自动完成候选内容
→ Code Validation
→ 后台集中审核
→ Core Publish
```

以下始终属于 Core Authority：

- 正式发布状态变化；
- 正式课程更新；
- 正式 Knowledge 写入；
- 权限；
- Progress；
- Completion；
- 删除正式内容；
- Production state transition。

是否需要 Human Gate 不由 Skill 自己决定，统一按 `docs/DEVELOPMENT_OPERATING_MANUAL.md` 的 Human Review / Publish 规则判断；不增加没有新信息的重复“审核 + 发布”人工步骤。

## 11. Independent Optimization Rule

Skill 的设计目标是“可控地持续优化”，不是“一次做成万能能力”。

如果文章整理质量不足：
→ 只升级 article-summary Skill。

如果配图质量不足：
→ 只升级 article-image Skill。

如果 PPT 转换质量不足：
→ 只升级 article-to-ppt Skill。

不得为了修复一个输出，把无关职责继续塞入同一个 Skill。

## 12. 个人工作台 Skill 边界

个人工作台 MVP 默认消费 **官方已发布能力**，用户界面不暴露内部 Skill Registry，也不要求普通用户理解 Skill ID / Version。

用户私有“配置型 Skill”属于后续高级能力，不是 Workbench Foundation 前置条件。未来开放时固定：
- 只允许配置型能力描述，不执行用户上传的任意 Python / JavaScript / TypeScript / Shell、二进制、npm package 或其他可执行代码；
- 使用用户自己的 BYOK；
- 私有配置不自动进入 OPC AI 官方 Registry；
- 用户主动提交候选也必须经过独立官方治理后才能成为官方 Skill。

OPC AI 项目内部可执行 Skill 继续遵循 Proposal / Contract / Registry / Acceptance。

## 13. Registry Rule

所有已经实际落盘并可被项目引用的 Skill 都必须登记到：

`skills/REGISTRY.md`

Registry 只记录真实存在的 Skill / Version。

未来设想或示例不得登记为 ACTIVE。
