import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Murabaha", function () {
  async function deployMurabahaFixture() {
    // Get signers for different roles
    const [bank, customer, supplier] = await hre.ethers.getSigners();

    // Example values for a Murabaha contract
    const assetValue = hre.ethers.parseEther("10"); // 10 ETH as example asset value
    const profitRate = 10; // 10% profit rate
    const installmentPeriod = 30 * 24 * 60 * 60; // 30 days in seconds
    const totalInstallments = 12; // 1 year payment plan

    // Deploy the contract
    const Murabaha = await hre.ethers.getContractFactory("Murabaha");
    const murabaha = await Murabaha.deploy(
      customer.address,
      supplier.address,
      assetValue,
      profitRate,
      installmentPeriod,
      totalInstallments
    );

    return {
      murabaha,
      bank,
      customer,
      supplier,
      assetValue,
      profitRate,
      installmentPeriod,
      totalInstallments,
    };
  }

  describe("Deployment", function () {
    it("Should set the right bank address", async function () {
      const { murabaha, bank } = await loadFixture(deployMurabahaFixture);
      expect(await murabaha.bank()).to.equal(bank.address);
    });

    it("Should set the right customer address", async function () {
      const { murabaha, customer } = await loadFixture(deployMurabahaFixture);
      expect(await murabaha.customer()).to.equal(customer.address);
    });

    it("Should set the right supplier address", async function () {
      const { murabaha, supplier } = await loadFixture(deployMurabahaFixture);
      expect(await murabaha.supplier()).to.equal(supplier.address);
    });

    it("Should calculate the correct total amount with profit", async function () {
      const { murabaha, assetValue, profitRate } = await loadFixture(
        deployMurabahaFixture
      );
      const expectedTotal = assetValue + (assetValue * BigInt(profitRate)) / 100n;
      expect(await murabaha.totalAmount()).to.equal(expectedTotal);
    });
  });

  describe("Contract States", function () {
    it("Should start in INITIATED state", async function () {
      const { murabaha } = await loadFixture(deployMurabahaFixture);
      expect(await murabaha.state()).to.equal(0); // Assuming 0 is INITIATED
    });

    it("Should move to ASSET_PURCHASED state when supplier confirms", async function () {
      const { murabaha, supplier } = await loadFixture(deployMurabahaFixture);
      await murabaha.connect(supplier).confirmAssetPurchase();
      expect(await murabaha.state()).to.equal(1); // Assuming 1 is ASSET_PURCHASED
    });
  });

  describe("Payments", function () {
    it("Should calculate correct installment amount", async function () {
      const { murabaha, assetValue, profitRate, totalInstallments } =
        await loadFixture(deployMurabahaFixture);
      const totalAmount =
        assetValue + (assetValue * BigInt(profitRate)) / 100n;
      const expectedInstallment = totalAmount / BigInt(totalInstallments);
      expect(await murabaha.installmentAmount()).to.equal(expectedInstallment);
    });

    it("Should allow customer to make installment payment", async function () {
      const { murabaha, customer } = await loadFixture(deployMurabahaFixture);
      const installmentAmount = await murabaha.installmentAmount();

      await expect(
        murabaha.connect(customer).makeInstallmentPayment({ value: installmentAmount })
      ).not.to.be.reverted;
    });

    it("Should fail if installment payment is insufficient", async function () {
      const { murabaha, customer } = await loadFixture(deployMurabahaFixture);
      const installmentAmount = await murabaha.installmentAmount();

      await expect(
        murabaha
          .connect(customer)
          .makeInstallmentPayment({ value: installmentAmount - 1n })
      ).to.be.revertedWith("Insufficient payment amount");
    });
  });

  describe("Contract Completion", function () {
    it("Should mark contract as completed after all payments", async function () {
      const { murabaha, customer } = await loadFixture(deployMurabahaFixture);
      const installmentAmount = await murabaha.installmentAmount();
      const totalInstallments = await murabaha.totalInstallments();

      // Make all payments
      for (let i = 0; i < totalInstallments; i++) {
        await murabaha
          .connect(customer)
          .makeInstallmentPayment({ value: installmentAmount });
        await time.increase(30 * 24 * 60 * 60); // Increase time by 30 days
      }

      expect(await murabaha.state()).to.equal(3); // Assuming 3 is COMPLETED
    });
  });

  describe("Events", function () {
    it("Should emit event on installment payment", async function () {
      const { murabaha, customer } = await loadFixture(deployMurabahaFixture);
      const installmentAmount = await murabaha.installmentAmount();

      await expect(
        murabaha.connect(customer).makeInstallmentPayment({ value: installmentAmount })
      )
        .to.emit(murabaha, "InstallmentPaid")
        .withArgs(customer.address, installmentAmount, 1); // 1 for first installment
    });
  });
}); 