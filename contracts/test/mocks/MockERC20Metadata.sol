// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockERC20Metadata {
    uint8 private immutable _decimals;

    constructor(uint8 decimals_) {
        _decimals = decimals_;
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }
}
