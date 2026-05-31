# 工具链与赛事事实核查笔记

> 本文档全部事实均通过 Web 联网调研核实（与具体日期无关，结论以官方来源为准）。所有引用的来源 URL 均内联标注。

---

## 赛事关键事实

| 项目 | 事实 | 来源 |
| --- | --- | --- |
| 赛事名称 | The Turing Test Hackathon 2026 by Mantle，分两阶段 | https://chainwire.org/2026/04/23/mantle-launches-turing-test-hackathon-2026-backed-by-tencent-cloud-bybit-byreal-and-bga/ |
| 阶段结构 | Phase 1 ClawHack（$20,000，2026-04-15 ~ 04-30）+ Phase 2 AI Awakening（$100,000）；总奖池 $120,000 | https://chainwire.org/2026/04/23/mantle-launches-turing-test-hackathon-2026-backed-by-tencent-cloud-bybit-byreal-and-bga/ |
| 报名/提交平台 | DoraHacks 或 HackQuest；信息中心 https://devhub.mantle.xyz/ | https://dorahacks.io/hackathon/mantleturingtesthackathon2026 |

### Phase 2 六大赛道（官方 devhub 命名）及赞助商

| # | 赛道（官方 devhub 名称） | 赞助商 |
| --- | --- | --- |
| 01 | AI Trading and Strategy | BGA x Bybit |
| 02 | AI Alpha and Data | Mirana Ventures |
| 03 | AI x RWA | Mantle |
| 04 | Consumer and Viral DApps | Animoca Minds x Animoca Brands x OpenCheck |
| 05 | AI DevTools | Tencent Cloud |
| **06** | **Agentic Economy（智能体经济 / 代理经济）** | **Byreal** |

来源：https://devhub.mantle.xyz/

- **Agentic / Economy 赛道 = Track 06「Agentic Economy」，赞助商为 Byreal。** 官方 devhub 对其完整描述为：「Agentic wallet economies built using the Byreal Skills CLI」（用 Byreal Skills CLI 构建的智能体钱包经济）。来源：https://devhub.mantle.xyz/
- **命名差异（重要）**：官方 devhub 用 "Agentic Economy"；而 chainwire / PRNewswire 新闻稿用 "Agentic Wallets and Economy"。后者是新闻稿措辞，**并非 devhub 实时网页措辞**。两者均确认 Byreal 为赞助商。来源：https://chainwire.org/2026/04/23/mantle-launches-turing-test-hackathon-2026-backed-by-tencent-cloud-bybit-byreal-and-bga/

### Phase 2 奖项分配（总额 $100,000）

| 奖项 | 金额 | 说明 |
| --- | --- | --- |
| Grand Champion（总冠军） | $9,000 | |
| Track First Prize（赛道一等奖） | 6 × $8,500 = $51,000 | 每赛道一名 |
| Community Voting（社区投票） | 2 × $8,500 = $17,000 | |
| Best UI/UX Award | $3,000 | |
| **Finalist and Deployment（决赛入围 + 部署）** | **20 × $1,000 = $20,000** | **见下方资格规则** |

来源：https://devhub.mantle.xyz/

### 20 × $1,000 奖项的精确资格规则

- **不是「凡部署即得」的保底奖，而是评审筛选 + 部署双重门槛的竞争性奖项。**
- 官方原文（verbatim）：**"Finalist and Deployment: 20 × 1000 — Top 20 Finalists deployed on Mantle"**，即「在 Mantle 上完成部署的前 20 名决赛入围者」。
- 部署是**必要条件**，但**不是充分条件**：还必须被评审选入 Top 20。
- 来源：https://devhub.mantle.xyz/

### 提交要求（官方 devhub 原文）

> "Submit by posting a Thread on X with #MantleAIHackathon including your pitch, demo video, GitHub link, and Mantle contract address."

即在 X（Twitter）发布带 **#MantleAIHackathon** 标签的 Thread，包含：

| 必交物 | 说明 |
| --- | --- |
| Pitch | 项目陈述 |
| Demo video | 演示**视频**（注意：是视频，不强制要求公开 live demo） |
| GitHub link | 代码仓库链接（未明文要求开源 / 公开） |
| Mantle contract address | 一个已**部署**在 Mantle 上的合约地址（隐含需要部署，但**未提及源码 verify**） |

来源：https://devhub.mantle.xyz/

