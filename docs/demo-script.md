# Demo 视频脚本（目标 2:00–2:15）

> 语言：中文配音 + **全程英文字幕**（全球评审，1:10 高潮的"为什么重要"必须让看不懂中文的评委也能 get）。
> 提交只需「demo video」，rubric 接受 **"live demo OR meaningful simulation"**——本片以**可离线运行的真实代码**演示，Byreal 侧为模拟、Mantle 侧为**可部署的真实合约**（详见末尾「诚实标注」）。

---

## 一句话主线

> "让 AI 替你管理集中流动性做市仓位，而它的每一个决策，任何人都能直接从链上重算验证。"

---

## 分镜脚本

| 时间 | 画面 | 旁白（中文） / 字幕（英文） |
| --- | --- | --- |
| **0:00–0:08** ❄️冷开场（先抛高潮） | 直接给核验弹窗特写：点一下，keccak256 重算 → **双绿** | "一键证明：这个 AI 的链上决策没被伪造。"<br>*EN: "Prove an AI's on-chain decision wasn't faked — in one click."* |
| **0:08–0:22** 痛点 | LP 区间图：价格滑出区间，手续费停摆、无常损失扩大 | "在 DeFi 做市，价格一滑出你设的区间，就停止赚手续费、还在亏无常损失——可没人能 24 小时盯盘。"<br>*EN: "When price leaves your range, fees stop and IL grows — and nobody can watch 24/7."* |
| **0:22–0:38** 是什么 + 架构 | 标题卡 RangeClaw + 架构图（含 **✗ 不链上互调** 标记） | "RangeClaw 是跑在 Byreal 上的 AI 做市管家。它把每个决策锚定到 Mantle——Byreal 在 Solana 执行，Mantle 是验证层，我们绝不谎称 Byreal 在 Mantle 上。"<br>*EN: "Byreal executes on Solana; Mantle is the verification layer — never claimed otherwise."* |
| **0:38–0:58** Agent 决策（紧凑 ~20s） | 终端 `npm run demo`，**只高亮** DECISION 行 + decisionHash/boundHash 行，其余滚过 | "看它工作一次：监控到现价跌破区间——离场了。**动作由确定性规则引擎给出**、可审计；**AI 只负责生成理由**。然后产出 decisionHash、boundHash 和上链的 recordDecision 调用。"<br>*EN: "Rules pick the action (auditable); the LLM only explains. Out come the hashes + the on-chain call."* |
| **0:58–1:43** ★核心：当场核验（全片重心 ~45s） | 看板决策流 → 每行 `✓ bound` → 点「核验」→「重算 keccak256」→ 双绿 → **故意改一个字段→变红→改回→变绿** | "重点来了。每行的 `✓ bound` 是用**合约同款派生函数**、仅凭这一行的索引字段重算的——证明它不能被张冠李戴。点核验、重算决策全文的哈希——和记录里完全一致。**我故意改一个字——立刻变红；改回——又变绿。** 绿灯是真在校验，不是摆设。"<br>*EN: "boundHash recomputed with the contract's own formula. Tamper one field → RED. Revert → GREEN. The check is real."* |
| **1:43–1:58** 集成（~15s） | 一镜：Byreal 仓库 + `npx skills add byreal-git/byreal-agent-skills` 字幕；若已部署，闪一下 Mantle Sepolia 合约地址 + 一条 `DecisionRecorded` 交易 | "底层用 Byreal 官方 Skills CLI 读取 Solana 上的 CLMM；调仓走 dry-run 计划。Mantle 上的合约是独立的可验证账本。"<br>*EN: "Built on Byreal Skills CLI (reads Solana CLMM); rebalance as a dry-run plan."* |
| **1:58–2:10** 收尾（~12s） | 看板全景 + 一句话定位卡 | "真实的用户、真实的 Byreal 集成路径、每一步都可被任何人核验。RangeClaw。"<br>*EN: "Verifiable AI market-making. RangeClaw."* |

---

## 录制要点

1. **0:38 终端段**：提前 `npm run demo` 跑好用真实输出；demo.ts 已固定 `now/nonce`，哈希可复现。
2. **0:58 核验段是全片高潮**，给足时间、可慢放。**关键：不要手敲 JSON**——用弹窗里预填的 canonical 文本原样核验（或点「复制决策 JSON」按钮），避免空格/换行漂移导致镜头里变红。
3. **务必拍"篡改→变红→改回→变绿"**：评委天然怀疑"被做绿的绿灯"，能证明它会红，绿灯才可信。
4. **0:58 段在 DEMO 模式即可演示**（mock 行的哈希是用同源函数真实算出的）；若已部署合约，可切 LIVE 模式连测试网读真链，效果一致。
5. 全程**不要**出现"Byreal 部署在 Mantle""真实主网资金交易""AI 在链上推理"等措辞。

---

## 诚实标注（团队自查，勿放进视频）

- ✅ **真实**：合约逻辑与 34 个测试（已审查）、agent/合约/看板三处哈希派生逐字节同源、看板核验流程。
- 🟡 **待执行**：部署 `LPAgentRegistry` 到 Mantle Sepolia 并回填地址、链上 `recordDecision` 存证（脚本就绪，签名广播由作者本人执行）；Byreal 真实字段映射与 `--confirm` 下单待在真实环境接线。
- 🟡 **模拟**：demo 中 Byreal 现货/调仓走 `--dry-run`/mock；attestor 默认离线 `prepare`（rubric 接受 meaningful simulation）。
- ⛔ **不声称**：Byreal 在 Mantle 上；AI 在链上推理；真实资金已自动交易；手续费已实际收取（`feesClaimed` 为决策时未领额快照）。
