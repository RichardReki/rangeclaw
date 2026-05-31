# CLAUDE.md

> 本文件是项目总纲，供 Claude Code 每个会话开始时读取。
> 目标：在 **The Turing Test Hackathon 2026 — Phase 2: AI Awakening** 中完成一个可获奖的参赛作品。
> **所有赛事/工具链事实以 [docs/toolchain-notes.md](docs/toolchain-notes.md) 为准（已逐条联网核实并标注来源）。本文件与该笔记冲突时，以笔记为准；不要凭记忆重新推断这些事实。**

---

## 0. 一句话定位

**AI LP 做市管家**：一个用自然语言驱动的 AI agent，自动管理用户在 **Byreal（Solana）** 上的 **CLMM 集中流动性仓位**——持续监控价格区间、由 AI 决策何时调仓/收费/扩缩区间并执行，并把**每一次自主决策上链记录到 Mantle**，做成可公开验证的"AI 做市行为账本"。

- **赛道**：Track 06「Agentic Economy」（Byreal 赞助）。官方点名工具 = **Byreal Skills CLI（`@byreal-io/byreal-cli`）**。
- **现实目标用户**：手里有 LP 仓位、但没精力盯盘调仓的 DeFi 用户；以及想"托管式"赚做市手续费的普通人。
- **差异化卖点**：Byreal CLI 深度集成 + AI 调仓策略 + 决策链上可验证（契合赛事 Human-vs-AI 可验证公平主题）。

---

## 1. 现实主义目标（必须诚实对待）

| 目标 | 说明 |
| --- | --- |
| **主目标** | 拿下 Track 06 赛道一等奖 **$8,500**（这是现实可冲的最高确定性奖项） |
| **次目标** | 进入 Top 20 决赛 → 解锁 "Finalist & Deployment" **$1,000**（评审筛选+部署双门槛，**不是保底**，当 upside 看） |
| **冲刺** | Grand Champion $9,000 / Best UI/UX $3,000 / 社区投票 2×$8,500（均为 upside） |

> ⚠️ **原计划里"部署即得 20×$1,000 保底"是错的**。官方原文是 "Top 20 Finalists deployed on Mantle"——必须被评审选入 Top 20 **且**已部署。**不要把它当资金底线计入期望值。**

---

## 2. 系统架构（关键：bridge-not-call，绝不能搞错）

> **核心约束**：Byreal 跑在 **Solana**，Mantle 上**没有任何 Byreal 合约**。Mantle 与 Byreal 之间只有一座资产桥（Mantle Super Portal）。
> 因此 **Mantle 的 EVM 合约无法链上调用 Byreal**。集成 Byreal = **链下 agent 层**；Mantle 合约 = **独立的存证/身份组件**。两者由 agent 逻辑串联，**不是链上互相调用**。

```
┌─────────────────────────────────────────────────────────────┐
│  用户（自然语言 / Web 看板）                                  │
└───────────────┬─────────────────────────────────────────────┘
                │ 表达意图 / 确认执行
                ▼
┌─────────────────────────────────────────────────────────────┐
│  AI LP 做市管家 Agent  (OpenClaw 运行时 + Byreal Skills)      │
│  ① 监控 CLMM 仓位与价格区间   ② AI 决策是否调仓/收费/扩缩      │
│  ③ 通过 byreal-cli 执行       ④ 把决策写入 Mantle 合约存证     │
└──────┬───────────────────────────────────┬──────────────────┘
       │ byreal-cli（链下调用，Solana）     │ viem/ethers（链下调用，EVM）
       ▼                                    ▼
┌──────────────────────┐    ✗ 不链上    ┌──────────────────────────────┐
│  Byreal CLMM DEX      │ ◀──互相调用──▶ │  Mantle Sepolia (chainId 5003)│
│  (Solana)             │                │  LPAgentRegistry 合约          │
│  开/平/调仓/收费/swap  │                │  追加式记录每次调仓决策(可验证) │
└──────────────────────┘                └──────────────────────────────┘
       ▲                                              ▲
       └────── 资产桥 Mantle Super Portal（仅搬资产，非执行）──────┘
```

**模块划分：**
- `agent/`：OpenClaw + Byreal Skills 的策略 agent。监控 → AI 决策 → 执行 → 调用合约存证。
- `contracts/`：Mantle Sepolia 上的 `LPAgentRegistry`（agent 身份 + 调仓决策的追加式链上日志）。
- `web/`：React 看板，展示在管仓位、区间 vs 现价、累计手续费、以及**链上决策日志（可验证）**。
- `docs/`：`toolchain-notes.md`（事实源）+ `architecture.md`。

---

