const hre = require("hardhat");

async function main() {
  console.log("Deploying PayAIRouter to Base Sepolia...");

  // Get the Contract Factory
  const PayAIRouter = await hre.ethers.getContractFactory("PayAIRouter");
  
  // Deploy the contract
  const router = await PayAIRouter.deploy();
  await router.waitForDeployment();

  // Retrieve the deployment address
  const address = await router.getAddress();
  console.log(`PayAIRouter successfully deployed to Base Sepolia at: ${address}`);
  console.log(`Verification explorer: https://sepolia.basescan.org/address/${address}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