- 评审标准（官方「Judging Criteria of AI Awakening」Google Sheet，自 devhub 链接）Part A（适用全部赛道）：Technical 15、Ecosystem fit（Mantle 技术栈/资产集成）10、Business potential 10、Innovation 10、User experience 5。其中 "Execution & demo quality"（5 分）明确接受 **"live demo OR meaningful simulation"**（实时 demo 或有意义的模拟均可）。来源：https://docs.google.com/spreadsheets/d/1TMWhQ8cKp_1NF1ZelxtBGIF6l3bQZTA0ipjSREiqRhM/edit?gid=0

### 提交截止时间（精确）

| 节点 | 时间 |
| --- | --- |
| 报名 / 全球启动 | 2026-05-01 |
| **提交截止** | **2026-06-15，15:59（DoraHacks 显示 15:59 UTC）** |
| Demo Day | 2026-07-02 ~ 07-03 |
| 公布获奖 | 2026-07-10 |

- 截止为**硬时间点 15:59**，**不是当日 23:59**，请预留缓冲提前提交。
- DoraHacks 页面在约 2026-05-31 显示「2026/06/15 15:59，剩 15 天」，与该日期一致。
- 来源：https://devhub.mantle.xyz/ ；https://dorahacks.io/hackathon/mantleturingtesthackathon2026

### 在哪里提交

- 注册 / BUIDL 提交：**DoraHacks**（https://dorahacks.io/hackathon/mantleturingtesthackathon2026）或 **HackQuest**。
- 外加：在 **X** 发布 **#MantleAIHackathon** Thread（pitch + demo video + GitHub link + Mantle contract address）。
- 信息中心：https://devhub.mantle.xyz/
- ⚠️ DoraHacks 页面正文无法被程序抓取（HTTP 405/403），**BUIDL 表单字段的逐字内容未经确认**；请在浏览器中打开页面核对。来源：https://dorahacks.io/hackathon/mantleturingtesthackathon2026

---

## 三大工具链

> 核心结论先行：这三套工具的链各不相同 —— **byreal-agent-skills 跑在 Solana，byreal-perps-cli 跑在 Hyperliquid，RealClaw 的核心现货/流动性在 Solana（基于 OpenClaw 运行时）。没有一个原生跑在 Mantle 上。**

### 1. byreal-agent-skills（即「Byreal Skills CLI」/ byreal-cli）

| 维度 | 内容 |
| --- | --- |
| 是什么 | Byreal DEX 的命令行工具 + 智能体技能（agent skill），让 AI agent 分析 CLMM 池、做 swap、管理 LP 仓位、跟单农场（copy farming）。**这是 Track 06「Agentic Economy」官方点名的赛道工具。** |
| **运行链** | **Solana**（Byreal 是 Bybit 孵化的 Solana 原生 CLMM + RFQ DEX）。Mantle 仅作为桥（Mantle Super Portal 把资产桥到 Solana），**不是执行链**。 |
| 认证方式 | 本地 keypair（密钥存于 `~/.config/byreal/keys/`，权限 0600）。**CLI 不使用 Privy**（Privy 只用于另一个产品 RealClaw Telegram）。 |
| 安装命令 | CLI：`npm install -g @byreal-io/byreal-cli`<br>技能：`npx skills add byreal-git/byreal-agent-skills` |
| 关键能力 | CLMM 池分析（APR / TVL / volume / 风险 / K 线）；通过 CLMM、AMM、RFQ 做带滑点控制的 swap；LP 仓位 open/increase/decrease/close/claim；跟单农场（`positions copy`）；Auto Swap Zap（`--auto-swap`）；每条命令支持 `-o json` 结构化输出 |
| 子命令 | `pools`、`tokens`、`swap`、`positions`、`wallet`、`setup`、`config`；自发现：`byreal-cli catalog list` / `byreal-cli skill` |
| 安全 | 先 `--dry-run` 再 `--confirm`；滑点 >200 bps 或金额 >$1000 时告警；不要粘贴私钥（交互式 setup） |

**最小用法示例：**

```bash
# 安装为 OpenClaw 技能
npx skills add byreal-git/byreal-agent-skills

# 发现能力
byreal-cli catalog list

# 列出 / 分析池子（JSON 输出供 agent 消费）
byreal-cli pools list -o json

# 先演练再确认地执行一笔 swap
byreal-cli swap --dry-run ...
byreal-cli swap --confirm ...
```

来源：https://github.com/byreal-git/byreal-agent-skills ；https://github.com/byreal-git/byreal-agent-skills/blob/main/skills/byreal-cli/SKILL.md ；https://docs.byreal.io/

