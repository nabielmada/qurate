// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PayAIRouter
 * @dev Smart contract untuk menerima pembayaran dari Qurate Agent secara langsung.
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
     * @notice Mendaftarkan merchant baru dengan alamat dompetnya
     * @param merchantId ID unik string (contoh: "1234")
     * @param wallet Alamat dompet tujuan
     */
    function registerMerchant(string memory merchantId, address wallet) external {
        require(wallet != address(0), "Alamat dompet tidak valid");
        require(merchants[merchantId] == address(0), "Merchant sudah terdaftar");
        
        merchants[merchantId] = wallet;
        emit MerchantRegistered(merchantId, wallet);
    }

    /**
     * @notice Dapatkan alamat penerima bagi merchant ID tertentu
     * @param merchantId ID merchant
     * @return Alamat dompet tujuan
     */
    function getMerchantWallet(string memory merchantId) public view returns (address) {
        return merchants[merchantId];
    }

    /**
     * @notice Lakukan pembayaran token secara langsung ke merchant (ERC20)
     * @param merchantId ID merchant penerima
     * @param token Alamat token ERC20
     * @param amount Jumlah pembayaran
     */
    function payDirect(string memory merchantId, address token, uint256 amount) external {
        address merchantWallet = merchants[merchantId];
        require(merchantWallet != address(0), "Merchant tidak ditemukan");
        require(amount > 0, "Nominal harus > 0");

        IERC20(token).safeTransferFrom(msg.sender, merchantWallet, amount);
        emit PaymentReceived(merchantId, merchantWallet, msg.sender, token, amount);
    }

    /**
     * @notice Lakukan pembayaran Native ETH secara langsung ke merchant
     * @param merchantId ID merchant penerima
     */
    function payNative(string memory merchantId) external payable {
        address merchantWallet = merchants[merchantId];
        require(merchantWallet != address(0), "Merchant tidak ditemukan");
        require(msg.value > 0, "Nominal harus > 0");

        // Kirim Native ETH langsung ke terminal merchant
        (bool success, ) = merchantWallet.call{value: msg.value}("");
        require(success, "Pengiriman ETH gagal");

        emit PaymentReceived(merchantId, merchantWallet, msg.sender, address(0), msg.value);
    }
}
