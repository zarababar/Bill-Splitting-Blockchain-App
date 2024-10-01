// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Splitter {
    address public owner;
    mapping(address => bool) public hasPaid;  // Tracks whether each participant has paid
    mapping(address => uint256) public shares; // Tracks how much each participant should pay

    event BillSplit(address indexed participant, uint256 amountPaid);
    event Withdraw(address indexed to, uint256 amount); // Event for withdrawals
    
    constructor() {
        owner = msg.sender;  // Set the owner to the address that deploys the contract
    }

    // Function to split the bill among participants
    function splitBill(uint256 totalAmount, address[] calldata participants) external {
        require(msg.sender == owner, "Only owner can split the bill");
        uint256 share = totalAmount / participants.length;

        for (uint256 i = 0; i < participants.length; i++) {
            shares[participants[i]] = share;  // Set each participant's share
        }
    }

    // Each participant calls this function to pay their share
    function payShare() external payable {
        require(shares[msg.sender] > 0, "You do not owe anything");
        require(msg.value == shares[msg.sender], "Incorrect payment amount");
        require(!hasPaid[msg.sender], "You have already paid");

        hasPaid[msg.sender] = true; // Mark as paid
        emit BillSplit(msg.sender, msg.value); // Emit event for tracking
        // You may want to implement further logic here, like transferring funds
    }
     // Function to withdraw funds from the contract
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw");
        uint256 balance = address(this).balance; // Get the contract's balance
        require(balance > 0, "No funds to withdraw");

        payable(owner).transfer(balance); // Transfer the balance to the owner
        emit Withdraw(owner, balance); // Emit withdrawal event
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