### 2. byreal-perps-cli（Byreal Perps Agent Skills）

| 维度 | 内容 |
| --- | --- |
| 是什么 | 面向 AI/agent 的永续合约命令行工具，作为 OpenClaw 技能发布，可一键装入任意 RealClaw 配置。把永续交易带入与 Byreal/RealClaw 现货同一套对话式 agent 层。 |
| **运行链** | **Hyperliquid**（订单在 Hyperliquid 自有 L1 链上订单簿执行/结算，单块最终性）。资金来自 Solana 上的 Privy 非托管钱包（USDC 充值），**RealClaw 自动完成 Solana → Hyperliquid 桥接**。 |
| 包名 | `@byreal-io/byreal-perps-cli` |
| 安装命令 | `npm install -g @byreal-io/byreal-perps-cli` |
| 关键能力 | 在 Hyperliquid 永续上下市价/限价、做多/做空；附带 TP（`--tp`）/ SL（`--sl`）自动止盈止损；管理仓位、调整杠杆（CLI README/Privy 称 1–50x，2026-03 场所发布稿称 up to 40x）；跨/逐仓；`close-all`；跨保守/适中/激进风险档的信号扫描（top ~30 资产）；行情指标 RSI / MACD / Bollinger Bands / EMA crossover / 资金费率；面向 LLM agent 的结构化 JSON 输出；Privy 非托管，用户始终保管资金 |

**最小用法示例（README 原文）：**

```bash
# 安装
npm install -g @byreal-io/byreal-perps-cli

# 市价买入 0.01 BTC，并挂止盈/止损
byreal-perps-cli order market buy 0.01 BTC --tp 110000 --sl 90000

# 设置 BTC 杠杆为 10x
byreal-perps-cli position leverage BTC 10

# 一键平掉所有仓位
byreal-perps-cli position close-all -y

# 扫描交易信号
byreal-perps-cli signal scan
```

来源：https://github.com/byreal-git/byreal-perps-cli ；https://www.prnewswire.com/apac/news-releases/byreal-expands-agent-native-trading-to-perpetual-futures-with-byreal-perps-agent-skills-302755614.html ；https://docs.byreal.io/byreal-perps-agent-skills/what-are-byreal-perps-agent-skills

### 3. RealClaw + OpenClaw 基座

| 维度 | 内容 |
| --- | --- |
| 是什么（RealClaw） | Byreal 的 Telegram 优先（聊天/语音）代理金融产品，用户把链上交易、swap、做市、组合管理委托给自主 AI agent。**架构上 RealClaw ≠ 独立 agent，而是一套 OpenClaw 兼容 agent + 预装 Byreal 技能。** |
| 是什么（OpenClaw） | 开源、本地优先的个人 AI 助手运行时（围绕 Molty 太空龙虾人设），跑在 macOS / Linux / Windows(WSL2)；技能以 `SKILL.md` 文件夹形式存在，有 ClawHub 注册表。RealClaw 即以 OpenClaw 技能形式接入。 |
| **运行链** | **Solana**（RealClaw 现货/流动性核心 = Byreal Solana CLMM DEX）。其永续扩展（Perps Agent Skills）在 **Hyperliquid**。byreal-git 组织另有一个 `evm-cli`（极简 EVM 转账 CLI）。**OpenClaw 本身是 agent 运行时，不是区块链。** |
| 钱包 | RealClaw 内为 **Privy 非托管**（用户保管私钥）；底层 byreal-cli 则用本地密钥。 |
| 可用性 | RealClaw 启动时为**白名单制**（信息见 openclaw.mantle.xyz）；但底层 **Byreal Agent Skills 完全公开开源（MIT）**。 |
| 安装命令（OpenClaw） | `npm install -g openclaw@latest`<br>`openclaw onboard --install-daemon` |
| 安装命令（装入 Byreal 技能 = 在 RealClaw 上构建） | `npx skills add byreal-git/byreal-agent-skills`<br>或 `npm install -g @byreal-io/byreal-cli` |
| 黑客松团队怎么「在 RealClaw 上构建」 | 把 Byreal 技能装进 OpenClaw agent，然后在 CLI 原语之上编写自己的 agent 策略/技能（每条命令都出 JSON 供编程化使用） |

**最小用法示例：**

