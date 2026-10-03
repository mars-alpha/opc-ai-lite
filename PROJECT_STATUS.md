# PROJECT_STATUS.md

> 只记录当前阶段和健康状态。实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`。

## 当前阶段

```text
Production Web                    DEPLOYED / HTTPS ACTIVE
Learning Path                     TRACK01～05 / 81 LESSONS / FROZEN
Unified Lesson Shell              FROZEN / PASS
Course Production Workflow        STABLE
Course Builder                    course-builder@1.0.0
Development Governance Reset      COMPLETE / PASS
Mobile Web                        PLANNED / AFTER CONTENT FOUNDATION
WeChat / Douyin Mini Programs     FUTURE / SHARED BACKEND
Official Account Follow           NOT CONNECTED
Payment                           NOT CONNECTED
Repository Governance             COMPLETE / PASS
CURRENT                           LEARNING INSIGHT V2 / CLOSED LOOP / PASS
```

## 系统健康

```text
Next.js App Router                ACTIVE
PostgreSQL + Drizzle              ACTIVE
Database target                   DEV + PROD LOCAL POSTGRESQL / DEV SSH TUNNEL
Formal Lesson Runtime             PASS
LessonSpec Registry               PASS
Admin Course Registry             5 TRACKS / 81 LESSONS / PASS
Frontend Runtime                  81 / 81 CHECK + PRACTICE READY
Frontend Lesson Routes            81 / 81 / LEGACY ROUTES 0
Course Maintenance Sync           FRONTEND PUBLISH / 81 PRACTICE IDs / PASS
Learning Insight Real Loop        TASK A → TASK B → PUBLISH → FRONTEND / PASS
Learning Insight Course Diagnosis FORMAL 81 / REGISTRY ALIGNED / PASS
Learning Insight Learner E2E      INPUT → GATE1 → PUBLISH/NORMAL / PASS
Learning Insight Issue Cycle      DISMISS / WATCH / PUBLISH → NEW BASELINE / PASS
Learning Insight Cross-page Sync  PATH / SIDEBAR / NAV / LOCKED VIEW / PASS
Admin Overview Fact Sync           USERS / MEMBERSHIP / CONTENT / COURSE HEALTH / PASS
User & Entitlement Test Cleanup    11 TEST USERS REMOVED / REAL USERS PRESERVED / PASS
Content Collection Data Cleanup    DEV + PROD CONTENT_* TEST DATA / CLEAN
Production DB Migration            LOCAL POSTGRESQL / BACKUP TIMER / PASS
Development DB Migration           LOCAL POSTGRESQL / 50 TABLES / 525 ROWS / PARITY PASS
Formal Check DB Migration         0010 APPLIED / DB READY
T1-01 Rebaseline                 VERSION 1 / PUBLISHED / CLEAN
Check / Practice authority        PASS
Completion / Rating / Resume      PASS
Nginx / PM2                       PASS
HTTPS                             PASS
Production domain                 https://opcai.fun
```

## 冻结边界

- PC 当前已确认页面不因后台/AI工作顺手改版。
- Track 01～05 课程目录结构与六步 Runtime 冻结；课程正文只允许通过受控版本更新链修改。
- Course Runtime 不增加第二 renderer / fallback。
- 历史 Batch / Brief / acceptance 不恢复为 current path。

## 已完成治理

1. 收敛课程 current owners。
2. 删除旧静态原型、重复文档、历史一次性脚本。
3. 把历史追溯交给 Git。
4. 固定上下文治理与任务 owner 规则。
5. 建立统一后台的开发顺序和验收标准。

当前产品开发入口：
`LEARNING INSIGHT V2 / CLOSED LOOP / PASS`。课程维护与学习洞察统一读取前台当前已部署的 81 节正式课程；正式处理采用 Issue Cycle 新基线，不再让历史问题永久累计为风险。临时人工验收 / simulation 数据已清场；保留的 acceptance 仅作为可重跑自动验收，不进入正式课程身份源。

## Development Governance 已确认基线

- 三产品边界：OPC AI 前台 / 独立个人 AI 工作台 / 管理后台；
- 个人 AI 工作台已加入 OPC 会员权益定义，但正式产品状态仍为 PLANNED；
- 个人工作台不进入 OPC AI 前台导航；
- Admin Role 与 Membership 分离；正式角色为 `USER / ADMIN`，管理员通过角色获得会员能力但不制造 Membership 记录；
- `docs/DEVELOPMENT_OPERATING_MANUAL.md` 为开发方法与阶段规则唯一 owner；
- 不保留第二份 current roadmap；历史方案只通过 Git history 追溯；
- 后续顺序固定为：治理收口 → Admin IA 重构 → Workbench Product Spec → Workbench Foundation；
- 所有实现任务先完成 Decision Brief，再进入 TDD；
- 运营总览与“用户与权益”已确认；未接通的 AI 能力、系统管理、个人 AI 工作台不暴露为正式页面；其余后台按内容采集 → 课程维护 → 学习洞察顺序逐页收口；
- Visual Human Review Gate 继续由 AGENTS.md 管理。
