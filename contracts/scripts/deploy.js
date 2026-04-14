const hre = require("hardhat");

async function main() {
  console.log("Deploying PayAIRouter to Base Sepolia...");

  // Dapatkan Contract Factory
  const PayAIRouter = await hre.ethers.getContractFactory("PayAIRouter");
  
  // Deploy kontrak
  const router = await PayAIRouter.deploy();
  await router.waitForDeployment();

  // Dapatkan alamat hasil deployment
  const address = await router.getAddress();
  console.log(`PayAIRouter berhasil di-deploy di Base Sepolia pada alamat: ${address}`);
  console.log(`Anda dapat melakukan verifikasi di: https://sepolia.basescan.org/address/${address}`);
}

main().catch((error) => {
  console.error("Gagal melakukan deployment:", error);
  process.exitCode = 1;
});
