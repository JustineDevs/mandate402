// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPyth} from "../../src/interfaces/IPyth.sol";

contract MockPyth is IPyth {
    Price private _price;
    bytes32 private _expectedId;

    function setPrice(
        bytes32 feedId,
        int64 price,
        uint64 conf,
        int32 expo,
        uint64 publishTime
    ) external {
        _expectedId = feedId;
        _price = Price({
            price: price,
            conf: conf,
            expo: expo,
            publishTime: publishTime
        });
    }

    function getPriceNoOlderThan(
        bytes32 id,
        uint256 age
    ) external view returns (Price memory price) {
        require(id == _expectedId, "unexpected feed id");
        require(block.timestamp - _price.publishTime <= age, "stale price");
        return _price;
    }
}
