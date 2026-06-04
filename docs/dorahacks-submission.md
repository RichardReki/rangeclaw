# DoraHacks 提交内容（按通用 BUIDL 表单字段整理）

> 字段对不上就把 DoraHacks 那页截图发我，按它实际栏目调。
> ⚠️ 唯一待补：**demo 视频链接**（录完填两处：本文件 + X thread 第 5 条）。所有内容与 [README](../README.md) / [toolchain-notes](toolchain-notes.md) 一致，不夸大。

## 项目名 / Project Name
**RangeClaw — AI LP 做市管家**

## 一句话 / Tagline
- **中文**：替你管理 Byreal 集中流动性的 AI 做市管家——每个调仓决策都在 Mantle 上可被任何人独立验证。
- **EN**: An AI agent that manages your Byreal concentrated-liquidity positions — every decision is independently verifiable on Mantle.

## 赛道 / Track
Track 06 — **Agentic Economy**（Byreal 赞助）

## 详细描述 / Description (EN)
RangeClaw is an AI agent that manages concentrated-liquidity (CLMM) market-making positions on **Byreal (Solana)**. It continuously monitors price ranges, and a **deterministic, auditable rule engine** decides when to rebalance, claim fees, or de-risk — an LLM only generates the human-readable rationale, never the money-moving action.

Crucially, **every autonomous decision is committed to Mantle as a tamper-evident record**: a `decisionHash` (keccak256 commitment to the full decision payload) plus an on-chain-derived `boundHash` that binds {chainId, contract, agentId, action, poolId, decisionHash, timestamp}. Anyone can recompute these from chain data and confirm the AI decided *exactly this, at this time, for this pool, unaltered* — and that the row can't be replayed across agents/pools.

Architecture is an honest **bridge-not-call**: Byreal executes on Solana, Mantle is the independent verification layer; the two are linked off-chain by the agent (we never claim Byreal runs on Mantle). The `LPAgentRegistry` contract is **deployed on Mantle Sepolia with a real recorded decision**, and the dashboard reads + verifies it live. (Byreal trade execution is meaningful simulation / dry-run for the demo, which the rubric explicitly allows.)

## 详细描述（中文）
RangeClaw 是一个管理 **Byreal（Solana）** 上 CLMM 集中流动性做市仓位的 AI agent。它持续监控价格区间，由**确定性、可审计的规则引擎**决定何时调仓/收费/降风险——LLM 只生成人话理由，绝不决定动钱的动作。

关键在于：**每一次自主决策都作为防篡改记录写进 Mantle**——`decisionHash`（决策全文的 keccak256 承诺）+ 链上派生的 `boundHash`（绑定 chainId/合约/agentId/动作/池/decisionHash/时间）。任何人都能从链上数据重算这两个哈希，确认"这个 AI 确实在此刻、对此池、这么决策、且未被篡改"，并防止跨 agent/跨池重放。

架构是诚实的 **bridge-not-call**：Byreal 在 Solana 执行，Mantle 是独立验证层，两者由 agent 在链下串联（绝不声称 Byreal 在 Mantle 上）。`LPAgentRegistry` 合约**已部署 Mantle Sepolia 并写入一条真实决策**，看板实时读取并核验。（demo 中 Byreal 下单为 dry-run/模拟，rubric 接受。）

## 技术栈 / Tech Stack
Solidity + Foundry（Mantle Sepolia）· TypeScript + viem（agent）· React + Vite（看板）· OpenClaw + `@byreal-io/byreal-cli`

## 已部署合约 / Deployed Contract
- **LPAgentRegistry** · Mantle Sepolia（chainId **5003**）
- 地址：`0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF`
- 浏览器（含 recordDecision 交易）：https://explorer.sepolia.mantle.xyz/address/0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF
- 链上现状：1 条 Rebalance 决策，boundHash 可独立复算一致

## 链接清单 / Links
- 🔗 在线看板 / Live demo：https://rangeclaw.vercel.app
- 💻 代码 / GitHub：https://github.com/RichardReki/rangeclaw
- 📜 合约浏览器 / Contract：https://explorer.sepolia.mantle.xyz/address/0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF
- 🎥 Demo 视频 / Video：**[录完填]**

## 提交前自查
- [ ] X 号能正常发推（**先测**；被封则换号或确认站内提交）
- [ ] demo 视频链接已填入本文件 + X thread
- [ ] DoraHacks 表单实际字段已逐项核对
