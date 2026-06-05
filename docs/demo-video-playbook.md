# Demo 视频实战手册：怎么让它抓住评委

> 配套 [demo-script.md](demo-script.md)（分镜）。这份讲**怎么拍才让评委记住、给分**——craft，不是流水账。
> 目标时长 **2:00–2:10**。语言：英文配音 + **全程英文字幕**（全球评审）。

---

## 0. 先记死一件事：评委是怎么看 demo 的

- 他们一口气看**几十上百个** demo，常 1.5–2× 倍速、边看边跳。**注意力是最稀缺资源。**
- 他们手里有**评分表**——你视频的每一秒，都该对应某个能给分的点。
- **前 10 秒决定**他们是认真看还是划走。
- 他们**见过太多 vaporware**，天生怀疑。**证据 > 说辞。** 你能当场证明的东西，价值是别人吹的十倍。

> 一句话方针：**把最强的证据放在最前面，每一秒都映射到评分表，全程让评委"看见"而不是"听你说"。**

---

## 1. 我们唯一的杀手锏：现场可验证（必须前置、做满）

绝大多数对手**做不出**"点一下、当场重算哈希、链上==链下、双绿"这种东西。这是你最大的记忆点和最高的"透明可验证"得分项。

两条铁律：
1. **把核验放到第 0 秒**（冷开场就抛),别埋到 1 分钟后。
2. **一定要演"篡改→变红→改回→变绿"**——评委天然怀疑"被做绿的绿灯";你**证明它会红**,绿灯才可信。这一下是整片的信任之锚。

---

## 2. 抓人版分镜（2:00–2:10，逐镜带旁白 + 给分）

| 时间 | 画面 | 英文旁白 / 字幕 | 挣哪类分 |
|---|---|---|---|
| **0:00–0:07** ❄️冷开场 | 核验弹窗特写：点验证 → keccak 重算 → **双绿**；紧接故意改一个字符 → **变红** → 改回 → **绿** | *"Watch me prove an AI's on-chain decision wasn't faked — in one click. Tamper one field: red. Revert: green."* | demo质量 + 透明可验证（最强）|
| **0:07–0:20** 痛点（短！）| LP 区间图：价格滑出区间、手续费停、IL 扩大 | *"In DeFi market-making, the moment price leaves your range you stop earning and bleed impermanent loss — and nobody watches 24/7."* | 现实影响 |
| **0:20–0:33** 是什么 + 架构 | 标题卡 + bridge-not-call 图（**带 ✗ 不链上互调**）| *"RangeClaw is an AI agent that manages your Byreal positions and anchors every decision on Mantle. Byreal runs on Solana; Mantle is the verification layer — we never fake that."* | 创新 + 技术诚实 |
| **0:33–0:50** 决策（紧凑 ~17s）| 终端 `npm run demo`，**只高亮** DECISION 行 + decisionHash/boundHash 行，其余滚过 | *"It sees the position is out of range. A deterministic engine picks the action — rebalance — so it's auditable; the LLM only explains why. Out comes a decision hash and the on-chain call."* | 创新 + 技术 + 策略合理 |
| **0:50–1:35** ★核验（全片重心 ~45s）| **LIVE 看板**：真链记录 → 点核验 → 粘 canonical JSON → `decisionHash ✓` + `boundHash ✓` → 再演 **篡改→红→改回→绿** | *"Here's a real decision, live from Mantle. Anyone recomputes its hash from chain data — on-chain equals off-chain. And it's no rigged green: tamper, red; fix, green. Verifiable AI, not a slogan."* | 透明可验证(拉满) + demo质量 |
| **1:35–1:50** 真链证据 | 点开 **Mantlescan**：合约 `0x15803…F5BF` + `recordDecision` 交易 **Success** | *"Real contract, real transaction on Mantle Sepolia. Here's the tx."* | 技术 + Mantle生态 + 反vaporware |
| **1:50–2:05** 收尾 | 看板全景 + 链接卡（看板/GitHub/合约 + Track 06 + #MantleAIHackathon）| *"Real users, a real Byreal integration path, every step verifiable. RangeClaw."* | 收束 |

