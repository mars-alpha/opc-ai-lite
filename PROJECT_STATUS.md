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
CURRENT                           LEARNING INSIGHT WORKBENCH V2.1 / PHASE1 USER_APPROVED / PASS
```

## 系统健康

```text
Next.js App Router                ACTIVE
PostgreSQL + Drizzle              ACTIVE
Database target                   TENCENTDB POSTGRESQL / DEV TUNNEL ACTIVE
Formal Lesson Runtime             PASS
LessonSpec Registry               PASS
Admin Course Registry             5 TRACKS / 81 LESSONS / PASS
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
`LEARNING INSIGHT WORKBENCH V2.1 / PHASE1 USER_APPROVED / PASS`。81 节正式课程 Identity、统一 AdminCourseSnapshot、课程级 Evidence Detail 与 Course Maintenance Bridge 已具备；Phase 1 已实现学习洞察课程队列、课程详情、01 静态问题聚合、02 课程级真实数据、first/last / oldest-open 时间事实与课程级 Human Gate 1，并通过 V2.1 Validator、Typecheck、Build 与 Development DB acceptance。Phase 1 界面已经产品负责人明确确认；全项目静态回归、核心 Development DB acceptances、Production Build 与模拟数据清场均已通过。下一阶段进入 AI Task A；Human Gate 2 / Task B / Human Gate 3 仍按 Contract 顺序逐阶段开放。

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
