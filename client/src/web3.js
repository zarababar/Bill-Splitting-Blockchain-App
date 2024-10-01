// src/web3.js
import Web3 from 'web3';

// Create a web3 instance
const web3 = new Web3(window.ethereum);

// Define the contract ABI (replace with your actual ABI)
const contractABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
            { "internalType": "address[]", "name": "participants", "type": "address[]" }
        ],
        "name": "splitBill",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "shares",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "hasPaid",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "payShare",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];


// Replace with your deployed contract address
const contractAddress = '0x8C008659b480490d878A7dA0De5453265da3264C';

const contract = new web3.eth.Contract(contractABI, contractAddress);

export { web3, contract };
