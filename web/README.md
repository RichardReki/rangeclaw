# RangeClaw 看板

React + viem 前端：渲染 **可验证 AI 做市决策日志**，评审可**当场核验哈希**。

```
src/
├── chain.ts        Mantle Sepolia 链 + publicClient（只读，无需钱包）
├── abi.ts          LPAgentRegistry 读侧 ABI
├── registry.ts     读链：agentCount / decisionCount / getDecisions
├── verify.ts       ★ 核验：decisionHash + boundHash 重算（与 agent/合约同源）
├── mockData.ts     DEMO 数据（用同源函数算真实哈希，核验照样 ✓）
├── useRegistry.ts  live(读链) / demo(mock) 自动切换
├── format.ts       1e18/1e6/时间/地址 格式化
├── components/     SummaryBar / Controls / DecisionLog / VerifyModal
└── App.tsx
```

## 跑起来

```bash
cd web
npm install
npm run dev        # 默认 DEMO 模式（无需部署/钱包）即可演示与核验
npm test           # 核验逻辑单测（与 agent 同源）
npm run build      # 产出可部署到 Vercel 的静态站
```

接真实链：复制 `.env.example` 为 `.env.local`，填 `VITE_REGISTRY_ADDRESS`（部署后）+ `VITE_RPC_URL`，自动切到 **LIVE** 模式读 `getDecisions()`。

## 两层核验（评审最直观的卖点）

| 核验 | 需要什么 | 证明 |
| --- | --- | --- |
| **boundHash 自洽** | 仅链上数据（每行自动 ✓/✗） | 这行的 agentId/action/poolId/timestamp/decisionHash 正是合约绑定的那组，未被张冠李戴 |
| **decisionHash 匹配** | 链下 canonical JSON | 重算 keccak256 = 链上值 → 决策全文未被事后篡改 |

> ⚠️ `verify.ts` 的 `canonicalize` / `computeDecisionHash` / `computeBoundHash` 必须与 [agent/src/attest/hash.ts](../agent/src/attest/hash.ts) 及合约 `boundHash` 派生**逐字节一致**，否则核验会静默失败。改一处要同步另一处。

## 部署（Vercel）

`npm run build` 后将 `dist/` 部署为静态站；构建时注入 `VITE_*` 环境变量即可连真实合约。公开 URL 用于提交。
