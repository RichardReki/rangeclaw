# 发布清单 SUBMISSION.md

> **硬截止：2026-06-15 15:59 UTC**（不是当日 23:59，提前一天交）。
> 图例：🧑 = 只有你能做（钱包/账号/镜头）；🤖 = Claude 能帮做；✅ = 检查点。

## 状态总览

```
✅ 代码全部写完 + 本地测试全绿（合约 34 / agent 21 / web 8）
✅ 文案 README / demo 脚本 / pitch
✅ GitHub 仓库  https://github.com/RichardReki/rangeclaw
✅ ② 合约已部署 + 链上核验  0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF
✅ ③ 地址已回填（README + web/.env.local）
✅ ④ 真实决策已上链 + boundHash 独立复算一致（decisionCount=1）
✅ ⑤ Vercel LIVE 站  https://rangeclaw.vercel.app
⬜ ⑥ 录视频   ← 你在这里   ⬜ ⑦ 核对 DoraHacks 表单   ⬜ ⑧ 提交
```

---

## ② 部署合约到 Mantle Sepolia 🧑

> 为什么是你做：要用你掌握的签名私钥；Claude 不接触任何私钥（CLAUDE.md §7）。

**A. 建 burner 钱包**
- [ ] 装 MetaMask → 新建一个账户命名 `burner`（别用装真钱的账户）
- [ ] 账户 → ⋮ → 账户详情 → 显示私钥 → 复制存好
- [ ] 复制该账户地址
- ✅ 手上有 `地址(0x..)` + `私钥(0x..)`，余额 0

**B. 加 Mantle Sepolia 网络**（MetaMask 手动添加，别选内置以太坊 Sepolia）

| 字段 | 值 |
| --- | --- |
| 网络名 | Mantle Sepolia |
| RPC URL | `https://rpc.sepolia.mantle.xyz` |
| Chain ID | `5003` |
| 货币符号 | `MNT` |
| 浏览器 | `https://explorer.sepolia.mantle.xyz` |

- ✅ MetaMask 切到 Mantle Sepolia，显示 `0 MNT`

**C. 领测试币**
- [ ] [faucet.sepolia.mantle.xyz](https://faucet.sepolia.mantle.xyz/) 填地址 drip（备用：[QuickNode](https://faucet.quicknode.com/mantle/sepolia) / [HackQuest](https://www.hackquest.io/faucets/5003)）
- ✅ 余额 `> 0 MNT`

**D. 部署**（PowerShell 逐行；把私钥换成你的）
```powershell
$env:Path = "C:\Users\34042\rcw-tools\foundry;" + $env:Path
cd "f:\Hacks\新建文件夹\contracts"
$env:PRIVATE_KEY = "0x你的burner私钥"
forge script script/Deploy.s.sol:Deploy --rpc-url https://rpc.sepolia.mantle.xyz --broadcast
```
- 报 gas/EIP-1559 错就末尾加 `--legacy` 重试；不需要 `--verify`
- ✅ 输出 `LPAgentRegistry deployed at: 0x...`

**E. 把 `0x...` 地址发给 Claude** → 进入 ③

---

## ③ 回填合约地址 🤖 ✅ 已完成
- [x] 填入 [README](README.md) "已部署合约"表 → `0x15803Afbb3Eb5c6Ea71AaED89af55dE719F5F5BF`
- [x] 填入 `web/.env.local` 的 `VITE_REGISTRY_ADDRESS`（看板可切 LIVE）

## ④ 让 agent 写真实决策上链 🧑 ✅ 已完成 + 链上核验
- `npm run record`（agent/.env 设 `ENABLE_ONCHAIN_WRITE=true` + burner 私钥）→ registerAgent + recordDecision。
- 链上核验（`cast`）：`decisionCount=1`、记录 #0 = Rebalance、agentId=1。
- decisionHash `0x59eab72b…a2c0`；boundHash `0x1f46f12a…efd8` —— 用合约同款公式从链上字段**独立重算一致**，证明 合约=agent=看板 三处哈希派生完全对齐。
- recordDecision tx `0x1a4262d1…e39b7`（Success）。

## ⑤ Vercel 部署（公开 URL，非 localhost）🧑 ✅ 已上线 https://rangeclaw.vercel.app
- [ ] [vercel.com](https://vercel.com) → New Project → 导入 `RichardReki/rangeclaw`
- [ ] **Root Directory** 设为 `web`；Framework 自动识别 Vite；Build `npm run build`；Output `dist`
- [ ] 环境变量：`VITE_REGISTRY_ADDRESS=<②的地址>`、`VITE_RPC_URL=https://rpc.sepolia.mantle.xyz`、`VITE_CHAIN_ID=5003`
- [ ] Deploy → 记下公开 URL
- ✅ 打开 URL，看板 LIVE 模式显示链上决策（或 DEMO 模式可用）

## ⑥ 录 demo 视频 🧑
- [ ] 照 [docs/demo-script.md](docs/demo-script.md)，~2:10，**务必拍"篡改→变红→改回→变绿"**
- [ ] 核验段用弹窗里的"复制决策 JSON"按钮，别手敲（防镜头里误变红）
- [ ] 英文字幕（全球评审）

## ⑦ 核对 DoraHacks BUIDL 表单 🧑
- [ ] 浏览器开 [hackathon 页](https://dorahacks.io/hackathon/mantleturingtesthackathon2026)，逐字核对提交字段要求

## ⑧ 提交 🧑（截止 2026-06-15 15:59 UTC）
- [ ] DoraHacks / HackQuest 报名 + 提交 BUIDL
- [ ] X 发 `#MantleAIHackathon` Thread，含：pitch + demo 视频 + GitHub 链接 + **Mantle 合约地址** + 看板 URL
- 草稿可让 Claude 写（见 pitch [docs/pitch.md](docs/pitch.md)）

---

## 安全须知
- 私钥只填进**你自己终端的环境变量**或 `.env`（已 gitignore）；永不粘聊天、永不提交。
- 用 burner 钱包，零真实资金。
- 部署签名广播、Vercel/GitHub/X/DoraHacks 账号操作，均由你本人完成。