```bash
# 1. 安装 OpenClaw 运行时
npm install -g openclaw@latest
openclaw onboard --install-daemon

# 2. 装入 Byreal 技能（即获得 RealClaw 式能力）
npx skills add byreal-git/byreal-agent-skills

# 3. 让 agent 自发现能力并执行策略
byreal-cli skill          # agent 读取的完整文档
byreal-cli catalog list   # 发现能力
```

相关仓库：
- 公开引擎（RealClaw 背后）：https://github.com/byreal-git/byreal-agent-skills （TypeScript，MIT）
- RealClaw 专用仓库：https://github.com/byreal-git/RealClaw-Skills （README/描述未能加载，内容未确认）
- 组织：https://github.com/byreal-git （另有 byreal-sdk、byreal-clmm/-sdk、byreal-jupiter-integration、byreal-perps-cli、byreal-api-docs、evm-cli 等）
- OpenClaw：https://github.com/openclaw/openclaw ；技能文档 https://docs.openclaw.ai/tools/skills

来源：https://www.prnewswire.com/news-releases/bringing-agentic-finance-to-telegram-byreal-debuts-realclaw-transitioning-onchain-finance-to-an-agent-first-economy-302740561.html ；https://chainwire.org/2026/04/13/bringing-agentic-finance-to-telegram-byreal-debuts-realclaw-transitioning-onchain-finance-to-an-agent-first-economy/ ；https://docs.byreal.io/

---

## Mantle 部署速查

| 维度 | 值 |
| --- | --- |
| 测试网名称 | **Mantle Sepolia** |
| Chain ID | **5003** |
| RPC | 见 Chainlist 条目（https://chainlist.org/chain/5003） |
| 浏览器 / Explorer | Routescan / Blockscout（用于查看与可选的源码 verify） |
| 部署方式 | Foundry `forge` 或 Hardhat |
| 源码 verify | 经 Routescan 或 Blockscout —— **注意：官方提交规则从未要求源码 verify，仅要求提供合约地址（见下方冲突章节）** |
| 水龙头 / Faucet | 使用 Mantle Sepolia 测试网水龙头领取测试 MNT（具体水龙头未在调研中点名，需在浏览器确认） |

来源：https://chainlist.org/chain/5003

---

## 🔴 与现有 CLAUDE.md 冲突 / 需修正之处

> **本节最重要。** 逐项给出：计划假设 → 实际真相 → 推荐修正。

### 1. 链不匹配（致命架构错误）

| 维度 | 内容 |
| --- | --- |
| 计划假设 | Byreal（CLMM/swap/LP）与 Byreal Perps 跑在 Mantle 上；可用「部署在 Mantle 的合约调用 Byreal」实现深度集成。 |
| **实际真相** | **被驳斥（refuted）。** Byreal 核心 DEX（CLMM/swap/LP）跑在 **Solana**；Byreal Perps 跑在 **Hyperliquid**（自有 L1 订单簿，单块最终性，资金从 Solana Privy 钱包自动桥接过去）。Mantle 与 Byreal 的唯一关系是 **Mantle Super Portal 桥**（把资产搬向 Solana），**不是执行链**。因此**链上没有任何 Byreal 合约**，Mantle EVM 合约**无法通过链上调用**触达 Solana 程序或 Hyperliquid L1。 |
| **推荐修正** | 把「深度集成 Byreal」建模为 **链下 / agent 层集成**：构建 OpenClaw/RealClaw agent，装入 Byreal Agent Skills（`npx skills add byreal-git/byreal-agent-skills`，永续用 `@byreal-io/byreal-perps-cli`），让 agent 在 Solana（现货/CLMM/LP）和 Hyperliquid（永续）上交易；另在 Mantle 上**独立部署**一个有意义的 EVM 合约（如 agent 身份/注册表、策略、记账、金库、结果存证）。两套组件由你的 agent 逻辑「桥接」，而**非链上互相调用**。在架构图/评审 pitch 中明确画出「bridge-not-call」边界，**不要声称 Byreal 跑在 Mantle 上**。 |

来源：https://docs.byreal.io/ ；https://github.com/byreal-git/byreal-perps-cli ；https://chainwire.org/2026/03/17/byreal-perps-now-live-24-7-onchain-perpetual-trading-with-rwa-asset-coverage/

### 2. 「Agentic 赛道要求部署并 verify Mantle 合约」

