# 架构设计：AI LP 做市管家（工作名 RangeClaw）

> 事实基线见 [toolchain-notes.md](toolchain-notes.md)。本文件细化第 2 节架构与调仓策略。
> 工作名 `RangeClaw` 仅为占位，可随时改名。

---

## 1. 产品目标

让一个 AI agent 替用户**自动管理 Byreal（Solana）上的 CLMM 集中流动性仓位**：价格漂出区间或手续费/风险达阈值时，由 AI 决策是否调仓，并把**每一次自主决策写到 Mantle 链上存证**，形成可公开验证的"AI 做市行为账本"。

- 现实用户：有 LP 仓位但没空盯盘的 DeFi 用户。
- 评分落点：Byreal 集成深度（Technical）+ AI 策略合理性（赛道分）+ 决策链上可验证（透明性，赛道分）+ Mantle 集成（Ecosystem fit）。

---

## 2. 三层架构（bridge-not-call）

> **铁律**：Byreal 在 Solana，Mantle 上没有 Byreal 合约。两条链**不互相链上调用**，只由 agent 后端串联。

```
用户(NL / Web 看板)
      │ 意图 / 确认
      ▼
┌──────────────────────────────────────────────────────────┐
│  Agent 后端 (OpenClaw 运行时 + Byreal Skills, TypeScript)  │
│  Monitor → Decide(AI) → Execute → Attest                  │
└───────┬───────────────────────────────┬──────────────────┘
        │ byreal-cli (Solana, 链下)      │ viem (EVM, 链下)
        ▼                                ▼
  Byreal CLMM (Solana)            Mantle Sepolia 5003
  开/平/调仓/收费/swap             LPAgentRegistry (存证)
        └──── Mantle Super Portal(仅桥资产) ────┘
```

| 层 | 职责 | 不做什么 |
| --- | --- | --- |
| Agent 后端 | 监控、AI 决策、执行、上链存证、串联两条链 | —— |
| Byreal/Solana | 真正的 LP 执行（CLMM 仓位、swap、收费） | 不感知 Mantle |
| Mantle 合约 | 决策的追加式可验证记录 + agent 身份 | **不**持仓、**不**调用 Byreal、**不**托管资金 |

---

## 3. 调仓策略引擎（核心 AI 逻辑）

### 3.1 监控（Monitor）

周期性（或事件驱动）用 `byreal-cli -o json` 拉取：

- 目标池：`byreal-cli pools <id> -o json` → 现价、TVL、24h volume、APR、波动率、K 线。
- 在管仓位：`byreal-cli positions list -o json` → 每个仓位的区间 `[priceLower, priceUpper]`、流动性、未领手续费、是否在区间内。

派生指标：
- `inRange`：现价是否落在区间内。
- `rangeUtilization`：现价距区间边界的相对位置（越靠边越该警惕）。
- `uncollectedFees`：未领手续费（绝对值 / 占仓位比）。
- `estimatedIL`：相对开仓价的无常损失估计。

### 3.2 决策（Decide，AI 在此发力）

LLM 读入上述结构化指标 + 策略配置，输出一个**决策对象**：

```jsonc
{
  "action": "Rebalance",        // Open|IncreaseLiquidity|DecreaseLiquidity|Rebalance|ClaimFees|Close
  "poolId": "<byreal pool id>",
  "reason": "现价跌破区间下沿 1.8%，24h 波动率 4.2%，建议下移区间至 [P*0.97, P*1.03]",
  "newRange": { "lower": 0.97, "upper": 1.03 }, // 相对现价倍数
  "claimFeesFirst": true,
  "riskNotes": "滑点预算 50bps；调仓涉及一次 swap 平衡比例",
  "confidence": 0.78
}
```

**触发条件（任一满足即进入决策）。优先级：出区间 > 无常损失 > 接近边界 > 手续费（与 `rules.ts` 一致）：**

| 触发 | 默认阈值（可配） | 典型动作 |
| --- | --- | --- |
| 价格出区间 | `inRange == false` | Rebalance（关旧 → swap 平衡 → 开新区间） |
| 无常损失 | `estimatedIL > 阈值` | DecreaseLiquidity / Close |
| 接近边界 | `rangeUtilization > 0.85` | 预警 / 提前 Rebalance |
| 手续费累积 | `uncollectedFees > 阈值` | ClaimFees |
| 波动率骤升（**修饰项**，非独立触发） | `volatility > 阈值` | 在 Rebalance 内扩大区间宽度（降调仓频率）|

### 3.3 执行（Execute，带安全闸）

1. **先演练**：所有写操作先 `--dry-run`，把预期结果回灌给 agent 校验。
2. **二次确认**：金额 > $1000 或滑点 > 200bps 时，必须用户确认（CLI 自带告警）。
3. **执行序列**（以 Rebalance 为例）：
   - `byreal-cli positions claim <id>`（先收手续费）
   - `byreal-cli positions decrease/close <id>`（撤出旧区间）
   - `byreal-cli swap --auto-swap ...`（把两种代币调到新区间所需比例，Zap）
   - `byreal-cli positions open --range ...`（开新区间）
