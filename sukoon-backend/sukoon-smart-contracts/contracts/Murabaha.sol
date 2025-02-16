// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Murabaha Contract
 * @dev A smart contract implementing Islamic Murabaha financing structure
 * Murabaha is a cost-plus financing arrangement where the seller explicitly
 * declares the cost of the goods and adds a profit margin to it.
 * 
 * In Islamic finance, this contract ensures:
 * 1. Transparency in cost and profit
 * 2. The asset must exist and be owned by the seller
 * 3. The sale price must be fixed at the beginning
 * 4. The profit margin must be mutually agreed upon
 */
contract Murabaha {
    // State variables for tracking the core participants and financial details
    address public seller;    // Address of the seller/financier
    address public buyer;     // Address of the buyer/customer
    uint256 public costPrice; // Original purchase cost of the asset
    uint256 public profit;    // Agreed-upon profit margin
    uint256 public totalPrice; // Total amount to be paid (costPrice + profit)
    uint256 public remainingBalance; // Outstanding amount to be paid
    bool public contractActive; // Status flag to track if the contract is still active
    
    // Structure to track individual payments with timestamps
    struct Payment {
        uint256 amount;    // Amount paid in this transaction
        uint256 timestamp; // Time when the payment was made
    }
    // Array to maintain a complete history of all payments
    Payment[] public paymentHistory;
    
    // Events to log important contract activities
    // Emitted when a payment is successfully processed
    event PaymentLogged(uint256 amount, uint256 timestamp, uint256 remainingBalance);
    // Emitted when the loan is completely repaid
    event LoanFullyRepaid(uint256 timestamp);

    /**
     * @dev Constructor to initialize the Murabaha contract
     * @param _buyer Address of the buyer/customer
     * @param _costPrice Original cost of the goods/asset
     * @param _profit Profit margin to be added
     * 
     * Notes:
     * - The seller is automatically set to the contract deployer
     * - Total price is calculated as cost plus profit
     * - Contract is activated upon deployment
     */
    constructor(address _buyer, uint256 _costPrice, uint256 _profit) {
        seller = msg.sender;
        buyer = _buyer;
        costPrice = _costPrice;
        profit = _profit;
        totalPrice = _costPrice + _profit;
        remainingBalance = totalPrice;
        contractActive = true;
    }

    /**
     * @dev Function to log a payment made by the buyer
     * @param amount The amount paid in USD (scaled to appropriate decimals)
     * 
     * Requirements:
     * - Only the seller/admin can log payments
     * - Contract must be active
     * - Payment amount cannot exceed remaining balance
     * 
     * Effects:
     * - Reduces the remaining balance
     * - Records payment in history
     * - Deactivates contract if fully paid
     */
    function logPayment(uint256 amount) public {
        require(msg.sender == seller, "Only the platform admin can log payments");
        require(contractActive, "The contract is no longer active");
        require(amount <= remainingBalance, "Payment amount exceeds remaining balance");

        remainingBalance -= amount;
        paymentHistory.push(Payment(amount, block.timestamp));
        
        emit PaymentLogged(amount, block.timestamp, remainingBalance);
        
        if (remainingBalance == 0) {
            contractActive = false;
            emit LoanFullyRepaid(block.timestamp);
        }
    }

    /**
     * @dev Function to get all contract details in a single call
     * @return A tuple containing:
     * - seller: Address of the seller/financier
     * - buyer: Address of the buyer/customer
     * - costPrice: Original cost of the asset
     * - profit: Agreed profit margin
     * - totalPrice: Total amount to be paid
     * - remainingBalance: Outstanding amount
     * - contractActive: Current contract status
     * 
     * This function is useful for frontend applications to fetch
     * all relevant contract information in a single call
     */
    function getContractDetails() public view returns (
        address, address, uint256, uint256, uint256, uint256, bool
    ) {
        return (
            seller,
            buyer,
            costPrice,
            profit,
            totalPrice,
            remainingBalance,
            contractActive
        );
    }

    /**
     * @dev Function to get the complete payment history
     * @return An array of Payment structs containing all recorded payments
     * 
     * This function allows tracking of all payments made towards
     * the Murabaha contract, including amounts and timestamps
     */
    function getPaymentHistory() public view returns (Payment[] memory) {
        return paymentHistory;
    }
}
