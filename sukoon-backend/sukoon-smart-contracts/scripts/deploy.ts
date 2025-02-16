import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const murabaha = await ethers.deployContract("Murabaha", [
    // Example parameters - replace with actual values
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // buyer address
    ethers.parseEther("1.0"), // costPrice: 1 ETH
    ethers.parseEther("0.1")  // profit: 0.1 ETH
  ]);

  await murabaha.waitForDeployment();
  console.log("Murabaha deployed to:", await murabaha.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