| 维度 | 内容 |
| --- | --- |
| 计划假设 | Agentic Economy 赛道**专门要求**在 Mantle 上**部署并 verify**智能合约。 |
| **实际真相** | **部分正确（partially_correct）。** ① 链上要素是**全 Phase 2 通用提交规则**，**非该赛道专属**：官方仅在一处声明，适用全部六赛道 —— 提交需含 "Mantle contract address"。Track 06 自身描述只有「built using the Byreal Skills CLI」，**未附加任何合约要求**。② 官方规则**从未出现 "verify"/"verified"**；只要求提供「合约地址」（隐含已部署），**不要求源码链上验证**。 |
| **推荐修正** | **不要把「部署 + verify」当作赛道门槛。** 唯一通用、有据可查的链上必交物是 X-thread 里的「Mantle 合约地址」（外加 pitch、demo video、GitHub link）。除非你自己愿意，否则**别在 Routescan/Blockscout 源码 verify 上耗时**。仍应保留 Mantle 部署，但理由是：它是通用提交期望 + 它是解锁「Top 20 决赛 + 部署」奖的前提。一个记录/锚定 agent 活动的**极简 Mantle Sepolia（chain 5003）合约**即可满足该字段。 |

来源：https://devhub.mantle.xyz/ ；https://github.com/byreal-git/byreal-agent-skills/blob/main/README.md

### 3. 「20 × $1,000 保底」策略不可靠

| 维度 | 内容 |
| --- | --- |
| 计划假设 | 「20 × $1,000 Finalist & Deployment」是任何完成部署的项目都能拿的**保底奖 / 保本下限**。 |
| **实际真相** | **被驳斥（refuted）。** 官方唯一拆解该子奖的来源（devhub）原文：**"20 × $1,000 — Top 20 Finalists deployed on Mantle"**。这是**评审筛选 + 部署双重门槛**的竞争性奖项：必须（a）被选入 Top 20 决赛者 **且**（b）已在 Mantle 部署。部署是必要而非充分条件。$20,000 是**固定上限**，与「任意数量部署者的下限」在数学上矛盾。没有任何来源含 "guaranteed"/"participation reward"/"every project that deploys" 字样。六个赛道平均每道仅约 3–4 个决赛名额。 |
| **推荐修正** | **不要把 $1,000 当作保底/保本下限计入期望值或资金底线**，把它当作 upside。要真正越过 "Top 20" 这条线，应面向评审轴优化（technical、ecosystem fit/Mantle 集成、business potential、innovation、UX），并以某赛道一等奖（$8,500）为现实主目标。 |

来源：https://devhub.mantle.xyz/ ；https://www.prnewswire.com/news-releases/mantle-unites-global-ai-tech-and-youth-communities-for-its-largest-ai-hackathon-backed-by-tencent-cloud-bybit-byreal-and-blockchain-for-good-alliance-302750420.html

### 4. 「必须用 byreal-agent-skills / byreal-perps-cli / RealClaw + 链上可调 AI + 公开 live demo + 开源仓库」

| 维度 | 内容 |
| --- | --- |
| 计划假设 | 获胜的 Agentic 项目**必须**用 byreal-agent-skills **或** byreal-perps-cli **或** RealClaw，且至少有一个 AI 功能**链上可调用**，外加**公开（非 localhost）live demo** 和**开源仓库**。 |
| **实际真相** | **被驳斥（refuted）。** ① Track 06 官方仅点名 **「Byreal Skills CLI」= `@byreal-io/byreal-cli`（byreal-agent-skills 仓库，Solana 工具）**；**byreal-perps-cli（Hyperliquid）和 RealClaw（白名单 Telegram 产品）并非赛道点名工具**，三者「或」的关系是错的。② 官方评审 rubric **没有**「AI 功能链上可调用」这一条。③ rubric 的 "Execution & demo quality"（5 分）**明确接受 "live demo OR meaningful simulation"** —— **不强制公开 live demo**，模拟也可。④ **无开源/OSI 要求**；提交要的 "GitHub link" **可为私有**，未按开源评分。⑤ "Mantle stack integration" 是计分项（"Ecosystem fit"，100 分制中占 10 分），**非淘汰性硬门槛**。 |
| **推荐修正** | 删掉「这些是硬门槛」的假设 —— 用某 Byreal 工具、链上可调 AI、公开 live demo、开源仓库**均非强制**，最多是计分项或可选。**不要**围绕 byreal-perps-cli 或 RealClaw 当作满足赛道（赛道点名的是 `@byreal-io/byreal-cli` / `npx skills add byreal-git/byreal-agent-skills`）。要真正**获胜**（而非仅合格），按 100 分 rubric 优化：Technical(15)、Ecosystem fit/Mantle 集成(10)、Business potential(10)、Innovation(10)、UX 含 AA/gasless(5)，加赛道专属 50 分（透明性/可验证性、策略合理性、现实影响、demo 质量）。可工作的 live demo 与公开仓库虽**非强制**，但因计入 "demo quality" 与 "Technical/transparency"，**强烈建议**保留。 |

