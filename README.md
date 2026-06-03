# RangeClaw — AI LP 做市管家

> 参赛 **The Turing Test Hackathon 2026 · Phase 2 AI Awakening · Track 06 Agentic Economy（Byreal）**。

**一句话**：一个替你管理 **Byreal（Solana）** 集中流动性（CLMM）做市仓位的 AI agent——自动监控价格区间、由 agent 按确定性策略决策何时调仓/收费/降风险（AI 生成理由），并为**每一次自主决策生成可上链的承诺**（decisionHash + boundHash）；存证到 Mantle 即成可验证账本。任何人都能重算核验：这个 agent 当时确实这么决策、且没被事后篡改。

---

## 核心卖点：可验证的 AI 决策

- **可审计的 AI**：调仓"做什么"由**确定性规则引擎**决定（可复现、可审计）；LLM 只负责生成"为什么"的人话理由。不是黑箱。
- **可验证账本**：为每个决策生成 `decisionHash`（决策全文承诺）+ `boundHash`（绑定 chainId/合约/agentId/动作/池/时间，**防跨 agent、跨池重放**），编码出 `recordDecision` 调用存证到 Mantle（默认离线生成 calldata，链上广播需显式开启）。
- **当场核验**（看板）：
  - `boundHash` 自洽——**仅凭链上数据**即可重算，证明该行未被张冠李戴；
  - `decisionHash` 匹配——贴入链下决策全文重算 keccak256，证明全文未被篡改。

> agent、合约、看板三处的哈希派生**逐字节同源**（`canonicalize` + `boundHash` 的 ABI 编码完全一致，见 hash.ts / verify.ts / 合约顶部「KEEP IN SYNC」守卫；代码经多轮自查复核），所以核验真的对得上。

## 架构：bridge-not-call（诚实的跨链）

Byreal 跑在 **Solana**（Perps 在 Hyperliquid），Mantle 上**没有** Byreal 合约。因此：

- **集成 Byreal = 链下 agent 层**：用官方点名的 Byreal Skills CLI（`@byreal-io/byreal-cli`）读取 Solana 上的 CLMM 池/仓位；调仓/收费/swap 生成 dry-run 执行计划，真实 `--confirm` 下单待作者在真实环境接线（字段映射待对照实际 CLI schema）。
- **Mantle 合约 = 独立可验证账本**：只存决策承诺，**不持仓、不托管资金、不调用 Byreal**。
- 两者由 agent 后端串联，**不在链上互相调用**。绝不声称 Byreal 在 Mantle 上。

```
用户 → AI Agent (OpenClaw + Byreal Skills)
        Monitor → Decide(规则+LLM) → Execute → Attest
        │ byreal-cli (Solana)            │ viem (EVM)
        ▼                                ▼
   Byreal CLMM (Solana)   ✗不链上互调   LPAgentRegistry (Mantle Sepolia 5003)
```

详见 [docs/architecture.md](docs/architecture.md)；赛事/工具链已核实事实见 [docs/toolchain-notes.md](docs/toolchain-notes.md)。

## 仓库结构

```
contracts/   Foundry：Mantle Sepolia 上的 LPAgentRegistry 决策存证合约（+ 34 测试）
agent/       TypeScript agent：Monitor → Decide → Hash → Attest（OpenClaw + Byreal Skills）
web/         React + viem 看板：可验证 AI 决策日志 + 一键核验
docs/        架构 / 事实核查 / demo 脚本 / pitch
```

## 快速开始

```bash
# 合约（需 Foundry：https://getfoundry.sh）
cd contracts && forge install foundry-rs/forge-std && forge test -vvv

# Agent 后端（需 Node 18+）
cd agent && npm install && npm run demo     # 离线端到端：决策→哈希→calldata

# 前端看板
cd web && npm install && npm run dev        # 默认 DEMO 模式，可直接演示+核验
```

各子目录有独立 README：[contracts](contracts/)（待建独立说明）/ [agent/README.md](agent/README.md) / [web/README.md](web/README.md)。

## 技术栈

Solidity + Foundry（Mantle Sepolia）· TypeScript + viem · React + Vite · OpenClaw + `@byreal-io/byreal-cli`。

## 已部署合约

| 网络 | 合约 | 地址 |
| --- | --- | --- |
| Mantle Sepolia (chainId 5003) | LPAgentRegistry | [`0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF`](https://explorer.sepolia.mantle.xyz/address/0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF) |

部署脚本：[contracts/script/Deploy.s.sol](contracts/script/Deploy.s.sol)（签名广播由项目作者本人执行）。

## 提交清单（截止 2026-06-15 15:59 UTC）

> 注意：**15:59 为硬截止（UTC），非当日 23:59**，请提前提交。

- [x] 部署 LPAgentRegistry 到 Mantle Sepolia，回填上表地址（`0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF`）
- [ ] 录制 demo 视频（脚本见 [docs/demo-script.md](docs/demo-script.md)）
- [ ] 在 X 发带 `#MantleAIHackathon` 的 Thread：pitch + demo 视频 + 本仓库链接 + Mantle 合约地址
- [ ] DoraHacks / HackQuest 报名提交
- [ ] 浏览器核对 DoraHacks BUIDL 表单逐字要求

## 状态与诚实标注

- ✅ **真实**：合约逻辑 + 34 测试、agent/合约/看板哈希一致性、核验流程、可部署到 Mantle 测试网。
- 🟡 **骨架/模拟**：Byreal 现货执行在 demo 走 `--dry-run`/mock（rubric 接受 meaningful simulation）；真实 CLI 字段映射、真实 `--confirm` 下单待团队在真实环境接线。
- ⛔ **不声称**：Byreal 在 Mantle 上 / AI 在链上推理 / 真实资金已自动交易。

## 安全

涉及私钥、资金、合约部署广播、最终提交的步骤均由项目作者本人执行。Agent 默认离线 `prepare` 模式，链上写入需显式开启 `ENABLE_ONCHAIN_WRITE`。详见 [CLAUDE.md](CLAUDE.md) 第 7 节。