## 3. 技术约束（入场券 + 评分相关，全部已核实）

- **提交必交物**（在 X 发带 `#MantleAIHackathon` 的 Thread）：`pitch` + `demo video` + `GitHub link` + **一个已部署的 Mantle 合约地址**。另需在 **DoraHacks 或 HackQuest** 报名。
- **Mantle 合约**：部署到 **Mantle Sepolia（chainId 5003）** 即可满足"合约地址"字段。**官方不要求源码 verify**（别在 Routescan/Blockscout 验证上耗时，除非自愿）。
- **Byreal 集成**：Track 06 点名 `@byreal-io/byreal-cli`（`npx skills add byreal-git/byreal-agent-skills`）。**这是差异化核心，要做深。**
- **demo**：rubric 接受 **"live demo OR meaningful simulation"**——公开 live demo **非强制**，必交的是 **demo 视频**。但能跑的 live demo 会在评分中加分。
- **开源**：提交要 GitHub link，**未强制公开/开源**（可私有）。建议公开以加"透明性"分。
- **截止**：**2026-06-15，15:59（UTC）**——是硬时间点，**不是当日 23:59**。至少提前一天提交。

---

## 4. 技术栈

- 合约：Solidity + **Foundry**（部署到 Mantle Sepolia）。合约保持**薄而有意义**，不要过度工程化。
- Agent / 后端：TypeScript（Byreal CLI 是 npm 包，TS 生态最顺）。OpenClaw 运行时。
- 前端：React + TypeScript + viem（读 Mantle 合约日志）。
- 基座工具：`openclaw` + `@byreal-io/byreal-cli`。

---

## 5. 评分维度（开发时对照，全部来自官方 rubric）

**通用 50 分**：Technical 15 / Ecosystem fit（Mantle 集成）10 / Business potential 10 / Innovation 10 / UX（含 AA / gasless）5
**赛道专属 50 分**：透明性与可验证性 / 策略合理性 / 现实影响 / demo 质量

> **优化原则**：每写一个功能，问自己——"这提升了 ① Byreal 集成深度 ② AI 调仓策略的可信度 ③ 决策的链上可验证性 ④ 对真实 LP 用户的说服力 中的哪一项？" 不沾边的就砍。

---

## 6. 分阶段任务清单（逐步执行，做完更新勾选）

### 阶段 0：环境与摸底
- [ ] 阅读 [docs/toolchain-notes.md](docs/toolchain-notes.md)，吃透三件事：Byreal=Solana、Mantle 合约是独立存证件、20×$1k 非保底
- [ ] 安装 OpenClaw：`npm install -g openclaw@latest` → `openclaw onboard --install-daemon`
- [ ] 装 Byreal 技能：`npx skills add byreal-git/byreal-agent-skills`；跑 `byreal-cli skill` / `byreal-cli catalog list` 摸清 CLMM 相关命令（`pools` / `positions` / `swap`）
- [ ] **确认 Byreal 是否有 Solana 测试网/devnet 可用**；若只有主网真实资金，则 demo 走 `--dry-run`/模拟模式（rubric 接受 simulation）——把这个决定记到 `docs/architecture.md`
- [ ] 配置 Mantle Sepolia（chainId 5003）RPC，跑通钱包连接（测试网）

### 阶段 1：方案设计
- [x] 产出 `docs/architecture.md`：把第 2 节架构图细化，明确画出 bridge-not-call 边界
- [x] 定义 AI 调仓策略：触发条件（价格出区间 / IL 阈值 / 手续费累积 / 波动率）、决策输入（pool APR/TVL/K线）、动作（decrease→swap 调比例→open 新区间→claim）
- [x] 定义 `LPAgentRegistry` 接口：`registerAgent` / `recordDecision(action, poolId, decisionHash, priceLower, priceUpper, feesClaimed)` + `boundHash` 防重放 + 全局/分页只读视图供看板/排行

### 阶段 2：Mantle 合约
- [x] 编写 `LPAgentRegistry.sol`（追加式决策日志 + agent 身份 + boundHash 绑定）— 已过对抗式审查并按裁决硬化
- [x] Foundry 单元 + 模糊测试（34 个用例；**注：本机未装 Foundry，未本地运行，靠审查 + 人工核对验证**）
- [x] 写好部署脚本（**部署签名/广播由我本人执行，见第 7 节**）
- [x] 本地跑通 `forge test`：**34 passed / 0 failed**（Foundry 1.5.1，solc 0.8.24）

