# RangeClaw Agent 后端

AI LP 做市管家的"大脑"：**Monitor → Decide → Hash → Attest** 一条链路。

```
src/
├── byreal/        Byreal CLI 抽象：mockClient(离线) / cliClient(真实, Solana)
├── monitor.ts     从池+仓位算指标（inRange / 利用率 / 未领手续费 / IL）
├── decide/
│   ├── rules.ts   确定性触发引擎 → 提议动作（可审计）
│   └── llm.ts     AI 决策叙述（MockReasoner 默认 / AnthropicReasoner 可选）
├── attest/
│   ├── hash.ts    canonical JSON + decisionHash + boundHash（与合约逐字节一致）
│   ├── abi.ts     LPAgentRegistry 最小 ABI
│   └── attestor.ts viem：prepare(离线) / simulate(只读) / send(默认禁用)
├── execute/planner.ts  Byreal CLI 执行计划（只产 --dry-run）
├── orchestrator.ts     串联一次完整周期
└── demo.ts             可离线运行的端到端演示
```

## 跑起来（零钱包/零网络/零 API key）

```bash
cd agent
npm install
npm run demo        # 打印一次 Monitor→Decide→Hash→Attest(prepare) 的完整轨迹
npm test            # 决策规则 + 哈希契约一致性单测
npm run typecheck   # tsc --noEmit
```

默认 `MockByrealClient` 的场景是"价格跌出区间"，因此 demo 会产出一次 **Rebalance** 决策、生成 `decisionHash`/`boundHash` 并编码 `recordDecision` calldata（不广播）。

## 安全边界（对应 CLAUDE.md §7）

| 行为 | 默认 | 谁来做 |
| --- | --- | --- |
| 读 Byreal 池/仓位 | mock；真实 CLI 只读 | agent |
| 决策 + 生成哈希 | ✅ | agent |
| 写合约存证 | `prepare`（仅编码 calldata，不上链） | agent |
| 真实 Byreal 下单 `--confirm` | 只产 `--dry-run` 计划 | **你本人** |
| 广播 recordDecision | 禁用，需 `ENABLE_ONCHAIN_WRITE=true` + `AGENT_PRIVATE_KEY` | **你本人** |

环境变量见 [.env.example](.env.example)。私钥仅你本人填，且仅在显式开启写链时使用。

## 待办（接线真实环境时）

- 按 `byreal-cli catalog show pools|positions|swap` 的真实 JSON/参数，校正 [src/byreal/cliClient.ts](src/byreal/cliClient.ts) 与 [src/execute/planner.ts](src/execute/planner.ts) 的字段/旗标。
- 部署合约后把地址填入 `REGISTRY_ADDRESS`，用 `mode:"simulate"` 接通测试网只读校验。
