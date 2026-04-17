// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PayAIRouter
 * @dev Autonomous Payment Settlement Layer for Qurate AI Agent.
 * Architecture: Direct P2P/P2M (Peer-to-Merchant) settlement system.
 * Security: Non-custodial, event-driven architecture for real-time merchant dashboards.
 */
contract PayAIRouter {
    using SafeERC20 for IERC20;

    mapping(string => address) public merchants;

    event PaymentReceived(
        string merchantId,
        address indexed merchantAddress,
        address indexed sender,
        address token,
        uint256 amount
    );

    event MerchantRegistered(
        string merchantId,
        address wallet
    );

    /**
     * @notice Registers a new merchant with their wallet address
     * @param merchantId Unique string ID (e.g. "1234")
     * @param wallet Destination wallet address
     */
    function registerMerchant(string memory merchantId, address wallet) external {
        require(wallet != address(0), "Invalid wallet address");
        require(merchants[merchantId] == address(0), "Merchant already registered");
        
        merchants[merchantId] = wallet;
        emit MerchantRegistered(merchantId, wallet);
    }

    /**
     * @notice Get settlement address for a specific merchant ID
     * @param merchantId Merchant ID
     * @return Destination wallet address
     */
    function getMerchantWallet(string memory merchantId) public view returns (address) {
        return merchants[merchantId];
    }

    /**
     * @notice Perform direct token payment to merchant (ERC20)
     * @param merchantId Destination merchant ID
     * @param token ERC20 token address
     * @param amount Payment amount
     */
    function payDirect(string memory merchantId, address token, uint256 amount) external {
        address merchantWallet = merchants[merchantId];
        require(merchantWallet != address(0), "Merchant not found");
        require(amount > 0, "Amount must be > 0");

        IERC20(token).safeTransferFrom(msg.sender, merchantWallet, amount);
        emit PaymentReceived(merchantId, merchantWallet, msg.sender, token, amount);
    }

    /**
     * @notice Perform direct Native ETH payment to merchant
     * @param merchantId Destination merchant ID
     */
    function payNative(string memory merchantId) external payable {
        address merchantWallet = merchants[merchantId];
        require(merchantWallet != address(0), "Merchant not found");
        require(msg.value > 0, "Amount must be > 0");

        // Send Native ETH directly to merchant terminal
        (bool success, ) = merchantWallet.call{value: msg.value}("");
        require(success, "ETH transfer failed");

        emit PaymentReceived(merchantId, merchantWallet, msg.sender, address(0), msg.value);
    }
}
