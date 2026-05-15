// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Mandate402Treasury} from "../src/Mandate402Treasury.sol";

interface Vm {
    function envAddress(string calldata key) external returns (address);
    function envUint(string calldata key) external returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

address constant VM_ADDRESS = address(
    uint160(uint256(keccak256("hevm cheat code")))
);
Vm constant vm = Vm(VM_ADDRESS);

contract DeployMandate402TreasuryScript {
    function run() external returns (Mandate402Treasury treasury) {
        address governanceOwner = vm.envAddress("MANDATE402_GOVERNANCE_OWNER");
        address pythOracle = vm.envAddress("MANDATE402_PYTH_ORACLE_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("MANDATE402_DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        treasury = new Mandate402Treasury(governanceOwner, pythOracle);
        vm.stopBroadcast();
    }
}
