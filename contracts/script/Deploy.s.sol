// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {LPAgentRegistry} from "../src/LPAgentRegistry.sol";

/// @notice Deploys LPAgentRegistry to Mantle Sepolia (chainId 5003).
///
/// ⚠️ 部署的签名与广播由你本人执行（见 CLAUDE.md 第 7 节）。本脚本只准备交易。
///
/// 运行（由你本人执行）：
///   export PRIVATE_KEY=0x...            # 你的测试网部署私钥（切勿提交）
///   export MANTLE_SEPOLIA_RPC_URL=...   # 见 https://chainlist.org/chain/5003
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url mantle_sepolia --broadcast
///
/// 部署完成后，把输出的合约地址填入 README 的 "已部署合约" 一节，
/// 并用于 X Thread 提交所需的 "Mantle contract address" 字段。
contract Deploy is Script {
    function run() external returns (LPAgentRegistry registry) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        registry = new LPAgentRegistry();
        vm.stopBroadcast();

        console2.log("LPAgentRegistry deployed at:", address(registry));
        console2.log("owner:", registry.owner());
    }
}