---

## 3. 让它"抓人"的 10 个具体技巧

1. **冷开场前置高潮**：先给"双绿 + 篡改变红"，再讲痛点。给 1 分钟的核验留个回扣（"记得开头那一下？这就是它怎么做到的"）。
2. **演，别说**：真实录屏 > 任何 PPT。核验那一下慢放、放大结果区。
3. **篡改→红→改回→绿**：信任之锚，必拍（见 §1）。
4. **照着评分表的词说话**：把评委要打分的词喊出来——*verifiable / tamper-evident / anyone can recompute / deployed on Mantle / auditable*。
5. **亮真链证据**：真合约地址 + 真 tx，"this is a real transaction on Mantle"。具体 > 抽象。
6. **诚实当卖点**：一句话坦白真/模拟——*"Byreal execution is simulated per the rules; the Mantle attestation and verification are real."* 这反而消解评委"是不是假的"的疑心。
7. **狠剪废镜头**：不读每行终端、不慢滚。只高亮关键行，字幕补强。
8. **英文字幕烧进去**：尤其 0:50–1:35 高潮段，让看不懂中文的评委也 get。
9. **画面干净**：深色看板本身好看——全屏、核验结果区放大、鼠标点击有视觉反馈。
10. **结尾一句话 + 链接卡**：留下记忆点和可点的链接，别拖沓。

---

## 4. 必须避开的 7 个坑

1. ❌ 开头花 30 秒讲"DeFi 很难"——每个 LP 项目都这么开，评委秒划走。
2. ❌ 慢慢滚动 / 逐行读终端——最催眠的拍法，还正好在高潮前。
3. ❌ **夸大**："fully autonomous AI trading live on Mantle"——假的，评委一眼识破，全片信誉崩。守住 bridge-not-call + 真/模拟标注。
4. ❌ 把核验埋到后半段——最强的东西必须最前。
5. ❌ 没声音 / 念稿般的平淡旁白——清晰、有节奏的口播比画质更重要。
6. ❌ 超过 3 分钟——评委没耐心；2 分出头最佳。
7. ❌ 演 localhost / "在我机器上能跑"——演**部署好的 LIVE 站 + 真 tx**，证明它是真的活着的。

---

## 5. 评分表映射（每段挣哪些分，录的时候心里有数）

| 视频段落 | 主要挣分项 |
|---|---|
| 冷开场 + 核验高潮 | **透明性/可验证性**（赛道核心）+ **demo 质量** |
| LIVE 站 + 真 tx | 技术(15) + Mantle 生态契合(10) + 反 vaporware |
| "规则决策 + LLM 解释" | 创新(10) + 可审计 AI 的论点 |
| bridge-not-call 诚实 | 技术可信度（经得起评委追问）|
| 看板 UI | 体验(5) |

---

## 6. 录制实操 tips

- **工具**：OBS / 任意录屏 + **一个清楚的麦**（音频清晰 > 画质高）；找个安静房间。
- **缩放**：终端/看板放到笔记本上也看得清的字号（评委多在笔记本上看）。
- **核验段**：用弹窗里的 **"复制决策 JSON"按钮**贴入（别手敲，防空格漂移变红）；然后**改一个字符**演红、改回演绿。
- **真链段**：用部署好的 [LIVE 站](https://rangeclaw.vercel.app) + [Mantlescan 合约页](https://explorer.sepolia.mantle.xyz/address/0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF)。
- **预跑**：录前先 `npm run demo` 跑好,输出现成。
- **多录几条取最紧的那条**；字幕后期加（英文）。
- **导出**：1080p 即可，控制在 2 分出头。

---

## 一句话

**前 7 秒抛出"点一下证明 AI 没造假 + 篡改变红"，中段把它在真链上完整复演一遍,亮出真 tx，全程英文字幕、不夸大。** 这样录,你那个别人做不出的"现场可验证"就成了评委记得住、给得了分的记忆点。