4. **真实下单的 `--confirm` 由用户本人执行**（见 CLAUDE.md 第 7 节）；agent 默认只到 `--dry-run` + 生成待确认计划。

### 3.4 存证（Attest，上 Mantle）

执行成功后，后端用 viem 调 `LPAgentRegistry.recordDecision(...)`：

- 把上面的决策对象做**规范化 JSON**（其中**必须内嵌** `{chainId, contractAddress, agentId, poolId, action, timestamp/nonce}`）→ keccak256 得 `decisionHash`（链上只存哈希承诺，全文存链下/IPFS，省 gas 又可验证）。
- 合约在写入时再**链上派生** `boundHash = keccak256(chainId, contract, agentId, action, poolId, decisionHash, ts)`，把索引字段和承诺**绑死**——防止同一个 `decisionHash` 被换到别的 agent / 别的池"重放"。
- 同时上链几个人类可读的索引字段：`action`、`poolId`、`priceLower/Upper`、`feesClaimed`、`timestamp`。
- 任何人可据 `decisionHash` 比对链下全文、并核对 `boundHash`，验证"**某 agent** 在 **某时刻** 对 **某池** 确实这么决策、且没被事后篡改或张冠李戴"。

> 这一步是把"独立的 Mantle 合约"变成**有真实意义的可验证账本**的关键，直接命中赛道"透明性/可验证性"评分，并呼应赛事 Human-vs-AI 可验证公平主题。

---

## 4. 链上存证模型（LPAgentRegistry）

| 实体 | 字段 | 说明 |
| --- | --- | --- |
| Agent | `operator, metadataURI, registeredAt, active` | agent 身份；`operator` 是代其上链的密钥；`metadataURI` 指向链下策略描述 |
| Decision | `agentId, action, poolId, decisionHash, boundHash, priceLower, priceUpper, feesClaimed, timestamp` | 追加式、不可篡改的决策记录；`boundHash` 绑定索引字段防重放；`priceLower/Upper` 约定为"base 以 quote 计价、1e18 定点"，且须包含在 `decisionHash` 的规范化 JSON 内以保证可验证 |

- **追加式（append-only）**：只有 `recordDecision` 写入，无任何修改/删除函数；配合事件供链下索引。
- **可归属**：`recordDecision` 以 `msg.sender == operator` 归属到某 agent，无法冒名。
- **薄而有意义**：不做持仓/资金，只做可验证记录。合约接口与实现见 [contracts/src/LPAgentRegistry.sol](../contracts/src/LPAgentRegistry.sol)。

---

## 5. 端到端数据流（一次 Rebalance）

```
1. Monitor   byreal-cli positions/pools -o json  ──▶ 指标
2. Decide    指标 + 配置 ──LLM──▶ 决策对象(reason/newRange/...)
3. Plan      byreal-cli ... --dry-run            ──▶ 预期结果，回灌校验
4. Confirm   (金额/滑点超阈值 → 用户确认)
5. Execute   claim → decrease → swap(zap) → open  (--confirm 由用户执行)
6. Hash      规范化决策 JSON ──keccak256──▶ decisionHash (全文存链下/IPFS)
7. Attest    LPAgentRegistry.recordDecision(...)  ──▶ Mantle Sepolia
8. Render    看板读取链上记录 + 链下全文 ──▶ 可验证展示
```

---

## 6. 仓库结构（规划）

```
.
├── CLAUDE.md
├── README.md
├── docs/
│   ├── toolchain-notes.md      # 事实源（已核实）
│   └── architecture.md         # 本文件
├── contracts/                  # Foundry 项目（Mantle Sepolia 存证合约）
│   ├── foundry.toml
│   ├── src/LPAgentRegistry.sol
│   ├── test/LPAgentRegistry.t.sol
│   └── script/Deploy.s.sol
├── agent/                      # OpenClaw + Byreal Skills 策略 agent (待建)
└── web/                        # React 看板 (待建)
```

---

## 7. Demo / 模拟策略（务实）

- rubric 接受 **"live demo OR meaningful simulation"**。若 Byreal 无 Solana 测试网或需主网真实资金，则：
  - Byreal 侧用 `--dry-run` 产出真实结构的"计划"，或用录制的真实响应做可信模拟；
  - Mantle 侧用**真实的 Sepolia 测试网交易**（无真实资金风险），让"决策上链"是货真价实的链上行为。
- 这样既规避真实资金风险，又保证"链上可验证"这一核心卖点是**真的在链上**。

---

## 8. 开放问题（需确认后回填）

1. **Byreal 是否有 Solana 测试网/devnet？** 决定 §7 的执行环境。（阶段 0 待确认）
2. **byreal-cli 区间参数的确切格式**（tick / 价格 / 倍数？）——以 `byreal-cli catalog show positions` 运行时输出为准，可能需微调 §3.3 与合约 `priceLower/Upper` 的语义/精度。
3. **DoraHacks BUIDL 表单逐字要求**（页面挡抓取，需浏览器核对）。
4. **decisionHash 全文的链下存储**：IPFS / 自建 API / 仅 GitHub？影响"可验证"的强度与 demo 复杂度。
