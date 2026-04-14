const hre = require("hardhat");

async function main() {
  const contractAddress = "0xB8Be3D8a08fb0D0B3D13E269e537Bb0fFaeA67De";
  const merchantId = "m_gacoan_001";
  const merchantWallet = "0xE7AA73E33a8C99E6842562B4A876534b2503c57C"; // User's own wallet as the merchant for demo

  console.log(`Registering merchant ${merchantId} to ${merchantWallet}...`);

  const router = await hre.ethers.getContractAt("PayAIRouter", contractAddress);
  
  const tx = await router.registerMerchant(merchantId, merchantWallet);
  await tx.wait();

  console.log("Merchant registered successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
