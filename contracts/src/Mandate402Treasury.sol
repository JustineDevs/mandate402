// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20Minimal} from "./interfaces/IERC20Minimal.sol";
import {IPyth} from "./interfaces/IPyth.sol";

contract Mandate402Treasury {
    error NotGovernance();
    error InvalidGovernance();
    error InvalidOracle();
    error InvalidPrice();
    error InactiveMandate();
    error KillSwitchEnabled();
    error FacilitatorNotApproved();
    error FiatVelocityLimitExceeded();

    struct AgentMandate {
        uint256 maxUsdSpendPerWindow;
        uint256 currentWindowUsdSpent;
        uint256 windowResetTime;
        uint256 windowDuration;
        bytes32 pythPriceFeedId;
        bool isActive;
    }

    address public governanceOwner;
    IPyth public immutable pythOracle;
    uint256 public constant USD_DECIMALS = 1e6;
    uint256 public constant MAX_PRICE_AGE_SECONDS = 60;

    mapping(address agent => bool enabled) public killSwitches;
    mapping(address agent => mapping(address token => AgentMandate)) public mandates;
    mapping(address agent => mapping(address facilitator => bool approved))
        public approvedFacilitators;

    event GovernanceTransferred(
        address indexed previousGovernance,
        address indexed newGovernance
    );
    event MandateConfigured(
        address indexed agent,
        address indexed token,
        uint256 maxUsdSpendPerWindow,
        uint256 windowDuration,
        bytes32 pythPriceFeedId,
        bool isActive
    );
    event FacilitatorApprovalUpdated(
        address indexed agent,
        address indexed facilitator,
        bool approved
    );
    event KillSwitchUpdated(address indexed agent, bool enabled);
    event MandateExecuted(
        address indexed agent,
        address indexed token,
        address indexed facilitator,
        uint256 tokenAmount,
        uint256 usdValue
    );
    event MandateViolated(address indexed agent, string reason);

    modifier onlyGovernance() {
        if (msg.sender != governanceOwner) revert NotGovernance();
        _;
    }

    constructor(address governanceOwner_, address pythOracleAddress_) {
        if (governanceOwner_ == address(0)) revert InvalidGovernance();
        if (pythOracleAddress_ == address(0)) revert InvalidOracle();

        governanceOwner = governanceOwner_;
        pythOracle = IPyth(pythOracleAddress_);
    }

    function transferGovernance(address newGovernance) external onlyGovernance {
        if (newGovernance == address(0)) revert InvalidGovernance();
        emit GovernanceTransferred(governanceOwner, newGovernance);
        governanceOwner = newGovernance;
    }

    function setMandate(
        address agent,
        address token,
        uint256 maxUsdSpendPerWindow,
        uint256 windowDuration,
        bytes32 pythPriceFeedId,
        bool isActive
    ) external onlyGovernance {
        AgentMandate storage mandate = mandates[agent][token];
        mandate.maxUsdSpendPerWindow = maxUsdSpendPerWindow;
        mandate.windowDuration = windowDuration;
        mandate.windowResetTime = block.timestamp + windowDuration;
        mandate.pythPriceFeedId = pythPriceFeedId;
        mandate.isActive = isActive;

        emit MandateConfigured(
            agent,
            token,
            maxUsdSpendPerWindow,
            windowDuration,
            pythPriceFeedId,
            isActive
        );
    }

    function setApprovedFacilitator(
        address agent,
        address facilitator,
        bool approved
    ) external onlyGovernance {
        approvedFacilitators[agent][facilitator] = approved;
        emit FacilitatorApprovalUpdated(agent, facilitator, approved);
    }

    function setKillSwitch(address agent, bool enabled) external onlyGovernance {
        killSwitches[agent] = enabled;
        emit KillSwitchUpdated(agent, enabled);
    }

    function executeX402Payment(
        address agent,
        address token,
        address facilitator,
        uint256 tokenAmount
    ) external returns (bool) {
        AgentMandate storage mandate = mandates[agent][token];

        if (!mandate.isActive) revert InactiveMandate();
        if (killSwitches[agent]) revert KillSwitchEnabled();
        if (!approvedFacilitators[agent][facilitator]) {
            emit MandateViolated(agent, "facilitator_not_allowlisted");
            revert FacilitatorNotApproved();
        }

        if (block.timestamp >= mandate.windowResetTime) {
            mandate.currentWindowUsdSpent = 0;
            mandate.windowResetTime = block.timestamp + mandate.windowDuration;
        }

        IPyth.Price memory pythPrice = pythOracle.getPriceNoOlderThan(
            mandate.pythPriceFeedId,
            MAX_PRICE_AGE_SECONDS
        );
        if (pythPrice.price <= 0) revert InvalidPrice();

        uint256 usdValueTransacted = calculateUsdValue(
            tokenAmount,
            token,
            pythPrice
        );

        if (
            mandate.currentWindowUsdSpent + usdValueTransacted >
            mandate.maxUsdSpendPerWindow
        ) {
            emit MandateViolated(agent, "usd_velocity_limit_exceeded");
            revert FiatVelocityLimitExceeded();
        }

        mandate.currentWindowUsdSpent += usdValueTransacted;

        emit MandateExecuted(
            agent,
            token,
            facilitator,
            tokenAmount,
            usdValueTransacted
        );
        return true;
    }

    function calculateUsdValue(
        uint256 tokenAmount,
        address token,
        IPyth.Price memory pythPrice
    ) public view returns (uint256) {
        uint8 tokenDecimals = IERC20Minimal(token).decimals();
        uint256 absolutePrice = uint256(uint64(pythPrice.price));
        uint256 priceScale = 10 ** uint256(uint32(-pythPrice.expo));

        return
            (tokenAmount * absolutePrice * USD_DECIMALS) /
            (priceScale * (10 ** tokenDecimals));
    }
}
