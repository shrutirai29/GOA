/**
 * TraceFace — EvidenceRegistry Contract Deployment Script
 *
 * Usage:
 *   npx hardhat run scripts/deploy_contract.js --network localhost
 *   npx hardhat run scripts/deploy_contract.js --network baseSepolia
 *
 * Requires hardhat.config.js in the project root.
 */

const hre = require("hardhat");

async function main() {
  console.log("🔗 TraceFace — EvidenceRegistry Deployment");
  console.log("============================================\n");

  const network = hre.network.name;
  console.log(`📡 Network: ${network}`);

  if (network === "localhost" || network === "hardhat") {
    console.log("⚠️  Deploying to LOCAL demonstration chain\n");
  } else {
    console.log(`🌐 Deploying to PUBLIC testnet: ${network}\n`);
  }

  // Deploy
  console.log("📦 Deploying EvidenceRegistry...");
  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const registry = await EvidenceRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`\n✅ EvidenceRegistry deployed!`);
  console.log(`📍 Contract address: ${address}`);
  console.log(`\n🔧 Update your .env file:`);
  console.log(`   CONTRACT_ADDRESS=${address}`);
  console.log(`\n📋 Verify on explorer (if testnet):`);
  console.log(`   npx hardhat verify --network ${network} ${address}`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
