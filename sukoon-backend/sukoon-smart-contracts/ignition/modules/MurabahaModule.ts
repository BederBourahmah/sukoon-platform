import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MurabahaModule = buildModule("MurabahaModule", (m) => {
  // Get deployment parameters with defaults
  const buyer = m.getParameter("buyer");
  const costPrice = m.getParameter("costPrice", 1000n); // Default 1000 wei
  const profit = m.getParameter("profit", 200n); // Default 200 wei

  // Deploy the Murabaha contract
  const murabaha = m.contract("Murabaha", [buyer, costPrice, profit]);

  return { murabaha };
});

export default MurabahaModule; 