### 阶段 3：Agent / 后端（骨架已建并过对抗式审查；TS↔Solidity 哈希一致性零发现）
- [x] 监控模块：`ByrealClient` 抽象 + `MockByrealClient`(离线) + `CliByrealClient`(真实 `-o json`) — **真实字段映射待按 `byreal-cli catalog show` 校正**
- [x] AI 决策模块：确定性规则引擎（可审计）+ `AnthropicReasoner`/`MockReasoner` 叙述；决策→`decisionHash`/`boundHash`→上链
- [x] 执行链路：`buildExecutionPlan` 只产 `--dry-run` 计划；真实 `--confirm` 由我本人执行
- [x] 决策上链：`Attestor` 调 `LPAgentRegistry.recordDecision`（`prepare`/`simulate`/`send` 三档；`send` 默认禁用）
- [x] 安全：广播双重门控 `ENABLE_ONCHAIN_WRITE`+`AGENT_PRIVATE_KEY`；CLI 只读；密钥不入日志
- [x] 本地跑通：`npm test` **21 passed** + `npm run typecheck` 绿 + `npm run demo` 端到端 OK
- [ ] 接真实环境：校正 byreal-cli 字段/旗标、回填 `REGISTRY_ADDRESS`、用 `mode:"simulate"` 联通测试网

### 阶段 4：前端看板（骨架已建并过对抗式审查；核验逻辑与 agent/合约零发现一致）
- [x] React 看板（Vite + viem，深色主题）：决策流表格含动作/池/区间/手续费/哈希；LIVE 读 `getDecisions()`，DEMO 自动回退
- [x] **链上决策日志 + 当场核验**：每行 `boundHash` 自洽自动校验；弹窗贴 canonical JSON 重算 `decisionHash` 比对——赛道专属分核心展示
- [x] DEMO 模式（真实算出哈希的 mock）：无部署也能完整演示并通过核验
- [ ] 增强（可选）：在管仓位/区间 vs 现价图表、"让 AI 建议一次调仓"交互（兼顾 UI/UX 奖）
- [x] 本地跑通：`npm test` **8 passed** + `typecheck` 绿 + `vite build` 产出 `dist/`
- [ ] 部署到 Vercel（公开可访问，非 localhost；`npm run build` 后由我本人部署）

### 阶段 5：交付物（提交必备；文案已过"事实核查+夸大猎杀"审查）
- [x] 提交级 README（核心卖点、bridge-not-call 架构图、跑通步骤、合约地址回填位、诚实标注）
- [x] demo 视频脚本 [docs/demo-script.md]（~2:10：冷开场前置高潮 + 篡改→变红→变绿 + 英文字幕）
- [x] pitch + 路演稿 [docs/pitch.md]（一句话/电梯陈述/Proof 段/8 页大纲/rubric 论证映射/评委追问应答）
- [ ] **部署合约 → 回填 README 地址**（最高杠杆：否则核验只能 DEMO 演示；由我本人执行）
- [ ] 录制 demo 视频（按脚本；由我本人）
- [ ] 前端部署 Vercel（`npm run build` 后；由我本人）
- [ ] **浏览器核对 DoraHacks BUIDL 表单逐字要求**（该页无法程序抓取；由我本人）
- [ ] X Thread 提交（pitch + 视频 + GitHub + Mantle 合约地址 + `#MantleAIHackathon`；由我本人）

---

## 7. 必须由我本人操作（Claude Code 不要执行）

- ❌ 不接触、不生成、不写入任何私钥 / 助记词 / 钱包凭证
- ❌ 不执行涉及真实资金的链上交易（Solana 现货、Byreal 仓位、gas 支付）
- ❌ Mantle 合约部署的**签名与广播**由我本人完成（Claude 准备脚本，我来执行）
- ❌ DoraHacks/HackQuest 报名、X Thread 发布、最终 BUIDL 提交，均由我本人完成
- ✅ 测试网部署如需私钥，用 `.env`（加入 `.gitignore`），由我本人填入
- ✅ Byreal CLI 的 `--confirm` 真实下单由我本人审阅后执行；Claude 默认只用 `--dry-run`

---

## 8. 工作方式约定

- 每完成一个任务，更新本文件清单勾选
- 一切 API key / 密钥走环境变量，绝不硬编码、绝不提交仓库
- **事实优先**：涉及赛事规则/工具链/链/奖项的判断，先查 [docs/toolchain-notes.md](docs/toolchain-notes.md)；该文件没有的，去官方源（devhub.mantle.xyz / docs.byreal.io / 对应 GitHub）核实后再写，不要凭记忆编
- **不犯致命错**：任何代码或文案都不得暗示"Byreal 跑在 Mantle 上"或"Mantle 合约调用 Byreal"
- 优先保证阶段 5 交付物齐全——能交、能演示，比代码完美更重要