来源：https://docs.google.com/spreadsheets/d/1TMWhQ8cKp_1NF1ZelxtBGIF6l3bQZTA0ipjSREiqRhM/edit?gid=0 ；https://devhub.mantle.xyz/ ；https://github.com/byreal-git/byreal-agent-skills

### 5. 赛道名称 / 奖项 / 截止假设的修正清单

| 维度 | 内容 |
| --- | --- |
| 赛道名称 | 若 CLAUDE.md 写 "Agentic Wallets and Economy"，注意这是**新闻稿措辞**；**官方 devhub 实时名称是 "Agentic Economy"（Track 06）**。两者赞助商都是 Byreal。提交/对外措辞建议以 devhub 为准。来源：https://devhub.mantle.xyz/ |
| 截止日期 | **2026-06-15 正确**，但需修正为**硬截止 15:59（UTC）**，非当日 23:59；请至少提前一天提交。来源：https://dorahacks.io/hackathon/mantleturingtesthackathon2026 |
| Phase 混淆 | RealClaw / ClawHack 是 **Phase 1（2026-04-15~04-30，$20k）** 工具与赛事；**不要**把 Phase 1 工具当成 Phase 2 Track 06 的规则。来源：https://chainwire.org/2026/04/13/bringing-agentic-finance-to-telegram-byreal-debuts-realclaw-transitioning-onchain-finance-to-an-agent-first-economy/ |
| 集成深度优先级 | 「深度集成 Byreal」这一半是对的，且正是 Track 06 的真正差异化点（"built using the Byreal Skills CLI"）；**应优先把 Byreal CLI 集成做深，而非把 Mantle 合约做复杂**。来源：https://devhub.mantle.xyz/ |

---

## ❓ 仍需你确认 / 官方澄清的开放问题

1. **DoraHacks BUIDL 表单逐字字段未确认**：DoraHacks 页面正文无法被程序抓取（HTTP 405/403），仅托管在 DoraHacks 的提交表单字段/规则原文未经核实。请在浏览器打开 https://dorahacks.io/hackathon/mantleturingtesthackathon2026 核对后再定稿。
2. **Track 06 名称二义**：devhub "Agentic Economy" vs 新闻稿 "Agentic Wallets and Economy" —— 以哪个为对外正式名称需最终确认（赞助商 Byreal 一致）。
3. **是否所有 Phase 2 项目都要集成 Byreal？** 无来源表明这是**通用强制**；Byreal / Byreal Skills CLI 是 **Track 06 专属**（RealClaw 是 Phase 1 工具）。若你不打 Track 06，则无需集成 Byreal。
4. **是否存在「AI 功能必须链上可调用」的通用规则？** 未找到任何逐字通用规则；唯一有据的链上要求是提交时提供 Mantle 合约地址。
5. **「开源仓库」/「公开 live demo」是否被隐性要求？** 提交要 GitHub link（可私有，未明文要求 public/OSI 许可）；"public demo" 的证据是 demo **视频**，而非单独强制的 live demo。建议据评分权衡是否公开。
6. **奖项细分的二次独立来源**：Best UI/UX 金额与 Track/Community-Voting 拆分虽能对账到 $100,000，但仅来自 devhub 渲染，缺第二个独立一手来源。
7. **RealClaw-Skills 仓库内容未确认**：https://github.com/byreal-git/RealClaw-Skills 的 README/描述未能加载，是否为官方黑客松起步模板未知。
8. **最大杠杆口径不一致**：byreal-perps-cli README/Privy 称 1–50x，2026-03 场所发布稿称 up to 40x。50x 似为当前 CLI/agent-skills 规格，正式 pitch 引用前请二次确认。
9. **Mantle Sepolia 水龙头与 RPC 具体地址**：本调研未点名具体 faucet/RPC，请在 Chainlist（https://chainlist.org/chain/5003）与官方 docs 确认后填入。
10. **openclaw.mantle.xyz（RealClaw 白名单/落地页）未被直接抓取核实**；如计划依赖白名单访问 RealClaw，需提前确认开通状态。
