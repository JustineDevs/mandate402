// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MandateRegistry} from "../src/MandateRegistry.sol";
import {Test} from "./utils/Test.sol";

contract MandateRegistryTest is Test {
    event MandateIssued(
        bytes32 indexed mandateId,
        bytes32 indexed specHash,
        address indexed issuer,
        uint64 issuedAt
    );
    event MandateRevoked(
        bytes32 indexed mandateId,
        bytes32 indexed revokeRef,
        address indexed revoker,
        uint64 revokedAt
    );

    bytes32 internal constant MANDATE_ID = keccak256("mandate-402");
    bytes32 internal constant SPEC_HASH = keccak256("spec-hash");
    bytes32 internal constant REVOKE_REF = keccak256("revoke-ref");

    address internal constant OWNER = address(0xA11CE);
    address internal constant STRANGER = address(0xB0B);

    MandateRegistry internal registry;

    function setUp() public {
        registry = new MandateRegistry(OWNER);
    }

    function testIssueMandateStoresAnchorAndEmitsEvent() public {
        vm.expectEmit(true, true, true, true, address(registry));
        emit MandateIssued(MANDATE_ID, SPEC_HASH, OWNER, uint64(block.timestamp));

        vm.prank(OWNER);
        registry.issueMandate(MANDATE_ID, SPEC_HASH);

        MandateRegistry.MandateAnchor memory anchor = registry.getMandate(MANDATE_ID);

        assertEq(uint256(anchor.status), uint256(MandateRegistry.MandateStatus.Active), "status should be active");
        assertEq(anchor.specHash, SPEC_HASH, "spec hash should be stored");
        assertEq(anchor.issuer, OWNER, "issuer should be stored");
        assertEq(uint256(anchor.issuedAt), block.timestamp, "issued timestamp should be stored");
        assertEq(anchor.revoker, address(0), "revoker should be empty before revoke");
        assertEq(uint256(anchor.revokedAt), 0, "revoked timestamp should be empty before revoke");
        assertTrue(registry.isActive(MANDATE_ID), "mandate should be active after issue");
    }

    function testRevokeMandateStoresRevocationAndEmitsEvent() public {
        vm.prank(OWNER);
        registry.issueMandate(MANDATE_ID, SPEC_HASH);

        vm.expectEmit(true, true, true, true, address(registry));
        emit MandateRevoked(MANDATE_ID, REVOKE_REF, OWNER, uint64(block.timestamp));

        vm.prank(OWNER);
        registry.revokeMandate(MANDATE_ID, REVOKE_REF);

        MandateRegistry.MandateAnchor memory anchor = registry.getMandate(MANDATE_ID);

        assertEq(uint256(anchor.status), uint256(MandateRegistry.MandateStatus.Revoked), "status should be revoked");
        assertEq(anchor.revokeRef, REVOKE_REF, "revoke reference should be stored");
        assertEq(anchor.revoker, OWNER, "revoker should be stored");
        assertEq(uint256(anchor.revokedAt), block.timestamp, "revoked timestamp should be stored");
        assertFalse(registry.isActive(MANDATE_ID), "mandate should not remain active after revoke");
    }

    function testIssueMandateRevertsForUnauthorizedCaller() public {
        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.Unauthorized.selector));
        vm.prank(STRANGER);
        registry.issueMandate(MANDATE_ID, SPEC_HASH);
    }

    function testRevokeMandateRevertsForUnauthorizedCaller() public {
        vm.prank(OWNER);
        registry.issueMandate(MANDATE_ID, SPEC_HASH);

        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.Unauthorized.selector));
        vm.prank(STRANGER);
        registry.revokeMandate(MANDATE_ID, REVOKE_REF);
    }

    function testIssueMandateRevertsWhenAlreadyIssued() public {
        vm.prank(OWNER);
        registry.issueMandate(MANDATE_ID, SPEC_HASH);

        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.MandateAlreadyIssued.selector, MANDATE_ID));
        vm.prank(OWNER);
        registry.issueMandate(MANDATE_ID, SPEC_HASH);
    }

    function testRevokeMandateRevertsWhenMandateWasNeverIssued() public {
        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.MandateNotIssued.selector, MANDATE_ID));
        vm.prank(OWNER);
        registry.revokeMandate(MANDATE_ID, REVOKE_REF);
    }

    function testRevokeMandateRevertsWhenAlreadyRevoked() public {
        vm.prank(OWNER);
        registry.issueMandate(MANDATE_ID, SPEC_HASH);

        vm.prank(OWNER);
        registry.revokeMandate(MANDATE_ID, REVOKE_REF);

        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.MandateAlreadyRevoked.selector, MANDATE_ID));
        vm.prank(OWNER);
        registry.revokeMandate(MANDATE_ID, REVOKE_REF);
    }

    function testConstructorRevertsForZeroOwner() public {
        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.InvalidOwner.selector));
        new MandateRegistry(address(0));
    }
}
