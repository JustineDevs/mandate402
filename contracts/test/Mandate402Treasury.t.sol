// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Mandate402Treasury} from "../src/Mandate402Treasury.sol";
import {MockERC20Metadata} from "./mocks/MockERC20Metadata.sol";
import {MockPyth} from "./mocks/MockPyth.sol";
import {Test} from "./utils/Test.sol";

contract Mandate402TreasuryTest is Test {
    bytes32 internal constant ETH_USD_FEED_ID =
        0xff61491a931112ddf1bd8147cd1b641375f79f582bb9473d47a502f86ef44195;

    address internal constant GOVERNANCE = address(0xA11CE);
    address internal constant AGENT = address(0xBEEF);
    address internal constant FACILITATOR = address(0xC0FFEE);
    address internal constant STRANGER = address(0xBAD);

    MockPyth internal pyth;
    MockERC20Metadata internal token;
    Mandate402Treasury internal treasury;

    event MandateExecuted(
        address indexed agent,
        address indexed token,
        address indexed facilitator,
        uint256 tokenAmount,
        uint256 usdValue
    );
    event MandateViolated(address indexed agent, string reason);

    function setUp() public {
        pyth = new MockPyth();
        token = new MockERC20Metadata(18);
        treasury = new Mandate402Treasury(GOVERNANCE, address(pyth));

        vm.prank(GOVERNANCE);
        treasury.setMandate(
            AGENT,
            address(token),
            5_000_000,
            600,
            ETH_USD_FEED_ID,
            true
        );

        vm.prank(GOVERNANCE);
        treasury.setApprovedFacilitator(AGENT, FACILITATOR, true);

        pyth.setPrice(
            ETH_USD_FEED_ID,
            2500e8,
            0,
            -8,
            uint64(block.timestamp)
        );
    }

    function testExecuteWithinUsdLimit() public {
        uint256 tokenAmount = 0.001 ether;
        uint256 usdValue = treasury.calculateUsdValue(
            tokenAmount,
            address(token),
            pyth.getPriceNoOlderThan(ETH_USD_FEED_ID, 60)
        );

        vm.expectEmit(true, true, true, true, address(treasury));
        emit MandateExecuted(
            AGENT,
            address(token),
            FACILITATOR,
            tokenAmount,
            usdValue
        );

        bool ok = treasury.executeX402Payment(
            AGENT,
            address(token),
            FACILITATOR,
            tokenAmount
        );

        assertTrue(ok, "payment should be allowed");
    }

    function testRejectsWhenUsdLimitExceeded() public {
        uint256 tokenAmount = 0.003 ether;

        vm.expectEmit(true, true, false, true, address(treasury));
        emit MandateViolated(AGENT, "usd_velocity_limit_exceeded");
        vm.expectRevert(
            abi.encodeWithSelector(
                Mandate402Treasury.FiatVelocityLimitExceeded.selector
            )
        );
        treasury.executeX402Payment(
            AGENT,
            address(token),
            FACILITATOR,
            tokenAmount
        );
    }

    function testRejectsUnapprovedFacilitator() public {
        vm.expectEmit(true, false, false, true, address(treasury));
        emit MandateViolated(AGENT, "facilitator_not_allowlisted");
        vm.expectRevert(
            abi.encodeWithSelector(
                Mandate402Treasury.FacilitatorNotApproved.selector
            )
        );
        treasury.executeX402Payment(
            AGENT,
            address(token),
            address(0xDEAD),
            0.001 ether
        );
    }

    function testKillSwitchBlocksExecution() public {
        vm.prank(GOVERNANCE);
        treasury.setKillSwitch(AGENT, true);

        vm.expectRevert(
            abi.encodeWithSelector(
                Mandate402Treasury.KillSwitchEnabled.selector
            )
        );
        treasury.executeX402Payment(
            AGENT,
            address(token),
            FACILITATOR,
            0.001 ether
        );
    }

    function testWindowResetsAfterDuration() public {
        bool first = treasury.executeX402Payment(
            AGENT,
            address(token),
            FACILITATOR,
            0.001 ether
        );
        assertTrue(first, "first payment should pass");

        vm.warp(block.timestamp + 601);
        pyth.setPrice(
            ETH_USD_FEED_ID,
            2500e8,
            0,
            -8,
            uint64(block.timestamp)
        );

        bool second = treasury.executeX402Payment(
            AGENT,
            address(token),
            FACILITATOR,
            0.001 ether
        );
        assertTrue(second, "window reset should allow second payment");
    }

    function testOnlyGovernanceCanConfigure() public {
        vm.expectRevert(
            abi.encodeWithSelector(Mandate402Treasury.NotGovernance.selector)
        );
        vm.prank(STRANGER);
        treasury.setApprovedFacilitator(AGENT, FACILITATOR, true);
    }
}
