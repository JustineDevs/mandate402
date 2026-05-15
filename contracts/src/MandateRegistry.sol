// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MandateRegistry {
    error InvalidOwner();
    error Unauthorized();
    error MandateAlreadyIssued(bytes32 mandateId);
    error MandateNotIssued(bytes32 mandateId);
    error MandateAlreadyRevoked(bytes32 mandateId);

    enum MandateStatus {
        Unissued,
        Active,
        Revoked
    }

    struct MandateAnchor {
        bytes32 specHash;
        bytes32 revokeRef;
        address issuer;
        address revoker;
        uint64 issuedAt;
        uint64 revokedAt;
        MandateStatus status;
    }

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

    address public immutable owner;

    mapping(bytes32 mandateId => MandateAnchor anchor) private _mandates;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address owner_) {
        if (owner_ == address(0)) revert InvalidOwner();
        owner = owner_;
    }

    function issueMandate(bytes32 mandateId, bytes32 specHash) external onlyOwner {
        MandateAnchor storage anchor = _mandates[mandateId];

        if (anchor.status != MandateStatus.Unissued) {
            revert MandateAlreadyIssued(mandateId);
        }

        anchor.specHash = specHash;
        anchor.issuer = msg.sender;
        anchor.issuedAt = uint64(block.timestamp);
        anchor.status = MandateStatus.Active;

        emit MandateIssued(mandateId, specHash, msg.sender, anchor.issuedAt);
    }

    function revokeMandate(bytes32 mandateId, bytes32 revokeRef) external onlyOwner {
        MandateAnchor storage anchor = _mandates[mandateId];

        if (anchor.status == MandateStatus.Unissued) {
            revert MandateNotIssued(mandateId);
        }
        if (anchor.status == MandateStatus.Revoked) {
            revert MandateAlreadyRevoked(mandateId);
        }

        anchor.revokeRef = revokeRef;
        anchor.revoker = msg.sender;
        anchor.revokedAt = uint64(block.timestamp);
        anchor.status = MandateStatus.Revoked;

        emit MandateRevoked(mandateId, revokeRef, msg.sender, anchor.revokedAt);
    }

    function getMandate(bytes32 mandateId) external view returns (MandateAnchor memory) {
        return _mandates[mandateId];
    }

    function statusOf(bytes32 mandateId) external view returns (MandateStatus) {
        return _mandates[mandateId].status;
    }

    function isActive(bytes32 mandateId) external view returns (bool) {
        return _mandates[mandateId].status == MandateStatus.Active;
    }
}
