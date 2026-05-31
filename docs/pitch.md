# Pitch / 路演稿

> 面向 The Turing Test Hackathon 2026 · Phase 2 · Track 06 Agentic Economy（Byreal）。

---

## 一句话（提交用）

**RangeClaw：一个替你管理 Byreal 集中流动性的 AI 做市管家——它的每一个调仓决策，任何人都能直接从链上重算验证。**

英文备用：*RangeClaw — an AI agent that manages your Byreal concentrated-liquidity positions; every decision is independently re-verifiable from chain data.*

---

## 电梯陈述（30 秒，情绪 → 承诺 → 一句机制）

你会让一个 AI 替你动钱吗——如果你没法检查它到底做了什么？RangeClaw 让**任何人都能直接从区块链重新验证它的每一个决策**：你信任它，是因为你能亲自核对，而不是因为我们这么说。机制只需一句：每个决策都在 Mantle 上留下可重算的承诺。它替没空盯盘的 LP 自动监控、调仓、收费——而每一步都经得起核验。

---

## 痛点 → 方案

| 痛点 | RangeClaw |
| --- | --- |
| CLMM 集中流动性需要持续盯盘调仓，普通人做不到 | AI agent 自动监控价格区间、无常损失、手续费，按策略调仓 |
| "AI 帮我理财"难以信任，怕黑箱乱操作 | 动作由**确定性规则**决定（可审计），LLM 只负责解释；每个决策生成可上链承诺 |
| 链上"AI 做了什么"无法验证 | `decisionHash` + `boundHash` 双重承诺，**任何人可重算核验**，防篡改、防张冠李戴 |

## ★ Proof（别信我们，自己验）

> 这是全场最该记住的一句：**别听我们说——在 demo 里，你（评审）点一个按钮，就能从链上数据亲手重算出那个哈希；on-chain == off-chain，当场。这才叫可验证的 AI，不是口号。**

具体可验：① `boundHash` 仅凭一行的索引字段即可重算，证明它没被张冠李戴；② `decisionHash` 由决策全文重算 keccak256，证明全文没被篡改。两个都是纯函数，谁都能跑（见 `web/src/verify.ts`）。

---

## 它怎么工作（30 秒讲清架构）

```
用户 → AI Agent（OpenClaw = agent 运行时 + Byreal Skills）
        Monitor → Decide(规则+LLM) → Execute(Byreal/Solana) → Attest(Mantle)
        │ byreal-cli (Solana)                         │ viem (EVM)
        ▼                                             ▼
   Byreal CLMM (Solana)  ──✗ 不链上互调 / no on-chain call──  LPAgentRegistry (Mantle)
```

- **集成 Byreal = 链下 agent 层**：用官方点名的 Byreal Skills CLI（`@byreal-io/byreal-cli`）读取 Solana 上的 CLMM 池/仓位；调仓/收费/swap 生成 dry-run 执行计划。
- **Mantle 合约 = 独立可验证账本**：只存决策承诺，**不持仓、不托管、不调用 Byreal**。默认离线生成 calldata，链上广播需显式开启。
- **诚实跨链**：Byreal 在 Solana、Mantle 是验证层，两者由 agent 串联，绝不谎称 Byreal 在 Mantle 上。

---

## 差异化（为什么记得住）

1. **可审计的 AI**：调仓"做什么"由确定性规则决定、可复现；LLM 只解释"为什么"——避免"AI 黑箱"质疑。
2. **可独立重算的决策账本**：业界多是"把 AI 行为记到链上"；我们更进一步——**任何人能仅凭链上数据重新推导出决策的承诺哈希（boundHash 防重放），而不只是"记了一笔"**。
3. **诚实的跨链架构**：不夸大、不踩"Byreal 在 Mantle"的坑，技术叙事经得起追问。

---

## 幻灯片大纲（8 页）

1. **封面**：RangeClaw · 一句话定位 · Track 06。
2. **痛点**：CLMM 做市要盯盘 / 出区间即亏 / AI 理财难信任。
3. **方案 + Proof**：AI 做市管家 + "点一下自己验"的承诺（一张图 + 一句"别信我们，自己验"）。
4. **架构**：bridge-not-call（Solana 执行 / Mantle 验证，含 ✗ 标记）。
5. **现场核验**（录屏）：篡改→变红→改回→双绿——**全场最强一页**。
6. **Byreal 集成深度**：byreal-cli 读取池/仓位 + 调仓/收费/swap 的 dry-run 计划。
7. **为什么赢 Track 06**：rubric 逐条映射（见下表）。
8. **路线图 + 收尾**：接真实 Byreal 执行 / 配 Solana 交易签名做端到端证明 / 多池多策略。

---

## 为什么能赢 Track 06（rubric 逐条映射）

> 评审 100 分 = 通用 50 + 赛道专属 50（来源见 [toolchain-notes.md](toolchain-notes.md)）。通用分值为官方；**赛道专属 50 的拆分是团队自评映射**，非官方逐项权重。

**通用 50（claim + proof）**

| 维度 | 分 | 论证（不只是断言） |
| --- | --- | --- |
| Technical | 15 | 合约 34 测试 + `boundHash` 防重放；agent/合约/看板哈希逐字节同源（见三处顶部同步守卫） |
| Ecosystem fit（Mantle） | 10 | **核心是 Byreal Skills CLI 集成深度**（监控/调仓/收费/swap 命令链路）；Mantle 合约作为存证层，提交前部署回填地址 |
| Business potential | 10 | 用户=Byreal CLMM 上的被动 LP；切口=价格一出区间就漏赚手续费；变现=按调仓收绩效费 |
| Innovation | 10 | 首个让自主 agent 的决策**仅凭链上数据即可独立重新验证**（boundHash 防重放），而非"仅记录" |
| UX | 5 | 深色看板 + 一键核验 + DEMO 零配置可演示 |

**赛道专属 50（团队自评估算）**

| 维度 | 自评 | 论证 |
| --- | --- | --- |
| 透明性 / 可验证性 | ~20 | **最强项**：双哈希承诺 + 当场可重算；契合"图灵测试"Human-vs-AI 主题精神 |
| 策略合理性 | ~10 | 出区间/IL/近边/手续费分级触发，确定性可复现可审计 |
| 现实影响 | ~10 | 真实 Byreal Skills CLI 集成路径，目标用户清晰 |
| Demo 质量 | ~10 | 可离线运行的端到端 demo + 当场核验（含篡改演示） |

---

## 可能被评委追问 & 应答

- **"Byreal 不是在 Solana 吗？你怎么部署 Mantle？"** → 正中要害。bridge-not-call：Byreal 在 Solana 执行，Mantle 合约是独立验证账本，两者由 agent 串联——我们从不声称 Byreal 在 Mantle。
- **"你的决策引擎是确定性规则——那 AI 在哪？if 语句不算 agent。"** → 这是特性不是短板：agent 自主完成监控、选策略、生成解释；我们**刻意**把"动钱的动作"约束在可审计的规则内——这正是"可信 agent"的论点，而非局限。LLM 负责理解与解释，规则负责安全。
- **"你的 demo 是 mock/dry-run——Byreal 根本没真交易，哪部分是真的？"** → 主动交代：合约、哈希一致性、核验流程、Mantle 部署是真的；Byreal 执行是 meaningful simulation，rubric 明确允许。真实下单是接线工作，非架构缺口。
- **"谁都能往 Mantle 写任意哈希——你证明的是记录没被改，不是决策好、也不是真在 Solana 执行了。你验的是一个声明，不是结果。"** → 最锋利、诚实接住：我们验证的是**决策记录的完整性与不可抵赖**；把它与 Solana 交易签名配对做"决策→执行"端到端证明，是路线图下一步。承认边界 + 给路线，胜过沉默。
- **"20×$1000 是保底吗？"**（团队内部认知）→ 不是，是 Top 20 决赛+部署双门槛；现实主目标是赛道一等奖。
